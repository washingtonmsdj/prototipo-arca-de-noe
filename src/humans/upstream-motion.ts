import {
  BASE_PERSON,
  PERSON_CLIPS,
  WALK_CLIP_STRIDES,
  WALK_STANCE_FRACTION,
  type BaseClip,
} from "../../vendor/pilgrimage/lib/game/base-person/pose"
import {
  crossedWalkSupport,
  walkContact,
} from "../../vendor/pilgrimage/lib/game/base-person/gait"
import { advanceWalkPhase } from "../pilgrimage/motion"

export const ORIGINAL_MOVING_CLIPS = [
  "walk",
  "wearyWalk",
  "carrying",
  "procession",
] as const satisfies readonly BaseClip[]

export function isOriginalMovingClip(clip: BaseClip) {
  return (ORIGINAL_MOVING_CLIPS as readonly BaseClip[]).includes(clip)
}

/**
 * Direct 3D rigs use authored rig units directly.
 * The external R3F group scale converts the stance sweep into world units.
 */
export function originalRigWalkStride(
  body: typeof BASE_PERSON.body,
  worldScale: number,
) {
  return 2 * body.stride / WALK_STANCE_FRACTION * worldScale
}

export function originalRigWalkSpeed(
  body: typeof BASE_PERSON.body,
  worldScale: number,
  cadence: number,
) {
  return originalRigWalkStride(body, worldScale) * cadence
}

export function advanceOriginalRigWalk(
  phase: number,
  distance: number,
  clip: BaseClip,
  body: typeof BASE_PERSON.body,
  worldScale: number,
) {
  return advanceWalkPhase(
    phase,
    distance,
    0,
    PERSON_CLIPS[clip].frames,
    0,
    originalRigWalkStride(body, worldScale),
    true,
    WALK_CLIP_STRIDES,
  )
}

export function originalRigWalkContact(
  phase: number,
  clip: BaseClip,
  body: typeof BASE_PERSON.body,
  worldScale: number,
  heading: number,
) {
  const contact = walkContact(
    phase,
    PERSON_CLIPS[clip].frames,
    body,
    WALK_CLIP_STRIDES,
  )
  const cos = Math.cos(heading)
  const sin = Math.sin(heading)
  const x = contact.x * worldScale
  const z = contact.z * worldScale

  return {
    side: contact.side,
    x: x * cos + z * sin,
    y: 0,
    z: -x * sin + z * cos,
  }
}

export function crossedOriginalSupport(
  phase: number,
  distance: number,
  clip: BaseClip,
  body: typeof BASE_PERSON.body,
  worldScale: number,
) {
  const advance = distance / Math.max(
    0.01,
    originalRigWalkStride(body, worldScale),
  )
  return crossedWalkSupport(
    phase,
    advance,
    PERSON_CLIPS[clip].frames,
    WALK_CLIP_STRIDES,
  )
}
