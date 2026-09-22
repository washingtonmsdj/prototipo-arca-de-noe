import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { bodyMotion, gaitSpeed, gaitStride, sampleFoot } from "./gait"
import { solveTwoBoneLeg } from "./ik"
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
  const body = useRef<THREE.Mesh>(null)
  const head = useRef<THREE.Mesh>(null)
  const muzzle = useRef<THREE.Mesh>(null)
  const tail = useRef<THREE.Mesh>(null)
  const upper = useRef<(THREE.Mesh | null)[]>([])
  const lower = useRef<(THREE.Mesh | null)[]>([])
  const hoof = useRef<(THREE.Mesh | null)[]>([])
  const kneeMarker = useRef<(THREE.Mesh | null)[]>([])
  const footMarker = useRef<(THREE.Mesh | null)[]>([])

  const motion = useRef({ distance: pathOffset * pathRadius, angle: pathOffset, idlePhase: pathOffset })
  const hipPoints = useMemo(() => [
    new THREE.Vector3(species.legX, 0, species.foreZ),
    new THREE.Vector3(-species.legX, 0, species.foreZ),
    new THREE.Vector3(species.legX, 0, species.hindZ),
    new THREE.Vector3(-species.legX, 0, species.hindZ),
  ], [species])

  const boneRadius = Math.max(.035, species.bodyWidth * .07)
  const baseHipHeight = species.upperLeg + species.lowerLeg - .08

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
      body.current.position.set(pose.sway, baseHipHeight + species.bodyHeight * .38 + pose.y, 0)
      body.current.rotation.x = pose.pitch
      body.current.rotation.z = pose.roll
    }

    const headY = baseHipHeight + species.bodyHeight * .66 + pose.y
    const headZ = species.foreZ + species.neckLength
    if (head.current) {
      head.current.position.set(0, headY, headZ)
      head.current.rotation.x = pose.pitch * .55 + Math.sin(motion.current.idlePhase * 1.7) * .025
    }
    if (muzzle.current) {
      muzzle.current.position.set(0, headY - species.headSize * .12, headZ + species.muzzleLength)
      muzzle.current.rotation.x = pose.pitch * .35
    }
    if (tail.current) {
      tail.current.position.set(0, baseHipHeight + species.bodyHeight * .50 + pose.y, species.hindZ - species.bodyLength * .35)
      tail.current.rotation.x = -.65 + Math.sin(motion.current.idlePhase * 2.1) * .18
    }

    for (let i = 0; i < 4; i++) {
      const limb = i as LimbIndex
      const hip = hipPoints[i]
      const footSample = sampleFoot(species, gait, phase, limb)
      const hipY = baseHipHeight + pose.y
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

  return (
    <group ref={root} scale={species.scale}>
      <mesh ref={body} castShadow receiveShadow scale={[species.bodyWidth, species.bodyHeight * .48, species.bodyLength * .62]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color={species.color} roughness={.92} />
      </mesh>

      <mesh ref={head} castShadow scale={[species.headSize, species.headSize * .9, species.headSize * 1.05]}>
        <sphereGeometry args={[1, 12, 9]} />
        <meshStandardMaterial color={species.color} roughness={.9} />
      </mesh>

      <mesh ref={muzzle} castShadow scale={[species.headSize * .58, species.headSize * .48, species.muzzleLength]}>
        <sphereGeometry args={[1, 10, 7]} />
        <meshStandardMaterial color={species.accent} roughness={.95} />
      </mesh>

      <mesh ref={tail} castShadow scale={[.08, .08, species.bodyLength * .28]}>
        <cylinderGeometry args={[1, .55, 1, 7]} />
        <meshStandardMaterial color={species.accent} roughness={1} />
      </mesh>

      {[0, 1, 2, 3].map((index) => (
        <group key={index}>
          <mesh ref={(node) => { upper.current[index] = node }} castShadow>
            <cylinderGeometry args={[boneRadius, boneRadius * .9, 1, 7]} />
            <meshStandardMaterial color={species.color} roughness={.95} />
          </mesh>
          <mesh ref={(node) => { lower.current[index] = node }} castShadow>
            <cylinderGeometry args={[boneRadius * .82, boneRadius * .70, 1, 7]} />
            <meshStandardMaterial color={species.color} roughness={.95} />
          </mesh>
          <mesh ref={(node) => { hoof.current[index] = node }} castShadow scale={[boneRadius * 1.7, boneRadius, boneRadius * 2.2]}>
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
