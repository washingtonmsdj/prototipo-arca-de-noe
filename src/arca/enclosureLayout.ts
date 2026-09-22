import catalog from "../../concepts/arca/catalogo-baias-fisicas-v1.json"
import dimensions from "../../concepts/arca/dimensoes-animais-jogo-v1.json"

export const physicalPens = catalog.pens
export const pendingAnimals = dimensions.animals.filter(animal => animal.staging_position_m)

if (pendingAnimals.length > 0) {
  throw new Error(`Existem ${pendingAnimals.length} grupos fora da arca.`)
}

const pensById = new Map(physicalPens.map(pen => [pen.id, pen]))

// Placement, signage and collisions all refer to the same audited physical pen ID.
export const animalPlacements = dimensions.animals.flatMap((animal, group) => {
  const pen = pensById.get(animal.enclosure)
  if (!pen) throw new Error(`Baia ausente: ${animal.enclosure}`)

  const { min, max } = pen.bounds_m
  const { length, width, height } = animal.dimensions_m
  const layout = pen.layout
  if (!layout) throw new Error(`Sem distribuicao auditada: ${animal.name}`)

  const { columns, rows, rotated, gap } = layout
  const sx = rotated ? width : length
  const sz = rotated ? length : width
  const w = columns * sx + (columns - 1) * gap
  const d = rows * sz + (rows - 1) * gap

  if (
    w > max[0] - min[0] + 1e-6
    || d > max[2] - min[2] + 1e-6
    || height + 0.02 > max[1] - min[1] + 1e-6
  ) {
    throw new Error(`Blocos excedem os limites de ${animal.enclosure}`)
  }

  return Array.from({ length: animal.quantity }, (_, index) => {
    const male = index % 2 === 0
    const number = Math.floor(index / 2) + 1
    return {
      id: `${animal.id}-${male ? "M" : "F"}-${String(number).padStart(2, "0")}`,
      animal: animal.name,
      enclosure: animal.enclosure,
      sex: male ? "M" : "F",
      posture: animal.posture,
      dimensionBasis: animal.dimension_basis,
      dimensions: [length, height, width] as [number, number, number],
      position: [
        (min[0] + max[0] - w + sx) / 2 + index % columns * (sx + gap),
        min[1] + height / 2 + 0.02,
        (min[2] + max[2] - d + sz) / 2 + Math.floor(index / columns) * (sz + gap),
      ] as [number, number, number],
      rotation: rotated ? Math.PI / 2 : 0,
      hue: group * 0.61803398875 % 1,
    }
  })
})
