import dimensionsJson from "../../concepts/arca/dimensoes-animais-jogo-v1.json"
import modulesJson from "../../concepts/arca/modulos-alojamento-base-v1.json"
import { housingClassFor, housingRuleFor, SECURE_PREDATORS, type HousingClass } from "./animalPlanning"

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

export type PenAccessEdge = "min_x" | "max_x" | "min_z" | "max_z"
export type PenAccessKind = "walk_gate" | "service_hatch"

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
  accessEdge: PenAccessEdge
}

interface Bin extends BaseModule {
  usedWidth: number
  placed: Placement[]
}

interface PlacementOption {
  bin: Bin
  candidate: Candidate
  width: number
  depth: number
  penRotated: boolean
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
  access: {
    edge: PenAccessEdge
    kind: PenAccessKind
    gate_center_m: Vec3
    opening_width_m: number
    service_zone_id: string | null
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

// Dedicated dry, enclosed service cabinets; never interleave insectariums with
// predator stalls or create a second corridor behind the pens.
const INSECTARIUM_MODULES = new Set(["MED-BE-09", "MED-BE-13"])

function acceptsAnimal(bin: Bin, animal: AnimalRecord) {
  if (bin.deck !== 2) return true
  const insect = housingClassFor(animal.id) === "insectarium"
  return INSECTARIUM_MODULES.has(bin.id) === insect
}

function fittingOptions(
  bin: Bin,
  candidates: Candidate[],
): PlacementOption[] {
  const options: PlacementOption[] = []

  const add = (availableWidth: number) => {
    const availableDepth = bin.depth
    if (availableWidth <= .05 || availableDepth <= .05) return

    for (const candidate of candidates) {
      for (const penRotated of [false, true]) {
        const width = penRotated ? candidate.depth : candidate.width
        const depth = penRotated ? candidate.width : candidate.depth
        if (
          width <= availableWidth + 1e-6
          && depth <= availableDepth + 1e-6
        ) {
          options.push({
            bin,
            candidate,
            width,
            depth,
            penRotated,
          })
        }
      }
    }
  }

  add(bin.width - bin.usedWidth)
  return options
}

function packDeck(deck: number) {
  const bins: Bin[] = baseModules
    .filter(module => module.deck === deck)
    .map(module => ({
      ...module,
      usedWidth: 0,
      placed: [],
    }))

  const items = animals
    .filter(animal => animal.deck === deck)
    .map(animal => {
      const candidates = rectangleCandidates(animal)
      const initialFits = bins.map(bin =>
        acceptsAnimal(bin, animal) ? fittingOptions(bin, candidates) : [],
      )
      const feasibleModules = initialFits.filter(options => options.length > 0).length
      const minAxisDemand = Math.min(
        ...initialFits.flatMap(options =>
          options.map(option => option.width)
        ),
      )
      return {
        animal,
        candidates,
        feasibleModules,
        minAxisDemand,
        maxArea: Math.max(...candidates.map(candidate => candidate.area)),
      }
    })
    .sort((a, b) =>
      a.feasibleModules - b.feasibleModules
      || b.minAxisDemand - a.minAxisDemand
      || b.maxArea - a.maxArea
    )

  for (const item of items) {
    let best:
      | {
          option: PlacementOption
          score: number
        }
      | undefined

    for (const option of bins.filter(bin => acceptsAnimal(bin, item.animal)).flatMap(bin =>
      fittingOptions(bin, item.candidates)
    )) {
      const remaining = option.bin.width - option.bin.usedWidth - option.width
      const score =
        option.bin.placed.length * 40
        + remaining * 2
        + Math.abs(option.candidate.area - option.candidate.targetArea)

      if (!best || score < best.score) {
        best = { option, score }
      }
    }

    if (!best) {
      throw new Error(
        `Sem acesso planejável para ${item.animal.name} no pavimento ${deck}`,
      )
    }

    const {
      bin,
      candidate,
      width,
      depth,
      penRotated,
    } = best.option
    const localX = bin.usedWidth
    // The pen must sit against the outer hull. The open/gate edge is the
    // inner edge facing the single central aisle.
    const localZ = bin.side > 0 ? 0 : bin.depth - depth
    const accessEdge: PenAccessEdge = bin.side > 0 ? "max_z" : "min_z"
    bin.usedWidth += width

    bin.placed.push({
      animal: item.animal,
      housingClass: housingClassFor(item.animal.id),
      module: bin,
      candidate,
      localX,
      localZ,
      width,
      depth,
      penRotated,
      accessEdge,
    })
  }

  return bins
}

const packedBins = [1, 2, 3].flatMap(packDeck)

function placementToPen(placement: Placement): PlannedPen {
  const {
    animal,
    module,
    candidate,
    width,
    depth,
    penRotated,
    housingClass,
    accessEdge,
  } = placement
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
  const wallHeight = Math.min(
    SECURE_PREDATORS.has(animal.id) ? Math.max(rule.wallHeight, 2.35) : rule.wallHeight,
    module.height - .08,
  )
  const accessKind: PenAccessKind = (
    housingClass === "small_cage"
    || housingClass === "terrarium"
    || housingClass === "micro_terrarium"
    || housingClass === "insectarium"
  ) ? "service_hatch" : "walk_gate"
  const accessSpan = (
    accessEdge === "min_x" || accessEdge === "max_x"
  ) ? depth : width
  const desiredOpening = (
    housingClass === "large_mammal" ? 1.6
      : housingClass === "herd_mammal" ? 1.25
        : housingClass === "medium_mammal" ? 1
          : housingClass === "large_bird" ? .85
            : housingClass === "small_bird" ? .58
              : housingClass === "small_mammal" ? .55
                : housingClass === "small_cage" ? .34
                  : housingClass === "terrarium" ? .4
                    : housingClass === "micro_terrarium" ? .28
                      : .22
  )
  const openingWidth = Math.max(
    .12,
    Math.min(desiredOpening, accessSpan * .55),
  )
  const gateCenter: Vec3 = [
    (min[0] + max[0]) / 2,
    min[1] + wallHeight / 2,
    (min[2] + max[2]) / 2,
  ]
  if (accessEdge === "min_x") gateCenter[0] = min[0]
  if (accessEdge === "max_x") gateCenter[0] = max[0]
  if (accessEdge === "min_z") gateCenter[2] = min[2]
  if (accessEdge === "max_z") gateCenter[2] = max[2]

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
    wall_height_m: wallHeight,
    layout: {
      columns,
      rows,
      rotated,
      gap: candidate.gap,
    },
    access: {
      edge: accessEdge,
      kind: accessKind,
      gate_center_m: gateCenter,
      opening_width_m: openingWidth,
      service_zone_id: null,
    },
  }
}

export const plannedPens: PlannedPen[] = packedBins
  .flatMap(bin => bin.placed.map(placementToPen))
  .sort((a, b) => a.deck - b.deck || a.bounds_m.min[0] - b.bounds_m.min[0])

const residualPurposes: Record<number, ServicePurpose[]> = {
  1: ["agua", "alimento", "manejo", "limpeza"],
  2: ["alimento", "agua", "limpeza", "manejo"],
  3: ["ventilacao", "alimento", "agua", "limpeza"],
}

export const serviceZones: ServiceZone[] = packedBins.flatMap((bin, binIndex) => {
  const zones: ServiceZone[] = []

  const remainingWidth = bin.width - bin.usedWidth
  if (remainingWidth * bin.depth >= .5) {
    const min: Vec3 = [
      bin.min[0] + bin.usedWidth,
      bin.min[1],
      bin.min[2],
    ]
    const max: Vec3 = [
      bin.max[0],
      bin.max[1],
      bin.max[2],
    ]
    zones.push({
      id: `SERVICE-RESIDUAL-${bin.id}`,
      module_id: bin.id,
      deck: bin.deck,
      side: bin.side,
      purpose: residualPurposes[bin.deck][binIndex % residualPurposes[bin.deck].length],
      bounds_m: { min, max },
      area_m2: remainingWidth * bin.depth,
    })
  }

  return zones
})

export const moduleAccessSummary = packedBins.map(bin => ({
  id: bin.id,
  deck: bin.deck,
  side: bin.side,
  pens: bin.placed.length,
  access: "central_aisle" as const,
}))

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
