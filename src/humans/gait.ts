import { BASE_PERSON, WALK_STANCE_FRACTION, walkFoot } from "../../vendor/pilgrimage/lib/game/base-person/pose"
import type { HumanDesign, HumanFootSample } from "./types"

export const HUMAN_STANCE = WALK_STANCE_FRACTION

export function humanStride(design: HumanDesign) {
  const reach = design.stride * .5
  return 2 * reach / HUMAN_STANCE * design.height
}

export function humanSpeed(design: HumanDesign, speedScale = 1) {
  return humanStride(design) * design.cadence * speedScale
}

export function sampleHumanFoot(design: HumanDesign, phase: number, right: boolean): HumanFootSample {
  const foot = walkFoot(
    right ? "right" : "left",
    phase,
    {
      ...BASE_PERSON.body,
      stride: design.stride * .5,
      footLift: .15 * design.height,
      legOffset: design.hipWidth * .55,
      ankleHeight: 0,
    },
    HUMAN_STANCE,
  )
  return {
    z: foot.ankle[2],
    y: foot.ankle[1],
    planted: foot.planted,
  }
}

export function humanBodyMotion(phase: number) {
  const t = phase * Math.PI * 2
  return {
    y: Math.sin(t * 2) * .018,
    pitch: Math.sin(t + Math.PI / 2) * .025,
    roll: Math.sin(t) * .018,
  }
}
