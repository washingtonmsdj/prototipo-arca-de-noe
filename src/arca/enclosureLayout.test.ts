import { describe, expect, it } from "vitest"
import dimensions from "../../concepts/arca/dimensoes-animais-jogo-v1.json"
import { housingClassFor, housingCoverage } from "./animalPlanning"
import {
  animalPlacements,
  pendingAnimals,
  physicalPens,
} from "./enclosureLayout"
import {
  baseModules,
  planningSummary,
  serviceZones,
} from "./plannedEnclosures"

describe("ark animal enclosure layout", () => {
  it("keeps every catalogued individual inside the ark", () => {
    expect(dimensions.total_groups).toBe(162)
    expect(dimensions.total_individuals).toBe(1080)
    expect(dimensions.animals).toHaveLength(162)
    expect(animalPlacements).toHaveLength(1080)
    expect(pendingAnimals).toHaveLength(0)
    expect(dimensions.animals.every(animal => animal.staging_position_m === null)).toBe(true)
  })

  it("assigns one deterministic planned pen and housing class to every group", () => {
    expect(physicalPens).toHaveLength(162)
    expect(new Set(physicalPens.map(pen => pen.id)).size).toBe(162)
    expect(new Set(physicalPens.map(pen => pen.animal_key)).size).toBe(162)
    expect(housingCoverage().size).toBe(162)

    for (const animal of dimensions.animals) {
      expect(() => housingClassFor(animal.id)).not.toThrow()
      expect(physicalPens.some(pen => pen.animal_key === animal.id)).toBe(true)
    }
  })

  it("keeps every planned pen inside its structural Blender module", () => {
    const modules = new Map(baseModules.map(module => [module.id, module]))
    for (const pen of physicalPens) {
      const module = modules.get(pen.module_id)
      expect(module, pen.module_id).toBeDefined()
      expect(pen.bounds_m.min[0]).toBeGreaterThanOrEqual(module!.min[0] - 1e-6)
      expect(pen.bounds_m.min[2]).toBeGreaterThanOrEqual(module!.min[2] - 1e-6)
      expect(pen.bounds_m.max[0]).toBeLessThanOrEqual(module!.max[0] + 1e-6)
      expect(pen.bounds_m.max[2]).toBeLessThanOrEqual(module!.max[2] + 1e-6)
      expect(pen.bounds_m.min[1]).toBeGreaterThanOrEqual(module!.min[1] - 1e-6)
      expect(pen.bounds_m.max[1]).toBeLessThanOrEqual(module!.max[1] + 1e-6)
    }
  })

  it("does not overlap planned pens within the same structural module", () => {
    const byModule = new Map<string, typeof physicalPens>()
    for (const pen of physicalPens) {
      const list = byModule.get(pen.module_id)
      if (list) list.push(pen)
      else byModule.set(pen.module_id, [pen])
    }

    for (const pens of byModule.values()) {
      for (let i = 0; i < pens.length; i++) {
        for (let j = i + 1; j < pens.length; j++) {
          const a = pens[i].bounds_m
          const b = pens[j].bounds_m
          const overlapX = Math.min(a.max[0], b.max[0]) - Math.max(a.min[0], b.min[0])
          const overlapZ = Math.min(a.max[2], b.max[2]) - Math.max(a.min[2], b.min[2])
          expect(Math.min(overlapX, overlapZ)).toBeLessThanOrEqual(1e-6)
        }
      }
    }
  })

  it("keeps every reference envelope inside its planned pen", () => {
    const pens = new Map(physicalPens.map(pen => [pen.id, pen]))

    for (const block of animalPlacements) {
      const pen = pens.get(block.enclosure)
      expect(pen, block.enclosure).toBeDefined()
      const { min, max } = pen!.bounds_m
      const rotated = Math.abs(block.rotation) > .1
      const halfX = (rotated ? block.dimensions[2] : block.dimensions[0]) / 2
      const halfY = block.dimensions[1] / 2
      const halfZ = (rotated ? block.dimensions[0] : block.dimensions[2]) / 2

      expect(block.position[0] - halfX).toBeGreaterThanOrEqual(min[0] - 1e-6)
      expect(block.position[0] + halfX).toBeLessThanOrEqual(max[0] + 1e-6)
      expect(block.position[1] - halfY).toBeGreaterThanOrEqual(min[1] - 1e-6)
      expect(block.position[1] + halfY).toBeLessThanOrEqual(max[1] + 1e-6)
      expect(block.position[2] - halfZ).toBeGreaterThanOrEqual(min[2] - 1e-6)
      expect(block.position[2] + halfZ).toBeLessThanOrEqual(max[2] + 1e-6)
    }
  })

  it("requires an explicit scale audit record for every animal group", () => {
    for (const animal of dimensions.animals) {
      expect(animal.reference_form, animal.id).toBeTruthy()
      expect(animal.life_stage, animal.id).toMatch(/^(adult|juvenile_independent)$/)
      expect(animal.posture, animal.id).toBeTruthy()
      expect(animal.dimension_basis, animal.id).toBeTruthy()
      expect(animal.scale_review, animal.id).toBe("zoological-proportion-v3")
      expect(animal.scale_confidence, animal.id).toMatch(/^(high|medium)$/)
      expect(animal.staging_position_m, animal.id).toBeNull()
      expect("enclosure" in animal, animal.id).toBe(false)
      expect("housing_status" in animal, animal.id).toBe(false)
      expect("dimension_status" in animal, animal.id).toBe(false)
    }
  })

  it("records posture-aware proportions instead of generic animal blocks", () => {
    const byId = new Map(dimensions.animals.map(animal => [animal.id, animal]))
    const anteater = byId.get("tamanduas")!
    const brownBear = byId.get("ursos_pardos")!
    const pig = byId.get("porcos")!

    expect(anteater.posture).toBe("quadrupede")
    expect(anteater.dimensions_m.height).toBeLessThan(brownBear.dimensions_m.height)
    expect(anteater.dimensions_m.length).toBeGreaterThan(anteater.dimensions_m.height * 2)
    expect(pig.dimensions_m.height).toBeLessThan(1)
    expect(dimensions.animals.every(animal => animal.posture && animal.dimension_basis)).toBe(true)
  })

  it("eliminates extreme crowding and reserves explicit service space", () => {
    expect(Math.max(...physicalPens.map(pen => pen.occupancy_ratio))).toBeLessThan(.66)
    expect(serviceZones.length).toBeGreaterThan(0)
    expect(serviceZones.every(zone => zone.area_m2 >= .5)).toBe(true)

    expect(planningSummary).toHaveLength(3)
    for (const deck of planningSummary) {
      expect(deck.animal_area_ratio).toBeGreaterThan(.25)
      expect(deck.animal_area_ratio).toBeLessThan(.8)
    }
  })

  it("uses compact specialist housing for the smallest animals", () => {
    expect(housingClassFor("camundongos")).toBe("small_cage")
    expect(housingClassFor("hamsters")).toBe("small_cage")
    expect(housingClassFor("pererecas")).toBe("micro_terrarium")
    expect(housingClassFor("formigas")).toBe("insectarium")

    const mousePen = physicalPens.find(pen => pen.animal_key === "camundongos")!
    const antPen = physicalPens.find(pen => pen.animal_key === "formigas")!
    expect(mousePen.floor_area_m2).toBeLessThan(1)
    expect(antPen.floor_area_m2).toBeLessThan(.7)
  })
})
