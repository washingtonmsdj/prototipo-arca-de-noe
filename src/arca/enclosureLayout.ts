import dimensions from "../../concepts/arca/dimensoes-animais-jogo-v1.json"
import {
  plannedPenByAnimal,
  plannedPens,
  serviceZones,
} from "./plannedEnclosures"

export const physicalPens = plannedPens
export { serviceZones }

export const pendingAnimals = dimensions.animals.filter(animal => animal.staging_position_m)

if (pendingAnimals.length > 0) {
  throw new Error(`Existem ${pendingAnimals.length} grupos fora da arca.`)
}

// Animal placement, signage and collision all consume the same deterministic
// planned pen bounds. The old Blender enclosure catalogue is only a source of
// structural module boundaries for the planner.
export const animalPlacements = dimensions.animals.flatMap((animal, group) => {
  const pen = plannedPenByAnimal.get(animal.id)
  if (!pen) throw new Error(`Baia planejada ausente: ${animal.name}`)

  const { min, max } = pen.bounds_m
  const { length, width, height } = animal.dimensions_m
  const { columns, rows, rotated, gap } = pen.layout
  const sx = rotated ? width : length
  const sz = rotated ? length : width
  const occupiedWidth = columns * sx + (columns - 1) * gap
  const occupiedDepth = rows * sz + (rows - 1) * gap

  if (
    occupiedWidth > max[0] - min[0] + 1e-6
    || occupiedDepth > max[2] - min[2] + 1e-6
    || height + .02 > max[1] - min[1] + 1e-6
  ) {
    throw new Error(`Animais excedem a baia planejada de ${animal.name}`)
  }

  return Array.from({ length: animal.quantity }, (_, index) => {
    const male = index % 2 === 0
    const number = Math.floor(index / 2) + 1

    return {
      id: `${animal.id}-${male ? "M" : "F"}-${String(number).padStart(2, "0")}`,
      animal: animal.name,
      animalKey: animal.id,
      enclosure: pen.id,
      module: pen.module_id,
      housingClass: pen.housing_class,
      sex: male ? "M" : "F",
      posture: animal.posture,
      dimensionBasis: animal.dimension_basis,
      dimensions: [length, height, width] as [number, number, number],
      position: [
        (min[0] + max[0] - occupiedWidth + sx) / 2
          + index % columns * (sx + gap),
        min[1] + height / 2 + .02,
        (min[2] + max[2] - occupiedDepth + sz) / 2
          + Math.floor(index / columns) * (sz + gap),
      ] as [number, number, number],
      rotation: rotated ? Math.PI / 2 : 0,
      hue: group * .61803398875 % 1,
    }
  })
})
