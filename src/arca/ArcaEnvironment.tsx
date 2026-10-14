import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

export type ArcaTimeOfDay = "day" | "sunset" | "night"

const SKY_PALETTES: Record<ArcaTimeOfDay, { top: THREE.Color; horizon: THREE.Color; ground: THREE.Color; cloud: THREE.Color; stars: number }> = {
  day: { top: new THREE.Color("#527492"), horizon: new THREE.Color("#c7c7a6"), ground: new THREE.Color("#7e806f"), cloud: new THREE.Color("#f0e7d4"), stars: 0 },
  sunset: { top: new THREE.Color("#514b68"), horizon: new THREE.Color("#d38762"), ground: new THREE.Color("#725444"), cloud: new THREE.Color("#f1b18a"), stars: 0.12 },
  night: { top: new THREE.Color("#101a31"), horizon: new THREE.Color("#394557"), ground: new THREE.Color("#232d35"), cloud: new THREE.Color("#87909a"), stars: 1 },
}
const RAIN_CLOUD = new THREE.Color("#89939b")
const SUN_DAY = new THREE.Vector3(135, 165, -210)
const SUNSET_DIRECTION = new THREE.Vector3(150, 45, -190)
const SUNSET_POSITION = new THREE.Vector3(205, 43, -170)
const DAY_POSITION = new THREE.Vector3(135, 165, -210)
export const TERRAIN_WETNESS = { value: 0 }

export interface TerrainPbrMaps {
  albedo: THREE.Texture
  normal: THREE.Texture
  arm: THREE.Texture
}

export function prepareTerrainTexture(texture: THREE.Texture, isColor: boolean, anisotropy: number) {
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace
  texture.anisotropy = anisotropy
  texture.generateMipmaps = true
  texture.needsUpdate = true
}

export function createPbrTerrainMaterial(name: string, maps: TerrainPbrMaps, tint = "#ffffff") {
  const material = new THREE.MeshStandardMaterial({
    name,
    color: tint,
    map: maps.albedo,
    normalMap: maps.normal,
    roughnessMap: maps.arm,
    aoMap: maps.arm,
    aoMapIntensity: 0.42,
    roughness: 0.96,
    metalness: 0,
    side: THREE.DoubleSide,
  })
  material.normalScale.set(0.52, 0.52)
  material.onBeforeCompile = shader => {
    shader.uniforms.terrainWetness = TERRAIN_WETNESS
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float terrainWetness;",
      )
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\ndiffuseColor.rgb *= 1.0 - terrainWetness * 0.12;",
      )
      .replace(
        "#include <roughnessmap_fragment>",
        "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, min(roughnessFactor, 0.54), terrainWetness * 0.7);",
      )
  }
  material.customProgramCacheKey = () => "terrain-pbr-wet-v1"
  return material
}

export function createWorldPlanarUvGeometry(mesh: THREE.Mesh, tileMeters: number) {
  const geometry = mesh.geometry.clone()
  const positions = geometry.getAttribute("position")
  const uv = new Float32Array(positions.count * 2)
  const worldPosition = new THREE.Vector3()
  for (let index = 0; index < positions.count; index++) {
    worldPosition.fromBufferAttribute(positions, index).applyMatrix4(mesh.matrixWorld)
    uv[index * 2] = worldPosition.x / tileMeters
    uv[index * 2 + 1] = worldPosition.z / tileMeters
  }
  const uvAttribute = new THREE.BufferAttribute(uv, 2)
  geometry.setAttribute("uv", uvAttribute)
  geometry.setAttribute("uv2", uvAttribute.clone())
  return geometry
}

