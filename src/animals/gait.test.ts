import { describe, expect, it } from "vitest"
import { GAITS, gaitSpeed, gaitStride, sampleFoot } from "./gait"
import { speciesById } from "./species"
import { solveTwoBoneLeg } from "./ik"

describe("procedural gait", () => {
  it("keeps stance feet on the ground", () => {
    const horse = speciesById("horse")
    const samples = Array.from({ length: 100 }, (_, index) => sampleFoot(horse, "walk", index / 100, 0))
    expect(samples.filter((sample) => sample.planted).every((sample) => sample.y === 0)).toBe(true)
  })

  it("derives speed from stride and cadence", () => {
    const horse = speciesById("horse")
    expect(gaitSpeed(horse, "walk")).toBeCloseTo(gaitStride(horse, "walk") * horse.cadence * GAITS.walk.cadence)
  })

  it("keeps the IK chain within bone reach", () => {
    const upper = .6
    const lower = .55
    const solution = solveTwoBoneLeg({ y: 1, z: 0 }, { y: -.5, z: 2 }, upper, lower)
    const hipToKnee = Math.hypot(solution.knee.y - 1, solution.knee.z)
    const kneeToFoot = Math.hypot(solution.foot.y - solution.knee.y, solution.foot.z - solution.knee.z)
    expect(hipToKnee).toBeCloseTo(upper, 3)
    expect(kneeToFoot).toBeCloseTo(lower, 3)
  })
})
