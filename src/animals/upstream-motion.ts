import { WALK_STANCE_FRACTION } from "../../vendor/pilgrimage/lib/game/base-person/pose"
import { gaitRecipe, type WildlifeGait } from "../pilgrimage/wildlife/gait"
import type { AnimalClip, AnimalRigEdits } from "../pilgrimage/wildlife/rig-edits"
import type { WildlifeKind } from "../pilgrimage/wildlife/species"
import {
  animalProfile,
  type Animal,
  type HorseVariant,
} from "../pilgrimage/transport-core"

export function isGroundWildlifeClip(clip: AnimalClip): clip is WildlifeGait {
  return ["walk", "trot", "canter", "gallop", "hop", "leap"].includes(clip)
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

export function advanceDistancePhase(
  phase: number,
  distance: number,
  stride: number,
) {
  return (phase + distance / Math.max(.01, stride)) % 1
}
