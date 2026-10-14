import { Suspense, useEffect, useMemo, useRef } from "react"
import { useFrame, useLoader, useThree } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { ARCA_ASSETS } from "./assets"
import { NoePlayer } from "./NoePlayer"
import { AnimalBlocks } from "./AnimalBlocks"
import { RampAccess } from "./RampAccess"
import { EnclosureSigns } from "./EnclosureSigns"
import { EnclosureColliders } from "./EnclosureColliders"
import { PlannedEnclosures } from "./PlannedEnclosureWalls"
import { ServiceZones } from "./ServiceZones"
import { HousingFixtures } from "./HousingFixtures"
import { ContainmentPanels } from "./ContainmentPanels"
import {
  ArcaSky,
  ArcaSun,
  createPbrTerrainMaterial,
  createWorldPlanarUvGeometry,
  prepareTerrainTexture,
  RainField,
  TERRAIN_WETNESS,
  type TerrainPbrMaps,
  type ArcaTimeOfDay,
} from "./ArcaEnvironment"
import { TerrainDetails } from "./TerrainDetails"

interface ArcaSceneProps {
  birds?: boolean
  doorOpen: boolean
  paused: boolean
  timeOfDay?: ArcaTimeOfDay
  rainEnabled?: boolean
  onInteract?: () => void
  onNearDoor?: (near: boolean) => void
}

interface PreparedArca {
  root: THREE.Group
  doorPivot: THREE.Object3D
  materials: Map<THREE.Material, THREE.MeshStandardMaterial>
}

function prepareStaticMeshes(root: THREE.Object3D, castShadow: boolean) {
  root.traverse((object) => {
    if (!(object as THREE.Mesh).isMesh) return
    const mesh = object as THREE.Mesh
    mesh.castShadow = castShadow
    mesh.receiveShadow = true
  })
}

function ArcaModel({ doorOpen, paused }: ArcaSceneProps) {
  const { gl } = useThree()
  const gltf = useLoader(GLTFLoader, ARCA_ASSETS.arca)
  const prepared = useMemo<PreparedArca>(() => {
    const root = gltf.scene.clone(true)
    prepareStaticMeshes(root, true)
    // glTF defaults unassigned materials to metallic white. Interior floors
    // have no assigned material, while the procedural wood lost its color.
    const materials = new Map<THREE.Material, THREE.MeshStandardMaterial>()
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return
      const convert = (source: THREE.Material) => {
        let material = materials.get(source)
        if (!material) {
          const joint = /Juntas/i.test(source.name)
          const metal = /Fixacao/i.test(source.name)
          material = new THREE.MeshStandardMaterial({
            name: source.name || "Madeira_Interior_Runtime",
            color: joint ? "#38291e" : metal ? "#716356" : "#89613e",
            roughness: metal ? 0.75 : 0.9,
            metalness: metal ? 0.15 : 0,
            side: THREE.DoubleSide,
          })
          materials.set(source, material)
        }
        return material
      }
      object.material = Array.isArray(object.material)
        ? object.material.map(convert) : convert(object.material)
    })

    const doorPivot = root.getObjectByName("PORTA_ARCA_DOBRADICA_ANIMADA")
    if (!doorPivot) throw new Error("O modelo exportado não contém a dobradiça da porta.")

    return { root, doorPivot, materials }
  }, [gltf.scene])

  useEffect(() => () => {
    prepared.materials.forEach(material => material.dispose())
  }, [prepared])

  useEffect(() => { gl.shadowMap.needsUpdate = true }, [gl, prepared])

  useFrame((_, delta) => {
    if (paused) return
    const target = doorOpen ? -Math.PI / 2 : 0
    if (Math.abs(prepared.doorPivot.rotation.y - target) < 0.001) return
    gl.shadowMap.needsUpdate = true
    const blend = 1 - Math.exp(-delta * 5)
    prepared.doorPivot.rotation.y = THREE.MathUtils.lerp(
      prepared.doorPivot.rotation.y,
      target,
      blend,
    )
  })

  return <primitive object={prepared.root} dispose={null} />
}

