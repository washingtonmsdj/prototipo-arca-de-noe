import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { bodyMotion, gaitSpeed, gaitStride, sampleFoot } from "./gait"
import { solveTwoBoneLeg } from "./ik"
import { animalMorphology } from "./morphology"
import type { AnimalSpecies, GaitName, LimbIndex } from "./types"
import { terrainHeight, terrainSlope } from "../world/terrain"

const UP = new THREE.Vector3(0, 1, 0)
const direction = new THREE.Vector3()
const midpoint = new THREE.Vector3()

function setSegment(mesh: THREE.Mesh | null, a: THREE.Vector3, b: THREE.Vector3) {
  if (!mesh) return
  direction.copy(b).sub(a)
  const length = Math.max(.001, direction.length())
  midpoint.copy(a).add(b).multiplyScalar(.5)
  mesh.position.copy(midpoint)
  mesh.quaternion.setFromUnitVectors(UP, direction.normalize())
  mesh.scale.set(1, length, 1)
}

export interface AnimalProps {
  species: AnimalSpecies
  gait: GaitName
  pathRadius?: number
  pathOffset?: number
  speedScale?: number
  paused?: boolean
  showRig?: boolean
  stationary?: boolean
  origin?: [number, number]
}

export function Animal({
  species,
  gait,
  pathRadius = 5,
  pathOffset = 0,
  speedScale = 1,
  paused = false,
  showRig = false,
  stationary = false,
  origin = [0, 0],
}: AnimalProps) {
  const root = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const neck = useRef<THREE.Mesh>(null)
  const tail = useRef<THREE.Mesh>(null)
  const upper = useRef<(THREE.Mesh | null)[]>([])
  const lower = useRef<(THREE.Mesh | null)[]>([])
  const hoof = useRef<(THREE.Mesh | null)[]>([])
  const kneeMarker = useRef<(THREE.Mesh | null)[]>([])
  const footMarker = useRef<(THREE.Mesh | null)[]>([])

  const motion = useRef({ distance: pathOffset * pathRadius, angle: pathOffset, idlePhase: pathOffset })
  const morphology = useMemo(() => animalMorphology(species), [species])
  const hipPoints = useMemo(() => [
    new THREE.Vector3(species.legX, 0, species.foreZ),
    new THREE.Vector3(-species.legX, 0, species.foreZ),
    new THREE.Vector3(species.legX, 0, species.hindZ),
    new THREE.Vector3(-species.legX, 0, species.hindZ),
  ], [species])

  useFrame((_, delta) => {
    if (!root.current) return
    const dt = paused ? 0 : Math.min(delta, .05)
    const speed = gaitSpeed(species, gait, speedScale)
    const stride = gaitStride(species, gait)

    if (!stationary && dt > 0) {
      motion.current.distance += speed * dt
      motion.current.angle += speed / Math.max(1, pathRadius) * dt
    }
    motion.current.idlePhase += dt * .8

    const phase = stationary
      ? (motion.current.idlePhase * species.cadence * .15) % 1
      : (motion.current.distance / Math.max(.05, stride)) % 1

    const angle = motion.current.angle
    const x = stationary ? origin[0] : origin[0] + Math.cos(angle) * pathRadius
    const z = stationary ? origin[1] : origin[1] + Math.sin(angle) * pathRadius
    const heading = stationary ? 0 : -angle
    const ground = terrainHeight(x, z)
    const slope = terrainSlope(x, z)
    const pose = bodyMotion(gait, phase)

    root.current.position.set(x, ground, z)
    root.current.rotation.order = "YXZ"
    root.current.rotation.y = heading
    root.current.rotation.x = -Math.atan(slope.dz * .55)
    root.current.rotation.z = Math.atan(slope.dx * .55)

    if (body.current) {
      body.current.position.set(pose.sway, morphology.bodyY + pose.y, 0)
      body.current.rotation.x = pose.pitch
      body.current.rotation.z = pose.roll
    }

    const headPosition = new THREE.Vector3(0, morphology.headY + pose.y, morphology.headZ)
    if (head.current) {
      head.current.position.copy(headPosition)
      head.current.rotation.x = species.neckPitch + pose.pitch * .45 + Math.sin(motion.current.idlePhase * 1.7) * .025
    }

    const neckStart = new THREE.Vector3(pose.sway, morphology.neckBaseY + pose.y, morphology.neckBaseZ)
    const neckEnd = headPosition.clone().add(new THREE.Vector3(0, -species.headSize * .16, -species.headSize * .34))
    setSegment(neck.current, neckStart, neckEnd)

    const tailStart = new THREE.Vector3(pose.sway, morphology.tailBaseY + pose.y, morphology.tailBaseZ)
    const tailSwing = Math.sin(motion.current.idlePhase * 2.1)
    const tailEnd = new THREE.Vector3(
      tailStart.x + tailSwing * species.tailLength * .18,
      tailStart.y - species.tailLength * .34,
      tailStart.z - species.tailLength * .78,
    )
    setSegment(tail.current, tailStart, tailEnd)

    for (let i = 0; i < 4; i++) {
      const limb = i as LimbIndex
      const hip = hipPoints[i]
      const footSample = sampleFoot(species, gait, phase, limb)
      const hipY = morphology.baseHipHeight + pose.y
      const footZ = hip.z + footSample.z
      const solution = solveTwoBoneLeg(
        { y: hipY, z: hip.z },
        { y: footSample.y, z: footZ },
        species.upperLeg,
        species.lowerLeg,
      )

      const hip3 = new THREE.Vector3(hip.x + pose.sway, hipY, hip.z)
      const knee3 = new THREE.Vector3(hip.x + pose.sway, solution.knee.y, solution.knee.z)
      const foot3 = new THREE.Vector3(hip.x + pose.sway, solution.foot.y, solution.foot.z)

      setSegment(upper.current[i], hip3, knee3)
      setSegment(lower.current[i], knee3, foot3)

      const hoofMesh = hoof.current[i]
      if (hoofMesh) {
        hoofMesh.position.copy(foot3)
        hoofMesh.rotation.x = footSample.planted ? 0 : -.15
      }
      const knee = kneeMarker.current[i]
      if (knee) knee.position.copy(knee3)
      const foot = footMarker.current[i]
      if (foot) foot.position.copy(foot3)
    }
  })

  const neckRadius = Math.max(.08, species.bodyWidth * .20)
  const tailRadius = Math.max(.025, species.bodyWidth * .055)
  const earX = species.headSize * .68
  const earY = species.headSize * .70
  const hornX = species.headSize * .58

  return (
    <group ref={root} scale={species.scale}>
      <group ref={body}>
        <mesh castShadow receiveShadow position={[0, 0, morphology.chestZ]} scale={morphology.chestScale}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color={species.color} roughness={.93} />
        </mesh>
        <mesh castShadow receiveShadow scale={morphology.torsoScale}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color={species.color} roughness={.94} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0, morphology.rumpZ]} scale={morphology.rumpScale}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color={species.color} roughness={.94} />
        </mesh>
      </group>

      <mesh ref={neck} castShadow>
        <cylinderGeometry args={[neckRadius, neckRadius * .88, 1, 9]} />
        <meshStandardMaterial color={species.color} roughness={.94} />
      </mesh>

      <group ref={head}>
        {species.mane && (
          <mesh castShadow position={[0, .015, -.07]} scale={[species.headSize * 1.38, species.headSize * 1.38, species.headSize * 1.10]}>
            <sphereGeometry args={[1, 12, 9]} />
            <meshStandardMaterial color={species.accent} roughness={1} />
          </mesh>
        )}
        <mesh castShadow scale={[species.headSize, species.headSize * .90, species.headSize * 1.05]}>
          <sphereGeometry args={[1, 12, 9]} />
          <meshStandardMaterial color={species.color} roughness={.90} />
        </mesh>
        <mesh
          castShadow
          position={[0, -species.headSize * .12, species.headSize * .92 + species.muzzleLength * .56]}
          scale={[species.headSize * .58, species.headSize * .48, species.muzzleLength]}
        >
          <sphereGeometry args={[1, 10, 7]} />
          <meshStandardMaterial color={species.accent} roughness={.95} />
        </mesh>

        {[-1, 1].map((sign) => (
          <mesh
            key={`ear-${sign}`}
            castShadow
            position={[sign * earX, earY, -.01]}
            rotation={[0, 0, sign * -.62]}
            scale={[species.earWidth, species.earLength, species.earWidth * .58]}
          >
            <coneGeometry args={[1, 1, 6]} />
            <meshStandardMaterial color={species.color} roughness={.98} />
          </mesh>
        ))}

        {species.hornStyle === "horns" && [-1, 1].map((sign) => (
          <mesh
            key={`horn-${sign}`}
            castShadow
            position={[sign * hornX, species.headSize * .76, -.10]}
            rotation={[0, 0, sign * -.35]}
            scale={[.055, species.headSize * .78, .055]}
          >
            <coneGeometry args={[1, 1, 7]} />
            <meshStandardMaterial color="#bca77e" roughness={1} />
          </mesh>
        ))}

        {species.hornStyle === "antlers" && [-1, 1].map((sign) => (
          <group key={`antler-${sign}`} position={[sign * hornX, species.headSize * .70, -.09]}>
            <mesh castShadow rotation={[0, 0, sign * -.20]} scale={[.035, species.headSize * 1.10, .035]}>
              <cylinderGeometry args={[1, .82, 1, 6]} />
              <meshStandardMaterial color="#bca77e" roughness={1} />
            </mesh>
            {[.18, .42, .66].map((y, index) => (
              <mesh
                key={y}
                castShadow
                position={[sign * .05, species.headSize * y, 0]}
                rotation={[0, 0, sign * -.92]}
                scale={[.025, species.headSize * (.34 - index * .05), .025]}
              >
                <cylinderGeometry args={[1, .75, 1, 6]} />
                <meshStandardMaterial color="#bca77e" roughness={1} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      <mesh ref={tail} castShadow>
        <cylinderGeometry args={[tailRadius, tailRadius * .55, 1, 7]} />
        <meshStandardMaterial color={species.family === "feline" ? species.color : species.accent} roughness={1} />
      </mesh>

      {[0, 1, 2, 3].map((index) => (
        <group key={index}>
          <mesh ref={(node) => { upper.current[index] = node }} castShadow>
            <cylinderGeometry args={[morphology.boneRadius, morphology.boneRadius * .90, 1, 7]} />
            <meshStandardMaterial color={species.color} roughness={.95} />
          </mesh>
          <mesh ref={(node) => { lower.current[index] = node }} castShadow>
            <cylinderGeometry args={[morphology.boneRadius * .82, morphology.boneRadius * .70, 1, 7]} />
            <meshStandardMaterial color={species.color} roughness={.95} />
          </mesh>
          <mesh
            ref={(node) => { hoof.current[index] = node }}
            castShadow
            scale={[morphology.boneRadius * 1.7, morphology.boneRadius, morphology.boneRadius * 2.2]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={species.accent} roughness={1} />
          </mesh>
          <mesh ref={(node) => { kneeMarker.current[index] = node }} visible={showRig}>
            <sphereGeometry args={[.045, 8, 6]} />
            <meshBasicMaterial color="#ffd166" />
          </mesh>
          <mesh ref={(node) => { footMarker.current[index] = node }} visible={showRig}>
            <sphereGeometry args={[.05, 8, 6]} />
            <meshBasicMaterial color="#ff5c5c" />
          </mesh>
        </group>
      ))}
    </group>
  )
}
