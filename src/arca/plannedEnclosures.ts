import dimensionsJson from "../../concepts/arca/dimensoes-animais-jogo-v1.json"
import modulesJson from "../../concepts/arca/modulos-alojamento-base-v1.json"
import { housingClassFor, housingRuleFor, type HousingClass } from "./animalPlanning"

type Vec3 = [number, number, number]

interface AnimalRecord {
  id: string
  name: string
  deck: number
  quantity: number
  dimensions_m: { length: number; width: number; height: number }
  posture: string
  dimension_basis: string
}

interface SourceModule {
  id: string
  deck: number
  side: number
  bounds_m: { min: Vec3; max: Vec3 }
}

interface BaseModule {
  id: string
  deck: number
  side: number
  min: Vec3
  max: Vec3
  width: number
  depth: number
  height: number
}

interface Candidate {
  width: number
  depth: number
  columns: number
  rows: number
  animalRotated: boolean
  gap: number
  area: number
  targetArea: number
  aspect: number
}

interface FreeRect {
  x: number
  z: number
  width: number
  depth: number
}

interface Placement {
  animal: AnimalRecord
  housingClass: HousingClass
  module: BaseModule
  candidate: Candidate
  localX: number
  localZ: number
  width: number
  depth: number
  penRotated: boolean
}

interface Bin extends BaseModule {
  free: FreeRect[]
  placed: Placement[]
}

export interface PlannedPen {
  id: string
  animal_key: string
  animal_name: string
  module_id: string
  deck: number
  side: number
  housing_class: HousingClass
  bounds_m: { min: Vec3; max: Vec3 }
  usable_dimensions_m: [number, number, number]
  floor_area_m2: number
  target_area_m2: number
  body_footprint_m2: number
  occupancy_ratio: number
  wall_height_m: number
  layout: {
    columns: number
    rows: number
    rotated: boolean
    gap: number
  }
}

export type ServicePurpose =
  | "alimento"
  | "agua"
  | "manejo"
  | "limpeza"
  | "circulacao"
  | "ventilacao"

export interface ServiceZone {
  id: string
  module_id: string
  deck: number
  side: number
  purpose: ServicePurpose
  bounds_m: { min: Vec3; max: Vec3 }
  area_m2: number
}

const animals = dimensionsJson.animals as unknown as AnimalRecord[]
const sourceModules = modulesJson.modules as unknown as SourceModule[]

export const baseModules: BaseModule[] = sourceModules
  .map(module => ({
    id: module.id,
    deck: module.deck,
    side: module.side,
    min: [...module.bounds_m.min] as Vec3,
    max: [...module.bounds_m.max] as Vec3,
    width: module.bounds_m.max[0] - module.bounds_m.min[0],
    height: module.bounds_m.max[1] - module.bounds_m.min[1],
    depth: module.bounds_m.max[2] - module.bounds_m.min[2],
  }))
  .sort((a, b) => a.deck - b.deck || a.min[0] - b.min[0] || a.side - b.side)

if (baseModules.length !== 128) {
  throw new Error(`Cadastro estrutural inválido: ${baseModules.length}/128 módulos.`)
}

function rectangleCandidates(animal: AnimalRecord): Candidate[] {
  const housingClass = housingClassFor(animal.id)
  const rule = housingRuleFor(animal.id)
  const group = animal.quantity >= 10
  const footprint = animal.dimensions_m.length * animal.dimensions_m.width * animal.quantity
  const occupancy = group ? rule.groupOccupancy : rule.pairOccupancy
  const targetArea = Math.max(
    group ? rule.minGroupArea : rule.minPairArea,
    footprint / occupancy,
  )
  const maxAspect = group ? rule.maxGroupAspect : rule.maxPairAspect
  const gap = housingClass === "insectarium" ? .04 : .08
  const output: Candidate[] = []

  for (const animalRotated of [false, true]) {
    const sx = animalRotated ? animal.dimensions_m.width : animal.dimensions_m.length
    const sz = animalRotated ? animal.dimensions_m.length : animal.dimensions_m.width

    for (let columns = 1; columns <= animal.quantity; columns++) {
      const rows = Math.ceil(animal.quantity / columns)
      const minWidth = columns * sx + (columns - 1) * gap
      const minDepth = rows * sz + (rows - 1) * gap
      const minArea = minWidth * minDepth
      const expansion = Math.max(1, targetArea / minArea)

      for (const distribution of [0, .2, .4, .5, .6, .8, 1]) {
        const width = Math.max(
          rule.minSide,
          minWidth * Math.pow(expansion, distribution),
        )
        const depth = Math.max(
          rule.minSide,
          minDepth * Math.pow(expansion, 1 - distribution),
        )
        const aspect = Math.max(width / depth, depth / width)
        if (aspect > maxAspect + 1e-6) continue

        output.push({
          width,
          depth,
          columns,
          rows,
          animalRotated,
          gap,
          area: width * depth,
          targetArea,
          aspect,
        })
      }
    }
  }

  if (!output.length) {
    throw new Error(`Nenhuma forma de baia válida para ${animal.name}`)
  }

  output.sort((a, b) =>
    (
      Math.abs(a.area - targetArea)
      + Math.abs(a.aspect - 1.6) * .03
    ) - (
      Math.abs(b.area - targetArea)
      + Math.abs(b.aspect - 1.6) * .03
    )
  )

  return output.slice(0, 120)
}

