import { useEffect, useMemo, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { plantFoot, type FootPlant } from "../../vendor/pilgrimage/lib/game/base-person/gait"
import type { AnimalClipBake } from "../pilgrimage/bake/animal-bake"
import { actorMotionState, type ActorMotionRef } from "../pilgrimage/runtime/actor-motion"
import {
  lodRepresentation,
  type ActiveRepresentation,
  type LabRepresentation,
} from "../pilgrimage/runtime/lod"
import { DepthAtlasSprite } from "../pilgrimage/runtime/DepthAtlasSprite"
import { speciesGaits, type WildlifeGait } from "../pilgrimage/wildlife/gait"
import type { AnimalClip, AnimalRigEdits } from "../pilgrimage/wildlife/rig-edits"
import type { WildlifeKind } from "../pilgrimage/wildlife/species"
import { terrainHeight, terrainSlope } from "../world/terrain"
import {
  UpstreamAnimal,
} from "./UpstreamAnimal"
import {
  UpstreamTransportAnimal,
  upstreamTransportDefinition,
  type UpstreamTransportClip,
  type UpstreamTransportKind,
} from "./UpstreamTransportAnimal"
import {
  advanceDistancePhase,
  directTransportSpeed,
  directTransportStride,
  directWildlifeSpeed,
  directWildlifeStride,
  isGroundWildlifeClip,
  transportSupportContact,
  wildlifeClipCadence,
  wildlifeSupportContact,
} from "./upstream-motion"

export type OriginalAnimalGroup = "wildlife" | "transport"

interface OriginalAnimalActorProps {
  group: OriginalAnimalGroup
  wildlifeKind: WildlifeKind
  wildlifeClip: AnimalClip
  transportKind: UpstreamTransportKind
  transportClip: UpstreamTransportClip
  transportCoat?: string
  paused?: boolean
  showRig?: boolean
  origin: [number, number]
  speedScale?: number
  edits?: AnimalRigEdits
  phaseOverride?: number
  pathRadius?: number
  pathOffset?: number
  moving?: boolean
  representation: LabRepresentation
  bake?: AnimalClipBake | null
}

function gaitForClip(kind: WildlifeKind, clip: AnimalClip): WildlifeGait {
  const available = speciesGaits(kind)
  return available.includes(clip as WildlifeGait)
    ? clip as WildlifeGait
    : available[0] ?? "walk"
}

export function OriginalAnimalActor({
  group,
  wildlifeKind,
  wildlifeClip,
  transportKind,
  transportClip,
  transportCoat,
  paused = false,
  showRig = true,
  origin,
  speedScale = 1,
  edits,
  phaseOverride,
  pathRadius = 1.6,
  pathOffset = 0,
  moving = false,
  representation,
  bake,
}: OriginalAnimalActorProps) {
  const ground = terrainHeight(origin[0], origin[1])
  const motion = useRef(actorMotionState(origin[0], ground, origin[1]))
  const plantedFoot = useRef<FootPlant | null>(null)
  const path = useRef({
    distance: Math.max(0, pathRadius) * pathOffset,
    angle: pathOffset,
  })
  const clipKey = group === "wildlife" ? wildlifeClip : transportClip
  const lastClip = useRef<string>(clipKey)
  const [active, setActive] = useState<ActiveRepresentation>("rig")

  const transport = useMemo(
    () => upstreamTransportDefinition(transportKind),
    [transportKind],
  )
  const wildlifeGait = useMemo(
    () => gaitForClip(wildlifeKind, wildlifeClip),
    [wildlifeKind, wildlifeClip],
  )

  const scale = group === "transport" ? 1.05 : 1.35

  useEffect(() => {
    const y = terrainHeight(origin[0], origin[1])
    const slope = terrainSlope(origin[0], origin[1])
    motion.current = {
      ...actorMotionState(origin[0], y, origin[1]),
      slopeX: slope.dx,
      slopeZ: slope.dz,
    }
    path.current = {
      distance: Math.max(0, pathRadius) * pathOffset,
      angle: pathOffset,
    }
    plantedFoot.current = null
    lastClip.current = clipKey
  }, [
    group,
    wildlifeKind,
    transportKind,
    origin[0],
    origin[1],
    pathRadius,
    pathOffset,
  ])

  useEffect(() => {
    if (!bake) {
      setActive("rig")
      return
    }
    if (representation !== "auto") setActive(representation)
  }, [representation, bake])

  useFrame(({ camera }, delta) => {
    const state = motion.current
    const dt = paused ? 0 : Math.min(delta, .05)
    const currentClip = group === "wildlife" ? wildlifeClip : transportClip

    if (lastClip.current !== currentClip) {
      const previousGround = group === "wildlife"
        ? isGroundWildlifeClip(lastClip.current as AnimalClip)
        : lastClip.current === "walk"
      const currentGround = group === "wildlife"
        ? isGroundWildlifeClip(wildlifeClip)
        : transportClip === "walk"

      if (!(previousGround && currentGround)) state.phase = 0
      plantedFoot.current = null
      lastClip.current = currentClip
    }

    const flying = group === "wildlife"
      && (wildlifeClip === "fly" || wildlifeClip === "glide")

    if (phaseOverride !== undefined) {
      state.phase = phaseOverride
      state.x = origin[0]
      state.z = origin[1]
      state.y = terrainHeight(state.x, state.z) + (flying ? .32 * scale : 0)
      state.heading = 0
      state.moving = false
    } else if (group === "wildlife") {
      const worldMoving = moving
        && isGroundWildlifeClip(wildlifeClip)
        && pathRadius > 0

      if (worldMoving) {
        const distance = directWildlifeSpeed(
          wildlifeKind,
          wildlifeGait,
          scale,
          speedScale,
          edits,
        ) * dt
        const stride = directWildlifeStride(
          wildlifeKind,
          wildlifeGait,
          scale,
          edits,
        )
        state.phase = advanceDistancePhase(state.phase, distance, stride)
        path.current.distance += distance
        path.current.angle += distance / Math.max(.25, pathRadius)
      } else {
        state.phase = (
          state.phase
          + dt * wildlifeClipCadence(wildlifeKind, wildlifeClip, edits) * speedScale
        ) % 1
      }

      const angle = path.current.angle
      const desiredX = worldMoving
        ? origin[0] + Math.cos(angle) * pathRadius
        : origin[0]
      const desiredZ = worldMoving
        ? origin[1] + Math.sin(angle) * pathRadius
        : origin[1]
      const heading = worldMoving ? -angle : 0
      const desiredY = terrainHeight(desiredX, desiredZ) + (flying ? .32 * scale : 0)

      let x = desiredX
      let y = desiredY
      let z = desiredZ

      if (worldMoving) {
        const support = wildlifeSupportContact(
          wildlifeKind,
          wildlifeGait,
          state.phase,
          scale,
          heading,
          edits,
        )
        if (support) {
          const planted = plantFoot(
            plantedFoot.current,
            support.key,
            { x: desiredX, y: desiredY, z: desiredZ },
            support,
            terrainHeight,
          )
          plantedFoot.current = planted.plant
          x += planted.offset.x
          y += planted.offset.y
          z += planted.offset.z
        } else {
          plantedFoot.current = null
        }
      } else {
        plantedFoot.current = null
      }

      state.x = x
      state.y = y
      state.z = z
      state.heading = heading
      state.moving = worldMoving
    } else {
      const worldMoving = moving
        && transportClip === "walk"
        && pathRadius > 0

      if (worldMoving) {
        const distance = directTransportSpeed(
          transport.animal,
          transport.variant,
          scale,
          speedScale,
          edits,
        ) * dt
        const stride = directTransportStride(
          transport.animal,
          transport.variant,
          scale,
        )
        state.phase = advanceDistancePhase(state.phase, distance, stride)
        path.current.distance += distance
        path.current.angle += distance / Math.max(.25, pathRadius)
      } else {
        const profile = transport.animal === "horse"
          ? transport.variant
          : transport.animal
        const cadence = {
          ox: .62,
          donkey: .82,
          common: .95,
          noble: .98,
        }[profile]
        state.phase = (
          state.phase
          + dt * cadence * (edits?.clips.walk?.cadence ?? 1) * speedScale
        ) % 1
      }

      const angle = path.current.angle
      const desiredX = worldMoving
        ? origin[0] + Math.cos(angle) * pathRadius
        : origin[0]
      const desiredZ = worldMoving
        ? origin[1] + Math.sin(angle) * pathRadius
        : origin[1]
      const heading = worldMoving ? -angle : 0
      const desiredY = terrainHeight(desiredX, desiredZ)

      let x = desiredX
      let y = desiredY
      let z = desiredZ

      if (worldMoving) {
        const support = transportSupportContact(
          transport.animal,
          transport.variant,
          state.phase,
          scale,
          heading,
        )
        if (support) {
          const planted = plantFoot(
            plantedFoot.current,
            support.key,
            { x: desiredX, y: desiredY, z: desiredZ },
            support,
            terrainHeight,
          )
          plantedFoot.current = planted.plant
          x += planted.offset.x
          y += planted.offset.y
          z += planted.offset.z
        } else {
          plantedFoot.current = null
        }
      } else {
        plantedFoot.current = null
      }

      state.x = x
      state.y = y
      state.z = z
      state.heading = heading
      state.moving = worldMoving
    }

    const slope = terrainSlope(state.x, state.z)
    state.slopeX = slope.dx
    state.slopeZ = slope.dz

    if (representation === "auto" && bake) {
      const dx = camera.position.x - state.x
      const dy = camera.position.y - state.y
      const dz = camera.position.z - state.z
      const next = lodRepresentation(active, Math.hypot(dx, dy, dz))
      if (next !== active) setActive(next)
    }
  })

  const sharedMotion = motion as ActorMotionRef

  if (active === "sprite" && bake) {
    return (
      <DepthAtlasSprite
        color={bake.color}
        depth={bake.depth}
        metadata={bake.metadata}
        motion={sharedMotion}
        scale={scale}
      />
    )
  }

  if (group === "transport") {
    return (
      <UpstreamTransportAnimal
        kind={transportKind}
        clip={transportClip}
        coatId={transportCoat}
        paused={paused}
        showRig={showRig}
        origin={origin}
        scale={scale}
        speedScale={speedScale}
        edits={edits}
        phaseOverride={phaseOverride}
        stationary
        motionState={sharedMotion}
      />
    )
  }

  return (
    <UpstreamAnimal
      kind={wildlifeKind}
      clip={wildlifeClip}
      paused={paused}
      showRig={showRig}
      origin={origin}
      scale={scale}
      speedScale={speedScale}
      edits={edits}
      phaseOverride={phaseOverride}
      stationary
      motionState={sharedMotion}
    />
  )
}
