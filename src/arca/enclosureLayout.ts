import catalog from "../../concepts/arca/catalogo-baias-fisicas-v1.json"
import dimensions from "../../concepts/arca/dimensoes-animais-jogo-v1.json"

export const physicalPens = catalog.pens
export const galleryAnimals = dimensions.animals.filter(a => a.staging_position_m)

// Placement, signage and collisions all refer to the same physical pen ID.
export const animalPlacements = dimensions.animals.flatMap((animal, group) => {
  const pen = physicalPens.find(p => p.id === animal.enclosure)
  const stage = animal.staging_position_m
  if (!pen && !stage) throw new Error(`Destino ausente: ${animal.enclosure}`)
  const min = pen ? pen.bounds_m.min : [stage![0] - 3.75, stage![1], stage![2] - 3.75]
  const max = pen ? pen.bounds_m.max : [stage![0] + 3.75, stage![1] + 4, stage![2] + 3.75]
  const { length, width, height } = animal.dimensions_m
  let layout = pen?.layout ?? null
  if (!pen) {
    // Reference gallery only. Real pens always use the saved, audited layout.
    let score = Infinity
    for (const rotated of [false, true]) for (let columns = 1; columns <= animal.quantity; columns++) {
      const rows = Math.ceil(animal.quantity / columns), gap = 0.15
      const sx = rotated ? width : length, sz = rotated ? length : width
      const w = columns * sx + (columns - 1) * gap, d = rows * sz + (rows - 1) * gap
      if (w < 7.3 && d < 7.3 && w * d < score) {
        layout = { columns, rows, rotated, gap }; score = w * d
      }
    }
  }
  if (!layout) throw new Error(`Sem distribuição válida: ${animal.name}`)
  const { columns, rows, rotated, gap } = layout
  const sx = rotated ? width : length, sz = rotated ? length : width
  const w = columns * sx + (columns - 1) * gap, d = rows * sz + (rows - 1) * gap
  if (w > max[0] - min[0] || d > max[2] - min[2] || height + 0.02 > max[1] - min[1]) {
    throw new Error(`Blocos excedem os limites de ${animal.enclosure}`)
  }
  return Array.from({ length: animal.quantity }, (_, index) => {
    // Interleave sexes: adjacent instances form pairs within this physical pen.
    const male = index % 2 === 0, number = Math.floor(index / 2) + 1
    return {
      id: `${animal.id}-${male ? "M" : "F"}-${String(number).padStart(2, "0")}`,
      animal: animal.name, enclosure: animal.enclosure, sex: male ? "M" : "F",
      dimensions: [length, height, width],
      position: [(min[0] + max[0] - w + sx) / 2 + index % columns * (sx + gap),
        min[1] + height / 2 + 0.02,
        (min[2] + max[2] - d + sz) / 2 + Math.floor(index / columns) * (sz + gap)],
      rotation: rotated ? Math.PI / 2 : 0, hue: group * 0.61803398875 % 1,
    }
  })
})
