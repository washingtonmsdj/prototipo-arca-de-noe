import { describe, expect, it } from "vitest"
import {
  PERSON_PRESETS,
  personRecipe,
} from "../../vendor/pilgrimage/lib/game/base-person/design"
import {
  advanceOriginalRigWalk,
  isOriginalMovingClip,
  originalRigWalkContact,
  originalRigWalkSpeed,
  originalRigWalkStride,
} from "./upstream-motion"

const recipe = personRecipe(PERSON_PRESETS.Storybook)

describe("original human world locomotion", () => {
  it("converts the authored stance sweep into direct 3D world stride", () => {
    const scale = 1.2
    const stride = originalRigWalkStride(recipe.body, scale)

    expect(stride).toBeGreaterThan(0)
    expect(originalRigWalkSpeed(recipe.body, scale, 1.1)).toBeCloseTo(stride * 1.1)
  })

  it("advances phase from distance instead of render time", () => {
    const scale = 1.2
    const stride = originalRigWalkStride(recipe.body, scale)
    const phase = advanceOriginalRigWalk(0, stride * .5, "walk", recipe.body, scale)

    expect(phase).toBeCloseTo(.5)
    expect(advanceOriginalRigWalk(.25, 0, "walk", recipe.body, scale)).toBeCloseTo(.25)
  })

  it("rotates the support contact with the moving body", () => {
    const scale = 1.2
    const forward = originalRigWalkContact(.1, "walk", recipe.body, scale, 0)
    const quarterTurn = originalRigWalkContact(.1, "walk", recipe.body, scale, Math.PI / 2)

    expect(quarterTurn.x).toBeCloseTo(forward.z, 6)
    expect(quarterTurn.z).toBeCloseTo(-forward.x, 6)
    expect(quarterTurn.side).toBe(forward.side)
  })

  it("moves only clips whose authored pose contains locomotion", () => {
    for (const clip of ["walk", "wearyWalk", "carrying", "procession"] as const) {
      expect(isOriginalMovingClip(clip)).toBe(true)
    }
    for (const clip of ["idle", "building", "praying", "sleeping"] as const) {
      expect(isOriginalMovingClip(clip)).toBe(false)
    }
  })
})
