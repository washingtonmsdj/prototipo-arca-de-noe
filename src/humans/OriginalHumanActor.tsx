import { useEffect, useMemo, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { PERSON_PRESETS, personRecipe } from "../../vendor/pilgrimage/lib/game/base-person/design"
import type { BaseClip, SocketName } from "../../vendor/pilgrimage/lib/game/base-person/pose"
import type { PoseEdits } from "../../vendor/pilgrimage/lib/game/base-person/pose-edits"
import { plantFoot, type FootPlant } from "../../vendor/pilgrimage/lib/game/base-person/gait"
import type { HumanClipBake } from "../pilgrimage/bake/human-bake"
import { actorMotionState, type ActorMotionRef } from "../pilgrimage/runtime/actor-motion"
import {
  lodRepresentation,
  type ActiveRepresentation,
  type LabRepresentation,
} from "../pilgrimage/runtime/lod"
import { DepthAtlasSprite } from "../pilgrimage/runtime/DepthAtlasSprite"
import { terrainHeight, terrainSlope } from "../world/terrain"
import { UpstreamHuman } from "./UpstreamHuman"
import type { HumanAttachmentKind } from "./attachments"
import {
  advanceOriginalRigWalk,
  crossedOriginalSupport,
  isOriginalMovingClip,
  originalRigWalkContact,
  originalRigWalkSpeed,
} from "./upstream-motion"

interface OriginalHumanActorProps {
  preset: string
  clip: BaseClip
  paused?: boolean
  origin: [number, number]
  scale?: number
  speedScale?: number
  edits?: PoseEdits
  phaseOverride?: number
  showRig?: boolean
  attachment?: HumanAttachmentKind
  attachmentSocket?: SocketName
  pathRadius?: number
  pathOffset?: number
  moving?: boolean
  representation: LabRepresentation
  bake?: HumanClipBake | null
}

export function OriginalHumanActor({
  preset,
  clip,
  paused = false,
  origin,
  scale = 1.2,
  speedScale = 1,
  edits,
  phaseOverride,
  showRig = false,
  attachment,
  attachmentSocket,
  pathRadius = 1.6,
  pathOffset = 0,
  moving = false,
  representation,
  bake,
}: OriginalHumanActorProps) {
  const ground = terrainHeight(origin[0], origin[1])
  const motion = useRef(actorMotionState(origin[0], ground, origin[1]))
  const plantedFoot = useRef<FootPlant | null>(null)
  const path = useRef({
    distance: Math.max(0, pathRadius) * pathOffset,
    angle: pathOffset,
  })
  const lastClip = useRef<BaseClip>(clip)
  const [active, setActive] = useState<ActiveRepresentation>("rig")

  const recipe = useMemo(
    () => personRecipe(PERSON_PRESETS[preset] ?? PERSON_PRESETS.Storybook),
    [preset],
  )

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
    lastClip.current = clip
  }, [preset, origin[0], origin[1], pathRadius, pathOffset])

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

    if (lastClip.current !== clip) {
      const preserveWalkPhase = isOriginalMovingClip(lastClip.current)
        && isOriginalMovingClip(clip)
      if (!preserveWalkPhase) state.phase = 0
      plantedFoot.current = null
      lastClip.current = clip
    }

    if (phaseOverride !== undefined) {
      state.phase = phaseOverride
      state.x = origin[0]
      state.z = origin[1]
      state.y = terrainHeight(state.x, state.z)
      state.heading = 0
      state.moving = false
    } else {
      const walking = moving && isOriginalMovingClip(clip) && pathRadius > 0
      const cadence = 1.1 * speedScale
      const previousPhase = state.phase
      const distance = walking
        ? originalRigWalkSpeed(recipe.body, scale, cadence) * dt
        : 0

      if (walking && distance > 0) {
        path.current.distance += distance
        path.current.angle += distance / Math.max(.25, pathRadius)
        state.phase = advanceOriginalRigWalk(
          state.phase,
          distance,
          clip,
          recipe.body,
          scale,
        )
      } else if (!walking) {
        state.phase = (state.phase + dt * cadence) % 1
      }

      const angle = path.current.angle
      const desiredX = walking ? origin[0] + Math.cos(angle) * pathRadius : origin[0]
      const desiredZ = walking ? origin[1] + Math.sin(angle) * pathRadius : origin[1]
      const heading = walking ? -angle : 0
      const desiredY = terrainHeight(desiredX, desiredZ)

      let x = desiredX
      let y = desiredY
      let z = desiredZ

      if (walking) {
        if (crossedOriginalSupport(
          previousPhase,
          distance,
          clip,
          recipe.body,
          scale,
        )) {
          plantedFoot.current = null
        }

        const contact = originalRigWalkContact(
          state.phase,
          clip,
          recipe.body,
          scale,
          heading,
        )
        const planted = plantFoot(
          plantedFoot.current,
          `${preset}:${contact.side}`,
          { x: desiredX, y: desiredY, z: desiredZ },
          contact,
          terrainHeight,
        )
        plantedFoot.current = planted.plant
        x += planted.offset.x
        y += planted.offset.y
        z += planted.offset.z
      } else {
        plantedFoot.current = null
      }

      state.x = x
      state.y = y
      state.z = z
      state.heading = heading
      state.moving = walking
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

  return (
    <UpstreamHuman
      preset={preset}
      clip={clip}
      paused={paused}
      origin={origin}
      scale={scale}
      speedScale={speedScale}
      edits={edits}
      phaseOverride={phaseOverride}
      showRig={showRig}
      attachment={attachment}
      attachmentSocket={attachmentSocket}
      pathRadius={pathRadius}
      pathOffset={pathOffset}
      stationary
      motionState={sharedMotion}
    />
  )
}