function InteriorModel() {
  const gltf = useLoader(GLTFLoader, ARCA_ASSETS.interior)
  const root = useMemo(() => {
    const clone = gltf.scene.clone(true)
    const legacyEnclosure = /^(?:INF|MED|SUP)-(?:BB|BE)-\d{2}__/
    clone.traverse(object => {
      if (!legacyEnclosure.test(object.name)) return
      object.visible = false
      object.userData.noCollision = true
    })
    prepareStaticMeshes(clone, false)
    return clone
  }, [gltf.scene])
  return <primitive object={root} dispose={null} />
}

function TerrainModel() {
  const { gl } = useThree()
  const gltf = useLoader(GLTFLoader, ARCA_ASSETS.terrain)
  const textureUrls = useMemo(() => Object.values(ARCA_ASSETS.terrainTextures), [])
  const loadedTextures = useLoader(THREE.TextureLoader, textureUrls)
  const maps = useMemo(() => {
    const anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 8)
    loadedTextures.forEach((texture, index) => prepareTerrainTexture(texture, index === 0 || index === 3, anisotropy))
    return {
      grass: { albedo: loadedTextures[0], normal: loadedTextures[1], arm: loadedTextures[2] } satisfies TerrainPbrMaps,
      mud: { albedo: loadedTextures[3], normal: loadedTextures[4], arm: loadedTextures[5] } satisfies TerrainPbrMaps,
    }
  }, [gl, loadedTextures])
  const prepared = useMemo(() => {
    const clone = gltf.scene.clone(true)
    clone.updateMatrixWorld(true)
    const materials = new Map<string, THREE.MeshStandardMaterial>()
    const mappedGeometries: THREE.BufferGeometry[] = []
    const materialFor = (category: string, color: string, roughness: number, metalness = 0) => {
      let material = materials.get(category)
      if (!material) {
        material = new THREE.MeshStandardMaterial({
          name: `Terreno_${category}_Runtime`,
          color,
          roughness,
          metalness,
          side: THREE.DoubleSide,
        })
      }
      materials.set(category, material)
      return material
    }
    const groundMaterialFor = (category: string, maps: TerrainPbrMaps, tint: string) => {
      let material = materials.get(category)
      if (!material) {
        material = createPbrTerrainMaterial(`Terreno_${category}_PBR_Runtime`, maps, tint)
        materials.set(category, material)
      }
      return material
    }

    clone.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return
      const name = object.name
      if (/^TREE_.*(?:Copa|Tronco)/i.test(name)) {
        // TerrainDetails batches these 380 source parts into two animated draws.
        object.visible = false
        object.userData.noCollision = true
        return
      }
      if (/^Rocha_Boulder_/i.test(name)) {
        // These authored Blender placements are batched by TerrainDetails.
        // Keep their source nodes hidden so the game renders each boulder once.
        object.visible = false
        object.userData.noCollision = true
        return
      }
      if (/^Agua_Corrente/i.test(name)) {
        object.material = materialFor("agua", "#4e7f82", .2, .05)
      } else if (/^Terrain_/i.test(name)) {
        object.geometry = createWorldPlanarUvGeometry(object, 2.5)
        mappedGeometries.push(object.geometry)
        object.material = groundMaterialFor("grama", maps.grass, "#ffffff")
      } else if (/Rocha/i.test(name)) {
        object.material = materialFor("rocha", "#6d6b60", .96)
      } else if (/Grama|Vegetacao|Mato/i.test(name)) {
        object.material = materialFor("grama", "#5d784c", 1)
      } else if (/Circuito|Patio|Solo|Barro|Terra/i.test(name)) {
        object.geometry = createWorldPlanarUvGeometry(object, 1.3)
        mappedGeometries.push(object.geometry)
        object.material = groundMaterialFor("barro-canteiro", maps.mud, "#ffffff")
      } else if (/Ponte|Passarela|Estrada|Tabua/i.test(name)) {
        object.material = materialFor("madeira-externa", "#806042", .92)
      } else {
        object.material = materialFor("apoio", "#776148", .94)
      }
      object.castShadow = /Rocha|Abrigo|Oficina|Cavalete|Copa|Tronco/i.test(name)
      object.receiveShadow = true
    })
    return { root: clone, materials, mappedGeometries }
  }, [gltf.scene, maps])

  useEffect(() => () => {
    prepared.materials.forEach(material => material.dispose())
    prepared.mappedGeometries.forEach(geometry => geometry.dispose())
  }, [prepared])

  return <primitive object={prepared.root} dispose={null} />
}