function pruneFreeRects(rects: FreeRect[]) {
  return rects.filter((rect, index) =>
    !rects.some((other, otherIndex) =>
      otherIndex !== index
      && rect.x >= other.x - 1e-6
      && rect.z >= other.z - 1e-6
      && rect.x + rect.width <= other.x + other.width + 1e-6
      && rect.z + rect.depth <= other.z + other.depth + 1e-6
    )
  )
}

function splitFreeRect(rect: FreeRect, width: number, depth: number) {
  const horizontal: FreeRect[] = [
    {
      x: rect.x + width,
      z: rect.z,
      width: rect.width - width,
      depth,
    },
    {
      x: rect.x,
      z: rect.z + depth,
      width: rect.width,
      depth: rect.depth - depth,
    },
  ]
  const vertical: FreeRect[] = [
    {
      x: rect.x + width,
      z: rect.z,
      width: rect.width - width,
      depth: rect.depth,
    },
    {
      x: rect.x,
      z: rect.z + depth,
      width,
      depth: rect.depth - depth,
    },
  ]

  const quality = (items: FreeRect[]) =>
    items
      .filter(item => item.width > .05 && item.depth > .05)
      .reduce(
        (sum, item) => sum + item.width * item.depth * Math.min(item.width, item.depth),
        0,
      )

  return quality(horizontal) >= quality(vertical) ? horizontal : vertical
}

function packDeck(deck: number) {
  const bins: Bin[] = baseModules
    .filter(module => module.deck === deck)
    .map(module => ({
      ...module,
      free: [{ x: 0, z: 0, width: module.width, depth: module.depth }],
      placed: [],
    }))

  const items = animals
    .filter(animal => animal.deck === deck)
    .map(animal => ({
      animal,
      candidates: rectangleCandidates(animal),
    }))
    .sort((a, b) =>
      Math.max(...b.candidates.map(candidate => candidate.area))
      - Math.max(...a.candidates.map(candidate => candidate.area))
    )

  for (const item of items) {
    let best:
      | {
          bin: Bin
          freeIndex: number
          free: FreeRect
          candidate: Candidate
          width: number
          depth: number
          penRotated: boolean
          score: number
        }
      | undefined

    for (const bin of bins) {
      for (let freeIndex = 0; freeIndex < bin.free.length; freeIndex++) {
        const free = bin.free[freeIndex]
        for (const candidate of item.candidates) {
          for (const penRotated of [false, true]) {
            const width = penRotated ? candidate.depth : candidate.width
            const depth = penRotated ? candidate.width : candidate.depth
            if (width > free.width + 1e-6 || depth > free.depth + 1e-6) continue

            const waste = free.width * free.depth - width * depth
            const shapePenalty = Math.abs(
              Math.log((width / depth) / (free.width / free.depth)),
            ) * .03
            const score = waste + shapePenalty

            if (!best || score < best.score) {
              best = {
                bin,
                freeIndex,
                free,
                candidate,
                width,
                depth,
                penRotated,
                score,
              }
            }
          }
        }
      }
    }

    if (!best) {
      throw new Error(`Sem espaço planejado para ${item.animal.name} no pavimento ${deck}`)
    }

    const housingClass = housingClassFor(item.animal.id)
    best.bin.placed.push({
      animal: item.animal,
      housingClass,
      module: best.bin,
      candidate: best.candidate,
      localX: best.free.x,
      localZ: best.free.z,
      width: best.width,
      depth: best.depth,
      penRotated: best.penRotated,
    })

    const replacement = splitFreeRect(best.free, best.width, best.depth)
      .filter(rect => rect.width > .05 && rect.depth > .05)
    best.bin.free.splice(best.freeIndex, 1, ...replacement)
    best.bin.free = pruneFreeRects(best.bin.free)
  }

  return bins
}

