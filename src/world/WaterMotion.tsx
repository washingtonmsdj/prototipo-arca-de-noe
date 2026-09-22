import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { waterfallTurbulence } from "../pilgrimage/world/waterfall-turbulence"
import { SHORE_CORNERS, shorelineCorners } from "../pilgrimage/world/shoreline"
import {
  GENERATED_ELEVATION,
  GENERATED_HYDROLOGY,
  GENERATED_WATER,
  HEIGHT_SCALE,
  SHORELINE_FIELD,
  WORLD_TILE_SIZE,
  WORLD_TILES,
  tileToWorld,
} from "./terrain"

function createMotionGeometry() {
  const positions: number[] = []
  const uv: number[] = []
  const strength: number[] = []
  const flow: number[] = []
  const falling: number[] = []

  const field = waterfallTurbulence(
    GENERATED_HYDROLOGY,
    WORLD_TILES * WORLD_TILES,
    GENERATED_ELEVATION.settings.turbulenceReach,
  )

  const cornerX = [0, 1, 0, 1] as const
  const cornerZ = [0, 0, 1, 1] as const
  const cornerUv = [[0, 0], [1, 0], [0, 1], [1, 1]] as const

  const geometricCorner = (shoreIndex: number) => {
    const [dx, dz] = SHORE_CORNERS[shoreIndex]
    return (dx > 0 ? 1 : 0) + (dz > 0 ? 2 : 0)
  }

  const waterHeightAtVertex = (vertexX: number, vertexZ: number) => {
    const samples: number[] = []
    for (let dz = -1; dz <= 0; dz++) for (let dx = -1; dx <= 0; dx++) {
      const x = vertexX + dx
      const z = vertexZ + dz
      if (x < 0 || z < 0 || x >= WORLD_TILES || z >= WORLD_TILES) continue
      const index = z * WORLD_TILES + x
      if (GENERATED_WATER.kind[index]) samples.push(GENERATED_HYDROLOGY.surface[index])
    }
    return (samples.length ? samples.reduce((sum, value) => sum + value, 0) / samples.length : 0) * HEIGHT_SCALE + .018
  }

  const pushTriangle = (
    points: readonly [number, number, number][],
    uvs: readonly (readonly [number, number])[],
    intensity: number,
    direction: readonly [number, number],
    fall: number,
  ) => {
    points.forEach((point, index) => {
      positions.push(...point)
      uv.push(...uvs[index])
      strength.push(intensity)
      flow.push(direction[0], direction[1])
      falling.push(fall)
    })
  }

  const pushCornerTriangle = (
    tileX: number,
    tileZ: number,
    cornerIds: readonly [number, number, number],
    heights: (vertexX: number, vertexZ: number) => number,
    intensity: number,
    direction: readonly [number, number],
  ) => {
    const points = cornerIds.map((corner) => {
      const vertexX = tileX + cornerX[corner]
      const vertexZ = tileZ + cornerZ[corner]
      return [
        (vertexX - WORLD_TILES / 2) * WORLD_TILE_SIZE,
        heights(vertexX, vertexZ),
        (vertexZ - WORLD_TILES / 2) * WORLD_TILE_SIZE,
      ] as [number, number, number]
    })
    const uvs = cornerIds.map((corner) => cornerUv[corner])
    pushTriangle(points, uvs, intensity, direction, 0)
  }

  const pushQuad = (
    a: readonly [number, number, number],
    b: readonly [number, number, number],
    c: readonly [number, number, number],
    d: readonly [number, number, number],
    intensity: number,
    direction: readonly [number, number],
    fall: number,
  ) => {
    const points = [a, b, c, c, b, d]
    const uvs = [[0, 0], [1, 0], [0, 1], [0, 1], [1, 0], [1, 1]]
    points.forEach((point, index) => {
      positions.push(...point)
      uv.push(...uvs[index])
      strength.push(intensity)
      flow.push(direction[0], direction[1])
      falling.push(fall)
    })
  }

  for (let z = 0; z < WORLD_TILES; z++) for (let x = 0; x < WORLD_TILES; x++) {
    const index = z * WORLD_TILES + x
    const flags = shorelineCorners(SHORELINE_FIELD, x, z)
    const shoreIndex = flags.findIndex(Boolean)
    const wet = !!GENERATED_WATER.kind[index]
    if (!wet && shoreIndex < 0) continue

    const donorIndex = wet
      ? index
      : z * WORLD_TILES + x + SHORE_CORNERS[shoreIndex][0]
    const centre = tileToWorld(x, z)
    const half = WORLD_TILE_SIZE * .5
    const surface = GENERATED_HYDROLOGY.surface[donorIndex] * HEIGHT_SCALE + .018
    const turbulence = field[donorIndex * 3]
    const heading = GENERATED_HYDROLOGY.flow[donorIndex]
      ?? [field[donorIndex * 3 + 1], field[donorIndex * 3 + 2]]
    const base = GENERATED_HYDROLOGY.motion[donorIndex] === "flow" ? .18 : .055
    const intensity = Math.max(base, turbulence)

    if (shoreIndex < 0) {
      pushQuad(
        [centre.x - half, surface, centre.z - half],
        [centre.x + half, surface, centre.z - half],
        [centre.x - half, surface, centre.z + half],
        [centre.x + half, surface, centre.z + half],
        intensity,
        heading,
        0,
      )
    } else {
      const corner = geometricCorner(shoreIndex)
      pushCornerTriangle(
        x,
        z,
        wet
          ? [corner ^ 3, corner ^ 1, corner ^ 2]
          : [corner, corner ^ 1, corner ^ 2],
        wet ? () => surface : waterHeightAtVertex,
        intensity,
        heading,
      )
    }

    if (!wet) continue

    const downstream = GENERATED_HYDROLOGY.downstream[index]
    if (
      GENERATED_HYDROLOGY.motion[index] !== "waterfall"
      || downstream < 0
      || !GENERATED_HYDROLOGY.flow[index]
    ) continue

    const [dx, dz] = GENERATED_HYDROLOGY.flow[index]
    const lower = GENERATED_HYDROLOGY.surface[downstream] * HEIGHT_SCALE + .018
    const edgeX = centre.x + dx * half
    const edgeZ = centre.z + dz * half
    const acrossX = -dz * half
    const acrossZ = dx * half

    pushQuad(
      [edgeX - acrossX, surface, edgeZ - acrossZ],
      [edgeX + acrossX, surface, edgeZ + acrossZ],
      [edgeX - acrossX, lower, edgeZ - acrossZ],
      [edgeX + acrossX, lower, edgeZ + acrossZ],
      1,
      [dx, dz],
      1,
    )
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
  geometry.setAttribute("aStrength", new THREE.Float32BufferAttribute(strength, 1))
  geometry.setAttribute("aFlow", new THREE.Float32BufferAttribute(flow, 2))
  geometry.setAttribute("aFall", new THREE.Float32BufferAttribute(falling, 1))
  geometry.computeBoundingSphere()
  return geometry
}

export function WaterMotion() {
  const material = useRef<THREE.ShaderMaterial>(null)
  const geometry = useMemo(() => createMotionGeometry(), [])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_, delta) => {
    if (material.current) material.current.uniforms.time.value += Math.min(delta, .1)
  })

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    currentSpeed: { value: GENERATED_ELEVATION.settings.turbulenceSpeed },
    foam: { value: GENERATED_ELEVATION.settings.foam },
  }), [])

  return (
    <mesh geometry={geometry} frustumCulled={false} renderOrder={2}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        vertexShader={`
          attribute float aStrength;
          attribute vec2 aFlow;
          attribute float aFall;
          varying float vStrength;
          varying vec2 vFlow;
          varying float vFall;
          varying vec2 vUv;
          varying vec2 vWorld;

          void main() {
            vStrength = aStrength;
            vFlow = aFlow;
            vFall = aFall;
            vUv = uv;
            vWorld = position.xz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform float currentSpeed;
          uniform float foam;
          varying float vStrength;
          varying vec2 vFlow;
          varying float vFall;
          varying vec2 vUv;
          varying vec2 vWorld;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
          }

          void main() {
            vec2 direction = length(vFlow) > 0.01 ? normalize(vFlow) : vec2(1.0, 0.0);
            vec2 across = vec2(-direction.y, direction.x);
            float along = dot(vWorld, direction) - time * currentSpeed;
            float cross = dot(vWorld, across);

            if (vFall > 0.5) {
              float streak = noise(vec2(vUv.x * 16.0, vUv.y * 22.0 - time * 7.0));
              float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(0.0, 0.12, 1.0 - vUv.x);
              float alpha = edge * (0.18 + foam * smoothstep(0.38, 0.78, streak));
              gl_FragColor = vec4(0.86, 0.95, 0.98, alpha);
              return;
            }

            float ripple = noise(vec2(along * 5.0, cross * 13.0));
            float fleck = smoothstep(0.66, 0.9, ripple);
            float alpha = 0.018 + vStrength * (0.035 + fleck * 0.22);
            vec3 color = mix(vec3(0.68, 0.86, 0.92), vec3(0.92, 0.98, 1.0), fleck * vStrength);
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  )
}
