import { describe, expect, it } from "vitest"
import {
  PERSON_PRESETS,
  personRecipe,
} from "../../vendor/pilgrimage/lib/game/base-person/design"
import { createBasePersonRig } from "../../vendor/pilgrimage/lib/game/base-person/rig"
import { blendHumanPose, captureHumanPose } from "./pose-transition"

function positions(root: ReturnType<typeof createBasePersonRig>["root"], name: string) {
  const mesh = root.getObjectByName(name)
  if (!mesh || !("geometry" in mesh)) throw new Error(`Missing mesh ${name}`)
  const geometry = (mesh as import("three").Mesh).geometry
  return Float32Array.from(geometry.getAttribute("position").array as ArrayLike<number>)
}

describe("human pose transitions", () => {
  it("restores the exact source pose at zero and target pose at one", () => {
    const rig = createBasePersonRig(personRecipe(PERSON_PRESETS.Storybook))
    try {
      rig.pose(0, "idle")
      const source = captureHumanPose(rig.root)
      const sourceGarment = positions(rig.root, "shirt")

      rig.pose(.25, "sitting")
      const targetGarment = positions(rig.root, "shirt")

      blendHumanPose(source, 0)
      expect(Array.from(positions(rig.root, "shirt"))).toEqual(Array.from(sourceGarment))

      rig.pose(.25, "sitting")
      blendHumanPose(source, 1)
      expect(Array.from(positions(rig.root, "shirt"))).toEqual(Array.from(targetGarment))
    } finally {
      rig.dispose()
    }
  })

  it("interpolates procedural garment vertices instead of only object transforms", () => {
    const rig = createBasePersonRig(personRecipe(PERSON_PRESETS.Storybook))
    try {
      rig.pose(0, "idle")
      const source = captureHumanPose(rig.root)
      const a = positions(rig.root, "shirt")

      rig.pose(.35, "sitting")
      const b = positions(rig.root, "shirt")
      const changed = Array.from(a).findIndex((value, index) => Math.abs(value - b[index]) > 1e-5)
      expect(changed).toBeGreaterThanOrEqual(0)

      rig.pose(.35, "sitting")
      blendHumanPose(source, .5)
      const middle = positions(rig.root, "shirt")
      expect(middle[changed]).toBeCloseTo((a[changed] + b[changed]) / 2, 5)
    } finally {
      rig.dispose()
    }
  })

  it("switches action prop visibility discretely during a transition", () => {
    const rig = createBasePersonRig(personRecipe(PERSON_PRESETS.Storybook))
    try {
      rig.pose(0, "idle")
      const source = captureHumanPose(rig.root)
      const mallet = rig.root.getObjectByName("building-mallet")!
      expect(mallet.visible).toBe(false)

      rig.pose(.25, "building")
      expect(mallet.visible).toBe(true)
      blendHumanPose(source, .25)
      expect(mallet.visible).toBe(false)

      rig.pose(.25, "building")
      blendHumanPose(source, .75)
      expect(mallet.visible).toBe(true)
    } finally {
      rig.dispose()
    }
  })
})