const packedBins = [1, 2, 3].flatMap(packDeck)

function placementToPen(placement: Placement): PlannedPen {
  const { animal, module, candidate, width, depth, penRotated, housingClass } = placement
  const min: Vec3 = [
    module.min[0] + placement.localX,
    module.min[1],
    module.min[2] + placement.localZ,
  ]
  const max: Vec3 = [
    min[0] + width,
    module.max[1],
    min[2] + depth,
  ]

  const columns = penRotated ? candidate.rows : candidate.columns
  const rows = penRotated ? candidate.columns : candidate.rows
  const rotated = penRotated ? !candidate.animalRotated : candidate.animalRotated
  const floorArea = width * depth
  const bodyFootprint =
    animal.dimensions_m.length * animal.dimensions_m.width * animal.quantity
  const rule = housingRuleFor(animal.id)

  return {
    id: `PLAN-${animal.id}`,
    animal_key: animal.id,
    animal_name: animal.name,
    module_id: module.id,
    deck: module.deck,
    side: module.side,
    housing_class: housingClass,
    bounds_m: { min, max },
    usable_dimensions_m: [width, module.height, depth],
    floor_area_m2: floorArea,
    target_area_m2: candidate.targetArea,
    body_footprint_m2: bodyFootprint,
    occupancy_ratio: bodyFootprint / floorArea,
    wall_height_m: Math.min(rule.wallHeight, module.height - .08),
    layout: {
      columns,
      rows,
      rotated,
      gap: candidate.gap,
    },
  }
}

export const plannedPens: PlannedPen[] = packedBins
  .flatMap(bin => bin.placed.map(placementToPen))
  .sort((a, b) => a.deck - b.deck || a.bounds_m.min[0] - b.bounds_m.min[0])

const servicePurposes: Record<number, ServicePurpose[]> = {
  1: ["alimento", "agua", "manejo", "limpeza", "circulacao"],
  2: ["alimento", "agua", "manejo", "limpeza", "circulacao", "ventilacao"],
  3: ["alimento", "agua", "limpeza", "circulacao", "ventilacao"],
}

export const serviceZones: ServiceZone[] = packedBins.flatMap((bin, binIndex) =>
  bin.free
    .filter(rect => rect.width * rect.depth >= .5)
    .map((rect, freeIndex) => {
      const purposes = servicePurposes[bin.deck]
      const purpose = purposes[(binIndex + freeIndex) % purposes.length]
      const min: Vec3 = [
        bin.min[0] + rect.x,
        bin.min[1],
        bin.min[2] + rect.z,
      ]
      const max: Vec3 = [
        min[0] + rect.width,
        bin.max[1],
        min[2] + rect.depth,
      ]
      return {
        id: `SERVICE-${bin.id}-${freeIndex + 1}`,
        module_id: bin.id,
        deck: bin.deck,
        side: bin.side,
        purpose,
        bounds_m: { min, max },
        area_m2: rect.width * rect.depth,
      }
    })
)

export const plannedPenByAnimal = new Map(
  plannedPens.map(pen => [pen.animal_key, pen]),
)

if (plannedPens.length !== animals.length) {
  throw new Error(
    `Planejamento incompleto: ${plannedPens.length}/${animals.length} grupos.`,
  )
}

export const planningSummary = [1, 2, 3].map(deck => {
  const modules = baseModules.filter(module => module.deck === deck)
  const pens = plannedPens.filter(pen => pen.deck === deck)
  const baseArea = modules.reduce((sum, module) => sum + module.width * module.depth, 0)
  const animalArea = pens.reduce((sum, pen) => sum + pen.floor_area_m2, 0)
  return {
    deck,
    groups: pens.length,
    modules: modules.length,
    base_area_m2: baseArea,
    animal_area_m2: animalArea,
    animal_area_ratio: animalArea / baseArea,
  }
})
