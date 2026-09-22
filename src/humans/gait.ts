import type { HumanDesign, HumanFootSample } from "./types"

export const HUMAN_STANCE = .62

const wrap01 = (value: number) => ((value % 1) + 1) % 1
const smooth = (t: number) => t * t * (3 - 2 * t)

export function humanStride(design: HumanDesign) {
  return design.stride * design.height
}

export function humanSpeed(design: HumanDesign, speedScale = 1) {
  return humanStride(design) * design.cadence * speedScale
}

export function sampleHumanFoot(design: HumanDesign, phase: number, right: boolean): HumanFootSample {
  const p = wrap01(phase + (right ? .5 : 0))
  const reach = design.stride * .5
  if (p < HUMAN_STANCE) {
    const t = p / HUMAN_STANCE
    return { z: reach * (1 - 2 * t), y: 0, planted: true }
  }

  const t = (p - HUMAN_STANCE) / (1 - HUMAN_STANCE)
  return {
    z: -reach + reach * 2 * smooth(t),
    y: Math.sin(Math.PI * t) ** 2 * .15 * design.height,
    planted: false,
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
