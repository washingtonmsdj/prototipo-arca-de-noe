import { describe, expect, it } from "vitest"
import { gaitRecipe } from "../pilgrimage/wildlife/gait"
import {
  advanceDistancePhase,
  directTransportSpeed,
  directTransportStride,
  directWildlifeSpeed,
  directWildlifeStride,
  isGroundWildlifeClip,
  transportSupportContact,
  wildlifeSupportContact,
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


  it("keeps a wildlife support contact coherent across a distance-synced step", () => {
    const scale = 1.35
    const stride = directWildlifeStride("deer", "walk", scale)
    let sample: {
      phase: number
      first: NonNullable<ReturnType<typeof wildlifeSupportContact>>
      second: NonNullable<ReturnType<typeof wildlifeSupportContact>>
    } | null = null

    for (let i = 0; i < 100 && !sample; i++) {
      const phase = i / 100
      const first = wildlifeSupportContact("deer", "walk", phase, scale, 0)
      const nextPhase = advanceDistancePhase(phase, stride * .01, stride)
      const second = wildlifeSupportContact("deer", "walk", nextPhase, scale, 0)
      if (first && second && first.key === second.key) sample = { phase, first, second }
    }

    expect(sample).not.toBeNull()
    const rootAdvance = stride * .01
    const firstWorldZ = sample!.first.z
    const secondWorldZ = rootAdvance + sample!.second.z
    expect(secondWorldZ).toBeCloseTo(firstWorldZ, 5)
  })

  it("finds a stable support hoof for transport walking", () => {
    const support = transportSupportContact("horse", "noble", .2, 1.05, 0)
    expect(support).not.toBeNull()
    expect(Number.isFinite(support!.x)).toBe(true)
    expect(Number.isFinite(support!.z)).toBe(true)
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
