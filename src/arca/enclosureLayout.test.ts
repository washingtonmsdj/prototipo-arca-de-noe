import { describe, expect, it } from "vitest"
import catalog from "../../concepts/arca/catalogo-baias-fisicas-v1.json"
import dimensions from "../../concepts/arca/dimensoes-animais-jogo-v1.json"
import {
  animalPlacements,
  pendingAnimals,
  physicalPens,
} from "./enclosureLayout"

describe("ark animal enclosure layout", () => {
  it("keeps every catalogued individual inside the ark", () => {
    expect(dimensions.total_groups).toBe(162)
    expect(dimensions.total_individuals).toBe(1080)
    expect(dimensions.animals).toHaveLength(162)
    expect(animalPlacements).toHaveLength(1080)
    expect(pendingAnimals).toHaveLength(0)
    expect(dimensions.animals.every(animal => animal.staging_position_m === null)).toBe(true)
  })

  it("has one occupied physical pen for every animal group", () => {
    expect(catalog.count).toBe(162)
    expect(catalog.occupied).toBe(162)
    expect(catalog.available).toBe(0)
    expect(physicalPens).toHaveLength(162)

    const animalPens = dimensions.animals.map(animal => animal.enclosure)
    expect(new Set(animalPens).size).toBe(162)
    expect(new Set(physicalPens.map(pen => pen.id)).size).toBe(162)
    expect(physicalPens.every(pen => pen.status === "ocupada")).toBe(true)
    expect(physicalPens.every(pen => pen.animal_key && pen.layout)).toBe(true)
  })

  it("keeps every reference envelope inside its audited pen bounds", () => {
    const pens = new Map(physicalPens.map(pen => [pen.id, pen]))

    for (const block of animalPlacements) {
      const pen = pens.get(block.enclosure)
      expect(pen, block.enclosure).toBeDefined()
      const { min, max } = pen!.bounds_m
      const rotated = Math.abs(block.rotation) > 0.1
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

  it("compacts the pig pen and creates exactly twenty runtime partition modules", () => {
    const pig = dimensions.animals.find(animal => animal.id === "porcos")!
    const cassowary = dimensions.animals.find(animal => animal.id === "casuares")!
    expect(pig.enclosure).toBe("MED-BE-07-A")
    expect(cassowary.enclosure).toBe("MED-BE-07-B")

    const pigPen = physicalPens.find(pen => pen.id === pig.enclosure)!
    expect(pigPen.usable_dimensions_m[0]).toBeLessThan(2.4)

    const partitionModules = new Set(
      physicalPens
        .filter(pen => "runtime_partition" in pen && pen.runtime_partition)
        .map(pen => pen.module_id),
    )
    expect(partitionModules.size).toBe(20)
  })
})