function ArcaCamera() {
  const { camera, gl } = useThree()
  const gltf = useLoader(GLTFLoader, ARCA_ASSETS.arca)

  useEffect(() => {
    const perspective = camera as THREE.PerspectiveCamera
    const bounds = new THREE.Box3().setFromObject(gltf.scene)
    const sphere = bounds.getBoundingSphere(new THREE.Sphere())
    const controls = new OrbitControls(camera, gl.domElement)
    controls.enableDamping = true
    controls.dampingFactor = .07
    controls.rotateSpeed = .58
    controls.zoomSpeed = .7
    controls.target.copy(sphere.center)
    controls.minDistance = 3
    controls.maxDistance = sphere.radius * 10
    controls.minPolarAngle = .25
    controls.maxPolarAngle = Math.PI / 2 - 0.02
    perspective.fov = 46
    const halfFov = Math.min(THREE.MathUtils.degToRad(23), Math.atan(Math.tan(THREE.MathUtils.degToRad(23)) * perspective.aspect))
    const distance = sphere.radius / Math.sin(halfFov) * 1.1
    perspective.position.copy(sphere.center).add(new THREE.Vector3(-1, 0.55, 1).normalize().multiplyScalar(distance))
    perspective.near = 0.1
    perspective.far = sphere.radius * 30
    controls.update()
    perspective.updateProjectionMatrix()
    return () => controls.dispose()
  }, [camera, gl, gltf.scene])

  return null
}

const LIGHTING_PRESETS = {
  day: {
    fog: new THREE.Color("#9ca99c"), sky: new THREE.Color("#d9e7f0"), ground: new THREE.Color("#5a5142"),
    ambient: new THREE.Color("#ffffff"), sun: new THREE.Color("#fff0d5"), ambientPower: .72, hemiPower: 1.18,
    sunPower: 2.05, exposure: 1.08, fogFar: 560, sunPosition: new THREE.Vector3(-120, 190, 150),
  },
  sunset: {
    fog: new THREE.Color("#a66f5b"), sky: new THREE.Color("#efb08c"), ground: new THREE.Color("#49372f"),
    ambient: new THREE.Color("#e7a47d"), sun: new THREE.Color("#ffbd88"), ambientPower: .52, hemiPower: .86,
    sunPower: 1.15, exposure: 1.0, fogFar: 470, sunPosition: new THREE.Vector3(150, 48, -190),
  },
  night: {
    fog: new THREE.Color("#313d4c"), sky: new THREE.Color("#8191ad"), ground: new THREE.Color("#252c34"),
    ambient: new THREE.Color("#8793aa"), sun: new THREE.Color("#a7b8d6"), ambientPower: .3, hemiPower: .48,
    sunPower: .22, exposure: .78, fogFar: 390, sunPosition: new THREE.Vector3(-120, 100, 150),
  },
} as const

const RAIN_FOG = new THREE.Color("#707a80")

