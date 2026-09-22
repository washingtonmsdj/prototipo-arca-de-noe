import { describe, expect, it } from "vitest"
import { generatedHuman, humanById } from "./designs"
import { humanSpeed, humanStride, sampleHumanFoot } from "./gait"
import { humanPose } from "./pose"

describe("procedural humans", () => {
  it("generates deterministic body parameters", () => {
    expect(generatedHuman(42)).toEqual(generatedHuman(42))
    expect(generatedHuman(42)).not.toEqual(generatedHuman(43))
  })

  it("keeps planted feet at ground height", () => {
    const design = humanById("traveler")
    const samples = Array.from({ length: 120 }, (_, index) => sampleHumanFoot(design, index / 120, false))
    expect(samples.filter((sample) => sample.planted).every((sample) => sample.y === 0)).toBe(true)
  })

  it("derives speed from stride and cadence", () => {
    const design = humanById("builder")
    expect(humanSpeed(design)).toBeCloseTo(humanStride(design) * design.cadence)
  })

  it("provides distinct authored procedural clips", () => {
    expect(humanPose("pray", .25)).not.toEqual(humanPose("build", .25))
    expect(humanPose("carry", .5).leftArm[0]).toBeLessThan(0)
  })
})
