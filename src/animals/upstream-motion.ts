import { WALK_STANCE_FRACTION } from "../../vendor/pilgrimage/lib/game/base-person/pose"
import { animalLeg } from "../pilgrimage/transport-animal-pose"
import { gaitFoot, gaitRecipe, wrapPhase, type WildlifeGait } from "../pilgrimage/wildlife/gait"
import type { AnimalClip, AnimalRigEdits } from "../pilgrimage/wildlife/rig-edits"
import { BURROW_SECONDS } from "../pilgrimage/wildlife/burrow-motion"
import { isBird, isChicken, type WildlifeKind } from "../pilgrimage/wildlife/species"
import {
  animalProfile,
  type Animal,
  type HorseVariant,
} from "../pilgrimage/transport-core"

export function isGroundWildlifeClip(clip: AnimalClip): clip is WildlifeGait {
  return ["walk", "trot", "canter", "gallop", "hop", "leap"].includes(clip)
}

export function wildlifeClipCadence(
  kind: WildlifeKind,
  clip: AnimalClip,
  edits?: AnimalRigEdits,
) {
  const gait = isGroundWildlifeClip(clip) ? clip : "walk"
  const edit = edits?.clips[clip]?.cadence ?? 1

  if (isGroundWildlifeClip(clip)) {
    return gaitRecipe(kind, gait, edits).cadence
  }
  if (isBird(kind)) {
    const cadence = clip === "glide" ? .3 : clip === "fly" ? (kind === "hawk" ? .85 : 6) : .8
    return cadence * edit
  }
  if (clip === "burrow") return (.32 / BURROW_SECONDS) * edit
  if (clip === "lie") return .125 * edit
  return .8 * edit
}

export function directWildlifeStride(
  kind: WildlifeKind,
  gait: WildlifeGait,
  worldScale: number,
  edits?: AnimalRigEdits,
) {
  return gaitRecipe(kind, gait, edits).stride * worldScale
}

export function directWildlifeSpeed(
  kind: WildlifeKind,
  gait: WildlifeGait,
  worldScale: number,
  speedScale: number,
  edits?: AnimalRigEdits,
) {
  const recipe = gaitRecipe(kind, gait, edits)
  return recipe.stride * worldScale * recipe.cadence * speedScale
}

export function directTransportStride(
  kind: Animal,
  variant: HorseVariant,
  worldScale: number,
) {
  const profile = animalProfile(kind, variant)
  return 2 * profile.stride / WALK_STANCE_FRACTION * worldScale
}

export function directTransportSpeed(
  kind: Animal,
  variant: HorseVariant,
  worldScale: number,
  speedScale: number,
  edits?: AnimalRigEdits,
) {
  const profile = animalProfile(kind, variant)
  const cadence = profile.cyclesPerSecond * (edits?.clips.walk?.cadence ?? 1)
  return directTransportStride(kind, variant, worldScale) * cadence * speedScale
}


export interface AnimalSupportContact {
  key: string
  x: number
  y: number
  z: number
}

function rotateContact(
  key: string,
  x: number,
  z: number,
  worldScale: number,
  heading: number,
): AnimalSupportContact {
  const localX = x * worldScale
  const localZ = z * worldScale
  const cos = Math.cos(heading)
  const sin = Math.sin(heading)
  return {
    key,
    x: localX * cos + localZ * sin,
    y: 0,
    z: -localX * sin + localZ * cos,
  }
}

/**
 * Choose one stable stance foot for world-space locking.
 * We intentionally lock only one contact: forcing all quadruped contacts during
 * a turn would over-constrain the root and introduce lateral distortion.
 */
export function wildlifeSupportContact(
  kind: WildlifeKind,
  gait: WildlifeGait,
  phase: number,
  worldScale: number,
  heading: number,
  edits?: AnimalRigEdits,
): AnimalSupportContact | null {
  if (isChicken(kind) || isBird(kind)) return null

  const recipe = gaitRecipe(kind, gait, edits)
  let best: { limb: number; score: number; x: number; z: number } | null = null

  for (let limb = 0; limb < 4; limb++) {
    const foot = gaitFoot(kind, gait, phase, limb, 1, edits, gait)
    if (!foot.planted) continue

    const local = wrapPhase(phase - recipe.contacts[limb])
    const score = Math.abs(local - recipe.stance / 2)
    if (!best || score < best.score) {
      best = {
        limb,
        score,
        x: foot.ankle[0],
        z: foot.ankle[2],
      }
    }
  }

  return best
    ? rotateContact(
        `${kind}:${gait}:${best.limb}`,
        best.x,
        best.z,
        worldScale,
        heading,
      )
    : null
}

export function transportSupportContact(
  kind: Animal,
  variant: HorseVariant,
  phase: number,
  worldScale: number,
  heading: number,
): AnimalSupportContact | null {
  let best: {
    side: "left" | "right"
    rear: boolean
    score: number
    x: number
    z: number
  } | null = null

  for (const rear of [false, true]) {
    for (const side of ["left", "right"] as const) {
      const leg = animalLeg(kind, side, rear, phase, true, variant)
      if (!leg.planted) continue

      const legPhase = phase + (rear ? .25 : 0)
      const local = wrapPhase(legPhase + (side === "right" ? .5 : 0))
      const score = Math.abs(local - WALK_STANCE_FRACTION / 2)

      if (!best || score < best.score) {
        best = {
          side,
          rear,
          score,
          x: leg.ankle[0],
          z: leg.ankle[2],
        }
      }
    }
  }

  return best
    ? rotateContact(
        `${kind}:${variant}:${best.side}:${best.rear ? "rear" : "front"}`,
        best.x,
        best.z,
        worldScale,
        heading,
      )
    : null
}

export function advanceDistancePhase(
  phase: number,
  distance: number,
  stride: number,
) {
  return (phase + distance / Math.max(.01, stride)) % 1
}
