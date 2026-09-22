import { Suspense, useEffect, useMemo } from "react"
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
import { EnclosurePartitions } from "./EnclosurePartitions"

interface ArcaSceneProps {
  birds?: boolean
  doorOpen: boolean
  paused: boolean
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
    prepareStaticMeshes(clone, false)
    return clone
  }, [gltf.scene])
  return <primitive object={root} dispose={null} />
}

function TerrainModel() {
  const gltf = useLoader(GLTFLoader, ARCA_ASSETS.terrain)
  const root = useMemo(() => {
    const clone = gltf.scene.clone(true)
    prepareStaticMeshes(clone, false)
    return clone
  }, [gltf.scene])

  return <primitive object={root} dispose={null} />
}

function ArcaCamera() {
  const { camera, gl } = useThree()
  const gltf = useLoader(GLTFLoader, ARCA_ASSETS.arca)

  useEffect(() => {
    const perspective = camera as THREE.PerspectiveCamera
    const bounds = new THREE.Box3().setFromObject(gltf.scene)
    const sphere = bounds.getBoundingSphere(new THREE.Sphere())
    const controls = new OrbitControls(camera, gl.domElement)
    controls.target.copy(sphere.center)
    controls.minDistance = 2
    controls.maxDistance = sphere.radius * 10
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

function ArcaLighting() {
  const { gl } = useThree()
  useEffect(() => {
    const previous = gl.shadowMap.autoUpdate
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
    return () => { gl.shadowMap.autoUpdate = previous }
  }, [gl])
  return (
    <>
      <color attach="background" args={["#aab5a1"]} />
      <fog attach="fog" args={["#aab5a1", 190, 620]} />
      <ambientLight intensity={1.05} />
      <hemisphereLight args={["#fff0d9", "#73604b", 1.1]} />
      <directionalLight
        castShadow
        intensity={2.3}
        position={[-90, 170, 120]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-240}
        shadow-camera-right={240}
        shadow-camera-top={240}
        shadow-camera-bottom={-240}
        shadow-camera-near={1}
        shadow-camera-far={520}
      />
    </>
  )
}

export function ArcaScene({ doorOpen, paused, onInteract, onNearDoor, birds }: ArcaSceneProps) {
  return (
    <>
      <ArcaLighting />
      <Suspense fallback={null}>
        {onInteract && onNearDoor
          ? <NoePlayer paused={paused} onInteract={onInteract} onNearDoor={onNearDoor} birds={birds} />
          : <ArcaCamera />}
        <TerrainModel />
        <ArcaModel doorOpen={doorOpen} paused={paused} />
        <InteriorModel />
        <AnimalBlocks />
        <EnclosurePartitions />
        <EnclosureSigns />
        <EnclosureColliders />
        <RampAccess />
      </Suspense>
    </>
  )
}
