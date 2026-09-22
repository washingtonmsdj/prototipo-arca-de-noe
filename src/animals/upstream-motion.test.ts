import { describe, expect, it } from "vitest"
import { gaitRecipe } from "../pilgrimage/wildlife/gait"
import {
  advanceDistancePhase,
  directTransportSpeed,
  directTransportStride,
  directWildlifeSpeed,
  directWildlifeStride,
  isGroundWildlifeClip,
} from "./upstream-motion"

describe("original animal world motion", () => {
  it("uses each wildlife gait's authored cadence and stride", () => {
    const scale = 1.35
    const gait = "gallop" as const
    const stride = directWildlifeStride("deer", gait, scale)
    const speed = directWildlifeSpeed("deer", gait, scale, 1)

    expect(stride).toBeCloseTo(gaitRecipe("deer", gait).stride * scale)
    expect(speed).toBeCloseTo(stride * gaitRecipe("deer", gait).cadence)
  })

  it("keeps transport phase tied to actual distance", () => {
    const stride = directTransportStride("horse", "noble", 1.05)
    const speed = directTransportSpeed("horse", "noble", 1.05, 1)

    expect(stride).toBeGreaterThan(0)
    expect(speed).toBeGreaterThan(0)
    expect(advanceDistancePhase(0, stride * .25, stride)).toBeCloseTo(.25)
  })

  it("distinguishes ground locomotion from actions and flight", () => {
    for (const clip of ["walk", "trot", "canter", "gallop", "hop", "leap"] as const) {
      expect(isGroundWildlifeClip(clip)).toBe(true)
    }
    for (const clip of ["idle", "graze", "lie", "fly", "glide", "burrow"] as const) {
      expect(isGroundWildlifeClip(clip)).toBe(false)
    }
  })
})
