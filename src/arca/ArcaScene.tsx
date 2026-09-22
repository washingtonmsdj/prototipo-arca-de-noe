import { Suspense, useEffect, useMemo } from "react"
import { useFrame, useLoader, useThree } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import * as THREE from "three"
import { ARCA_ASSETS } from "./assets"

interface ArcaSceneProps {
  doorOpen: boolean
  paused: boolean
}

interface PreparedArca {
  root: THREE.Group
  doorPivot: THREE.Group
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
  const gltf = useLoader(GLTFLoader, ARCA_ASSETS.arca)
  const prepared = useMemo<PreparedArca>(() => {
    const root = gltf.scene.clone(true)
    prepareStaticMeshes(root, true)

    const door = root.getObjectByName("PORTA")
    const doorPivot = new THREE.Group()
    doorPivot.name = "PORTA_RUNTIME_PIVOT"
    // A porta é uma folha lateral de 6 m. O eixo fica na borda da rampa,
    // deixando a abertura livre e evitando atravessar o corrimão.
    doorPivot.position.set(-58, 0.65, 9.5)
    root.add(doorPivot)

    if (door?.parent) {
      const parent = door.parent
      parent.remove(door)
      door.position.set(58, -0.65, -9.5)
      doorPivot.add(door)
    }

    return { root, doorPivot }
  }, [gltf.scene])

  useFrame((_, delta) => {
    if (paused) return
    const target = doorOpen ? -Math.PI / 2 : 0
    const blend = 1 - Math.exp(-delta * 5)
    prepared.doorPivot.rotation.y = THREE.MathUtils.lerp(
      prepared.doorPivot.rotation.y,
      target,
      blend,
    )
  })

  return <primitive object={prepared.root} dispose={null} />
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
  const { camera } = useThree()

  useEffect(() => {
    const perspective = camera as THREE.PerspectiveCamera
    perspective.position.set(-214, 92, 178)
    perspective.fov = 46
    perspective.near = 0.1
    perspective.far = 700
    perspective.lookAt(0, 7, 18)
    perspective.updateProjectionMatrix()
  }, [camera])

  return null
}

function ArcaLighting() {
  return (
    <>
      <color attach="background" args={["#aab5a1"]} />
      <fog attach="fog" args={["#aab5a1", 190, 620]} />
      <ambientLight intensity={1.05} />
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

export function ArcaScene({ doorOpen, paused }: ArcaSceneProps) {
  return (
    <>
      <ArcaLighting />
      <ArcaCamera />
      <Suspense fallback={null}>
        <TerrainModel />
        <ArcaModel doorOpen={doorOpen} paused={paused} />
      </Suspense>
    </>
  )
}
