import { describe, expect, it } from "vitest"
import { createBasePersonRig } from "../../vendor/pilgrimage/lib/game/base-person/rig"
import { PERSON_PRESETS, personRecipe } from "../../vendor/pilgrimage/lib/game/base-person/design"
import { PERSON_CLIPS, type BaseClip } from "../../vendor/pilgrimage/lib/game/base-person/pose"
import { createWildlifeRig } from "./wildlife/rig"
import { speciesGaits } from "./wildlife/gait"
import { WILDLIFE_SPECIES, isBird, type WildlifeKind } from "./wildlife/species"
import { createAnimalRig } from "./transport/animal-rig"
import type { Animal, HorseVariant } from "./transport-core"

describe("Pilgrimage isolated runtime", () => {
  it("poses every original human clip", () => {
    const rig = createBasePersonRig(personRecipe(PERSON_PRESETS.Storybook))
    try {
      for (const clip of Object.keys(PERSON_CLIPS) as BaseClip[]) {
        expect(() => rig.pose(.37, clip)).not.toThrow()
      }
      expect(Object.keys(PERSON_CLIPS)).toHaveLength(19)
      expect(PERSON_CLIPS.walk.frames).toBe(20)
    } finally {
      rig.dispose()
    }
  })

  it("creates and poses every registered wildlife rig", () => {
    for (const kind of WILDLIFE_SPECIES as readonly WildlifeKind[]) {
      const rig = createWildlifeRig(kind)
      try {
        const gait = speciesGaits(kind)[0] ?? "walk"
        const clip = isBird(kind) ? "fly" : "walk"
        expect(() => rig.pose(.31, true, 1, 0, isBird(kind) ? 1 : false, gait, { clip })).not.toThrow()
        expect(rig.root.children.length).toBeGreaterThan(0)
      } finally {
        rig.dispose()
      }
    }
  })

  it("keeps transport animals as an independent rig family", () => {
    const cases: Array<[Animal, HorseVariant]> = [
      ["donkey", "common"],
      ["horse", "common"],
      ["horse", "noble"],
      ["ox", "common"],
    ]

    for (const [animal, variant] of cases) {
      const rig = createAnimalRig(animal, variant)
      try {
        expect(() => rig.pose(.25, true, 0)).not.toThrow()
        expect(rig.root.children.length).toBeGreaterThan(0)
      } finally {
        rig.dispose()
      }
    }
  })
})