function ArcaLighting({ timeOfDay, rainEnabled, paused }: {
  timeOfDay: ArcaTimeOfDay
  rainEnabled: boolean
  paused: boolean
}) {
  const { gl } = useThree()
  const ambient = useRef<THREE.AmbientLight>(null)
  const hemisphere = useRef<THREE.HemisphereLight>(null)
  const sun = useRef<THREE.DirectionalLight>(null)
  const fog = useRef<THREE.Fog>(null)
  useEffect(() => {
    const previous = gl.shadowMap.autoUpdate
    const previousToneMapping = gl.toneMapping
    const previousExposure = gl.toneMappingExposure
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.08
    return () => {
      gl.shadowMap.autoUpdate = previous
      gl.toneMapping = previousToneMapping
      gl.toneMappingExposure = previousExposure
    }
  }, [gl])
  useEffect(() => { gl.shadowMap.needsUpdate = true }, [gl, timeOfDay])
  useFrame((_, delta) => {
    const target = LIGHTING_PRESETS[timeOfDay]
    const blend = 1 - Math.exp(-delta * 1.35)
    const weatherFactor = rainEnabled ? .76 : 1
    TERRAIN_WETNESS.value = THREE.MathUtils.damp(TERRAIN_WETNESS.value, rainEnabled ? .78 : 0, 1.1, delta)
    ambient.current?.color.lerp(target.ambient, blend)
    if (ambient.current) ambient.current.intensity = THREE.MathUtils.damp(ambient.current.intensity, target.ambientPower * (rainEnabled ? .86 : 1), 1.5, delta)
    if (hemisphere.current) {
      hemisphere.current.color.lerp(target.sky, blend)
      hemisphere.current.groundColor.lerp(target.ground, blend)
      hemisphere.current.intensity = THREE.MathUtils.damp(hemisphere.current.intensity, target.hemiPower * (rainEnabled ? .84 : 1), 1.5, delta)
    }
    if (sun.current) {
      sun.current.color.lerp(target.sun, blend)
      sun.current.position.lerp(target.sunPosition, blend)
      sun.current.intensity = THREE.MathUtils.damp(sun.current.intensity, target.sunPower * weatherFactor, 1.5, delta)
    }
    if (fog.current) {
      fog.current.color.lerp(rainEnabled ? RAIN_FOG : target.fog, blend)
      fog.current.far = THREE.MathUtils.damp(fog.current.far, rainEnabled ? 330 : target.fogFar, 1.2, delta)
    }
    gl.toneMappingExposure = THREE.MathUtils.damp(gl.toneMappingExposure, target.exposure * (rainEnabled ? .91 : 1), 1.5, delta)
  })
  return (
    <>
      <ArcaSky timeOfDay={timeOfDay} rainEnabled={rainEnabled} paused={paused} />
      <ArcaSun timeOfDay={timeOfDay} />
      <RainField enabled={rainEnabled} paused={paused} />
      <fog ref={fog} attach="fog" args={["#9ca99c", 150, 560]} />
      <ambientLight ref={ambient} intensity={.72} />
      <hemisphereLight ref={hemisphere} args={["#d9e7f0", "#5a5142", 1.18]} />
      <directionalLight
        ref={sun}
        castShadow
        intensity={2.05}
        position={[-120, 190, 150]}
        shadow-mapSize-width={1536}
        shadow-mapSize-height={1536}
        shadow-camera-left={-240}
        shadow-camera-right={240}
        shadow-camera-top={240}
        shadow-camera-bottom={-240}
        shadow-camera-near={1}
        shadow-camera-far={520}
        shadow-bias={-0.00018}
        shadow-normalBias={0.025}
        shadow-radius={3}
      />
    </>
  )
}

export function ArcaScene({ doorOpen, paused, onInteract, onNearDoor, birds, timeOfDay = "day", rainEnabled = false }: ArcaSceneProps) {
  return (
    <>
      <ArcaLighting timeOfDay={timeOfDay} rainEnabled={rainEnabled} paused={paused} />
      <Suspense fallback={null}>
        {onInteract && onNearDoor
          ? <NoePlayer paused={paused} onInteract={onInteract} onNearDoor={onNearDoor} birds={birds} />
          : <ArcaCamera />}
        <TerrainModel />
        <TerrainDetails paused={paused} />
        <ArcaModel doorOpen={doorOpen} paused={paused} />
        <InteriorModel />
        <AnimalBlocks />
        <PlannedEnclosures />
        <ContainmentPanels />
        <HousingFixtures />
        <ServiceZones />
        <EnclosureSigns />
        <EnclosureColliders />
        <RampAccess />
      </Suspense>
    </>
  )
}
