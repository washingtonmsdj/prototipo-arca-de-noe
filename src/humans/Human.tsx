import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { plantFoot, type FootPlant } from "../../vendor/pilgrimage/lib/game/base-person/gait"
import { solveTwoBoneLeg } from "../animals/ik"
import { terrainHeight, terrainSlope } from "../world/terrain"
import { HUMAN_STANCE, humanSpeed, humanStride, sampleHumanFoot } from "./gait"
import { humanPose } from "./pose"
import type { HumanClip, HumanDesign } from "./types"

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

function endpoint(start: THREE.Vector3, length: number, pitch: number, sideOffset = 0) {
  return new THREE.Vector3(
    start.x + sideOffset,
    start.y - Math.cos(pitch) * length,
    start.z + Math.sin(pitch) * length,
  )
}

export interface HumanProps {
  design: HumanDesign
  clip?: HumanClip
  pathRadius?: number
  pathOffset?: number
  speedScale?: number
  paused?: boolean
  showRig?: boolean
  stationary?: boolean
  origin?: [number, number]
}

export function Human({
  design,
  clip = "walk",
  pathRadius = 4,
  pathOffset = 0,
  speedScale = 1,
  paused = false,
  showRig = false,
  stationary = false,
  origin = [0, 0],
}: HumanProps) {
  const root = useRef<THREE.Group>(null)
  const torso = useRef<THREE.Mesh>(null)
  const head = useRef<THREE.Group>(null)
  const upperLeg = useRef<(THREE.Mesh | null)[]>([])
  const lowerLeg = useRef<(THREE.Mesh | null)[]>([])
  const feet = useRef<(THREE.Mesh | null)[]>([])
  const upperArm = useRef<(THREE.Mesh | null)[]>([])
  const lowerArm = useRef<(THREE.Mesh | null)[]>([])
  const hands = useRef<(THREE.Mesh | null)[]>([])
  const jointMarkers = useRef<(THREE.Mesh | null)[]>([])
  const plantedFoot = useRef<FootPlant | null>(null)

  const motion = useRef({ distance: pathOffset * pathRadius, angle: pathOffset, action: pathOffset })
  const legX = design.hipWidth * .55
  const shoulderX = design.shoulderWidth * .55
  const baseHipHeight = design.upperLeg + design.lowerLeg - .045
  const torsoCenter = baseHipHeight + design.torsoLength * .52
  const shoulderY = baseHipHeight + design.torsoLength * .92
  const headY = shoulderY + .28 * design.headScale

  const hips = useMemo(() => [
    new THREE.Vector3(legX, baseHipHeight, 0),
    new THREE.Vector3(-legX, baseHipHeight, 0),
  ], [legX, baseHipHeight])

  const limbRadius = .045 * design.height

  useFrame((_, delta) => {
    if (!root.current) return
    const dt = paused ? 0 : Math.min(delta, .05)
    const moving = clip === "walk" && !stationary
    const speed = humanSpeed(design, speedScale)
    const stride = humanStride(design)

    if (moving && dt > 0) {
      motion.current.distance += speed * dt
      motion.current.angle += speed / Math.max(1, pathRadius) * dt
    }
    motion.current.action += dt * design.cadence

    const phase = moving
      ? (motion.current.distance / Math.max(.05, stride)) % 1
      : motion.current.action % 1

    const angle = motion.current.angle
    const desiredX = stationary ? origin[0] : origin[0] + Math.cos(angle) * pathRadius
    const desiredZ = stationary ? origin[1] : origin[1] + Math.sin(angle) * pathRadius
    const heading = stationary ? 0 : -angle
    const desiredGround = terrainHeight(desiredX, desiredZ)
    const pose = humanPose(clip, phase)

    let rootX = desiredX
    let rootY = desiredGround
    let rootZ = desiredZ

    if (moving) {
      const cycle = ((phase % 1) + 1) % 1
      const supportRight = !(cycle >= HUMAN_STANCE - .5 && cycle < HUMAN_STANCE)
      const support = sampleHumanFoot(design, phase, supportRight)
      const sign = supportRight ? -1 : 1
      const scale = design.height
      const localX = sign * legX * scale
      const localZ = support.z * scale
      const cos = Math.cos(heading)
      const sin = Math.sin(heading)
      const contact = {
        x: localX * cos + localZ * sin,
        y: support.y * scale,
        z: -localX * sin + localZ * cos,
      }
      const planted = plantFoot(
        plantedFoot.current,
        `${design.id}:${supportRight ? "right" : "left"}`,
        { x: desiredX, y: desiredGround, z: desiredZ },
        contact,
        terrainHeight,
      )
      plantedFoot.current = planted.plant
      rootX += planted.offset.x
      rootY += planted.offset.y
      rootZ += planted.offset.z
    } else {
      plantedFoot.current = null
    }

    const slope = terrainSlope(rootX, rootZ)
    root.current.position.set(rootX, rootY, rootZ)
    root.current.rotation.order = "YXZ"
    root.current.rotation.y = heading
    root.current.rotation.x = -Math.atan(slope.dz * .28)
    root.current.rotation.z = Math.atan(slope.dx * .28)

    if (torso.current) {
      torso.current.position.set(0, torsoCenter + pose.bodyY, 0)
      torso.current.rotation.x = pose.bodyPitch
      torso.current.rotation.z = pose.bodyRoll
    }

    if (head.current) {
      head.current.position.set(0, headY + pose.bodyY, .01)
      head.current.rotation.x = pose.headPitch
    }

    for (let side = 0; side < 2; side++) {
      const right = side === 1
      const sample = sampleHumanFoot(design, phase, right)
      const solution = solveTwoBoneLeg(
        { y: baseHipHeight + pose.bodyY, z: 0 },
        { y: sample.y, z: sample.z },
        design.upperLeg,
        design.lowerLeg,
      )
      const sign = right ? -1 : 1
      const hip3 = new THREE.Vector3(sign * legX, baseHipHeight + pose.bodyY, 0)
      const knee3 = new THREE.Vector3(sign * legX, solution.knee.y, solution.knee.z)
      const foot3 = new THREE.Vector3(sign * legX, solution.foot.y, solution.foot.z)

      setSegment(upperLeg.current[side], hip3, knee3)
      setSegment(lowerLeg.current[side], knee3, foot3)

      const foot = feet.current[side]
      if (foot) {
        foot.position.copy(foot3)
        foot.position.z += .055
        foot.rotation.x = sample.planted ? 0 : -.14
      }

      const shoulder = new THREE.Vector3(sign * shoulderX, shoulderY + pose.bodyY, 0)
      const armPose = right ? pose.rightArm : pose.leftArm
      const elbow = endpoint(shoulder, design.upperArm, armPose[0], sign * .018)
      elbow.x += sign * Math.abs(armPose[1]) * .20
      const wrist = endpoint(elbow, design.lowerArm, armPose[0] * .62 - .08, sign * .012)
      wrist.x += sign * Math.abs(armPose[1]) * .12

      setSegment(upperArm.current[side], shoulder, elbow)
      setSegment(lowerArm.current[side], elbow, wrist)
      const hand = hands.current[side]
      if (hand) hand.position.copy(wrist)

      const markerBase = side * 3
      const hipMarker = jointMarkers.current[markerBase]
      const kneeMarker = jointMarkers.current[markerBase + 1]
      const handMarker = jointMarkers.current[markerBase + 2]
      if (hipMarker) hipMarker.position.copy(hip3)
      if (kneeMarker) kneeMarker.position.copy(knee3)
      if (handMarker) handMarker.position.copy(wrist)
    }
  })

  return (
    <group ref={root} scale={design.height}>
      <mesh ref={torso} castShadow scale={[design.shoulderWidth, design.torsoLength, .24]}>
        <capsuleGeometry args={[.46, .46, 8, 12]} />
        <meshStandardMaterial color={design.tunic} roughness={.96} />
      </mesh>

      <mesh position={[0, baseHipHeight + .03, 0]} castShadow scale={[design.hipWidth, .16, .22]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color={design.trousers} roughness={1} />
      </mesh>

      <group ref={head}>
        <mesh castShadow scale={[.16 * design.headScale, .20 * design.headScale, .16 * design.headScale]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color={design.skin} roughness={.92} />
        </mesh>
        <mesh position={[0, .07 * design.headScale, -.025]} castShadow scale={[.168 * design.headScale, .08 * design.headScale, .17 * design.headScale]}>
          <sphereGeometry args={[1, 10, 6]} />
          <meshStandardMaterial color={design.hair} roughness={1} />
        </mesh>
      </group>

      {[0, 1].map((side) => (
        <group key={`leg-${side}`}>
          <mesh ref={(node) => { upperLeg.current[side] = node }} castShadow>
            <cylinderGeometry args={[limbRadius, limbRadius * .92, 1, 7]} />
            <meshStandardMaterial color={design.trousers} roughness={1} />
          </mesh>
          <mesh ref={(node) => { lowerLeg.current[side] = node }} castShadow>
            <cylinderGeometry args={[limbRadius * .88, limbRadius * .78, 1, 7]} />
            <meshStandardMaterial color={design.skin} roughness={.96} />
          </mesh>
          <mesh ref={(node) => { feet.current[side] = node }} castShadow scale={[.10, .07, .18]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#3b3027" roughness={1} />
          </mesh>
        </group>
      ))}

      {[0, 1].map((side) => (
        <group key={`arm-${side}`}>
          <mesh ref={(node) => { upperArm.current[side] = node }} castShadow>
            <cylinderGeometry args={[limbRadius * .82, limbRadius * .74, 1, 7]} />
            <meshStandardMaterial color={design.tunic} roughness={.96} />
          </mesh>
          <mesh ref={(node) => { lowerArm.current[side] = node }} castShadow>
            <cylinderGeometry args={[limbRadius * .70, limbRadius * .62, 1, 7]} />
            <meshStandardMaterial color={design.skin} roughness={.94} />
          </mesh>
          <mesh ref={(node) => { hands.current[side] = node }} castShadow scale={[.065, .075, .06]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={design.skin} roughness={.94} />
          </mesh>
        </group>
      ))}

      {[0, 1, 2, 3, 4, 5].map((index) => (
        <mesh
          key={`joint-${index}`}
          ref={(node) => { jointMarkers.current[index] = node }}
          visible={showRig}
        >
          <sphereGeometry args={[.04, 8, 6]} />
          <meshBasicMaterial color={index % 3 === 2 ? "#66d9ef" : index % 3 === 1 ? "#ffd166" : "#ff6b6b"} />
        </mesh>
      ))}
    </group>
  )
}