const skyVertex = /* glsl */ `
  varying vec3 vSkyDirection;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vSkyDirection = mat3(modelMatrix) * position;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const skyFragment = /* glsl */ `
  uniform vec3 topColor;
  uniform vec3 horizonColor;
  uniform vec3 groundColor;
  uniform vec3 cloudColor;
  uniform vec3 sunDirection;
  uniform vec2 cloudOffset;
  uniform float cloudCoverage;
  uniform float starAmount;
  varying vec3 vSkyDirection;
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise21(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }
  void main() {
    vec3 direction = normalize(vSkyDirection);
    float height = direction.y;
    float upper = smoothstep(-0.02, 0.58, height);
    float lower = smoothstep(-0.38, 0.08, height);
    vec3 sky = mix(groundColor, horizonColor, lower);
    sky = mix(sky, topColor, upper);

    vec2 cloudUv = direction.xz / max(0.22, direction.y + 0.2) * 3.7 + cloudOffset;
    vec2 cloudWarp = vec2(
      noise21(cloudUv * 0.48 + vec2(8.1, 2.7)),
      noise21(cloudUv * 0.48 + vec2(17.4, 11.2))
    ) - 0.5;
    vec2 cloudShapeUv = cloudUv + cloudWarp * 0.72;
    float cloudBase = noise21(cloudShapeUv) * 0.67
      + noise21(cloudShapeUv * 2.2 + vec2(13.7, 8.3)) * 0.23
      + noise21(cloudShapeUv * 5.1 + vec2(4.2, 19.1)) * 0.10;
    float cloudMask = smoothstep(0.69 - cloudCoverage * 0.21, 0.85 - cloudCoverage * 0.20, cloudBase)
      * smoothstep(0.025, 0.14, height)
      * (1.0 - smoothstep(0.47, 0.68, height));
    float sunlit = max(0.0, dot(direction, normalize(sunDirection)));
    vec3 litCloud = cloudColor * (0.48 + sunlit * 0.52);
    sky = mix(sky, litCloud, cloudMask * 0.58);
    vec2 starUv = floor(direction.xz / max(0.035, direction.y) * 170.0);
    float stars = step(0.9978, hash21(starUv)) * smoothstep(0.08, 0.32, height);
    sky += vec3(0.72, 0.8, 1.0) * stars * starAmount * (1.0 - cloudMask * 0.85);
    gl_FragColor = vec4(sky, 1.0);
  }
