import { describe, expect, it } from "vitest"
import { animalMorphology } from "./morphology"
import { speciesById } from "./species"

describe("animal morphology", () => {
  it("derives a reachable body height from limb lengths", () => {
    const horse = speciesById("horse")
    const morphology = animalMorphology(horse)
    expect(morphology.baseHipHeight).toBeGreaterThan(0)
    expect(morphology.baseHipHeight).toBeLessThan(horse.upperLeg + horse.lowerLeg)
  })

  it("keeps species-specific head placement deterministic", () => {
    const deer = speciesById("deer")
    expect(animalMorphology(deer)).toEqual(animalMorphology(deer))
  })

  it("preserves morphology differences between families", () => {
    const donkey = speciesById("donkey")
    const cattle = speciesById("cattle")
    expect(donkey.earLength).toBeGreaterThan(cattle.earLength)
    expect(cattle.legThickness).toBeGreaterThan(donkey.legThickness)
  })
})