`

export function ArcaSky({ timeOfDay, rainEnabled, paused = false }: {
  timeOfDay: ArcaTimeOfDay
  rainEnabled: boolean
  paused?: boolean
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const skyRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color("#527492") },
      horizonColor: { value: new THREE.Color("#c7c7a6") },
      groundColor: { value: new THREE.Color("#7e806f") },
      cloudColor: { value: new THREE.Color("#f0e7d4") },
      sunDirection: { value: SUN_DAY.clone() },
      cloudOffset: { value: new THREE.Vector2() },
      cloudCoverage: { value: 0.36 },
      starAmount: { value: 0 },
    },
    vertexShader: skyVertex,
    fragmentShader: skyFragment,
    side: THREE.BackSide,
    depthWrite: false,
  }), [])

  useFrame((_, delta) => {
    skyRef.current?.position.copy(camera.position)
    const uniforms = materialRef.current?.uniforms
    if (!uniforms) return
    const palette = SKY_PALETTES[timeOfDay]
    const blend = 1 - Math.exp(-delta * 1.6)
    uniforms.topColor.value.lerp(palette.top, blend)
    uniforms.horizonColor.value.lerp(palette.horizon, blend)
    uniforms.groundColor.value.lerp(palette.ground, blend)
    uniforms.cloudColor.value.lerp(rainEnabled ? RAIN_CLOUD : palette.cloud, blend)
    uniforms.starAmount.value = THREE.MathUtils.damp(uniforms.starAmount.value, palette.stars, 1.4, delta)
    uniforms.cloudCoverage.value = THREE.MathUtils.damp(uniforms.cloudCoverage.value, rainEnabled ? 0.82 : 0.34, 1.1, delta)
    if (!paused) {
      uniforms.cloudOffset.value.x = (uniforms.cloudOffset.value.x + delta * (rainEnabled ? 0.052 : 0.034)) % 4096
      uniforms.cloudOffset.value.y = (uniforms.cloudOffset.value.y + delta * (rainEnabled ? 0.008 : 0.005)) % 4096
    }
    uniforms.sunDirection.value.lerp(timeOfDay === "sunset" ? SUNSET_DIRECTION : SUN_DAY, blend).normalize()
  })

  return <mesh ref={skyRef} name="Ceu_Procedural_Runtime" renderOrder={-10}>
    <sphereGeometry args={[900, 32, 16]} />
    <primitive ref={materialRef} object={material} attach="material" />
  </mesh>
}

export function ArcaSun({ timeOfDay }: { timeOfDay: ArcaTimeOfDay }) {
  const sunRef = useRef<THREE.Mesh>(null)
  const moonRef = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    const blend = 1 - Math.exp(-delta * 1.6)
    if (sunRef.current) {
      sunRef.current.position.lerp(timeOfDay === "sunset" ? SUNSET_POSITION : DAY_POSITION, blend)
      const material = sunRef.current.material as THREE.MeshBasicMaterial
      const opacity = timeOfDay === "night" ? 0 : timeOfDay === "sunset" ? 0.94 : 0.82
      material.opacity = THREE.MathUtils.damp(material.opacity, opacity, 1.6, delta)
    }
    if (moonRef.current) {
      const material = moonRef.current.material as THREE.MeshBasicMaterial
      material.opacity = THREE.MathUtils.damp(material.opacity, timeOfDay === "night" ? 0.84 : 0, 1.6, delta)
    }
  })
  return <>
    <mesh
      ref={sunRef}
      name="Sol_Atmosferico_Runtime"
      position={[135, 165, -210]}
      scale={[1, 1, .35]}
      renderOrder={-5}
    >
      <sphereGeometry args={[13, 20, 12]} />
      <meshBasicMaterial color="#fff0bd" transparent opacity={.82} depthWrite={false} />
    </mesh>
    <mesh ref={moonRef} name="Lua_Atmosferica_Runtime" position={[-145, 115, 180]} scale={[1, 1, .35]} renderOrder={-5}>
      <sphereGeometry args={[8, 18, 12]} />
      <meshBasicMaterial color="#d9e4f1" transparent opacity={0} depthWrite={false} />
    </mesh>
  </>
}

function fractional(value: number) { return value - Math.floor(value) }

export function RainField({ enabled, paused = false }: { enabled: boolean; paused?: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const dropsRef = useRef<THREE.InstancedMesh>(null)
  const { camera } = useThree()
  const count = 480
  const states = useMemo(() => Array.from({ length: count }, (_, index) => ({
    x: fractional(Math.sin(index * 127.1) * 43758.5453) * 58 - 29,
    y: (index * 17.73) % 34 - 9,
    z: fractional(Math.sin(index * 269.5 + 2) * 24634.6345) * 58 - 29,
    speed: 18 + (index % 11) * 1.15,
  })), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, delta) => {
    const group = groupRef.current
    const drops = dropsRef.current
    if (!group || !drops) return
    const insideArk = camera.position.x > -66 && camera.position.x < 66
      && camera.position.y < 14.5 && Math.abs(camera.position.z) < 11.2
    group.visible = enabled && !insideArk
    if (!enabled || paused || insideArk) return
    group.position.copy(camera.position)
    const dt = Math.min(delta, 0.05)
    states.forEach((drop, index) => {
      drop.y -= drop.speed * dt
      if (drop.y < -12) drop.y = 25 + ((index * 7.91) % 15)
      drop.x += dt * 0.65
      if (drop.x > 29) drop.x -= 58
      dummy.position.set(drop.x, drop.y, drop.z)
      dummy.rotation.set(0, 0, -0.12)
      dummy.scale.set(0.022, 0.25 + (index % 5) * 0.045, 0.022)
      dummy.updateMatrix()
      drops.setMatrixAt(index, dummy.matrix)
    })
    drops.instanceMatrix.needsUpdate = true
  })

  return <group ref={groupRef} name="Chuva_Runtime" visible={false} userData={{ noCollision: true }}>
    <instancedMesh ref={dropsRef} args={[undefined, undefined, count]} frustumCulled={false} renderOrder={2}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#cad8df" transparent opacity={0.48} depthWrite={false} />
    </instancedMesh>
  </group>
}
