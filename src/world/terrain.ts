import * as THREE from "three"
import { makeRng } from "../../vendor/pilgrimage/lib/game/rng"
import {
  WATER_DEPTH_COLORS,
  isWoods,
  TERRAIN,
  type TerrainId,
} from "../pilgrimage/world/terrain"
import {
  normalizeSettings,
  sampleWoodland,
  seedingMethodForSeed,
} from "../pilgrimage/world/woodland"
import {
  generateWater,
  type WaterField,
} from "../pilgrimage/world/water"
import {
  finishElevation,
  generateElevation,
  type ElevationInfo,
} from "../pilgrimage/world/elevation-core"
import { drainWater, type WaterInfo } from "../pilgrimage/world/hydrology"

export const WORLD_SIZE = 44
export const WORLD_TILES = 128
export const WORLD_REGION_TILES = 192
export const WORLD_SEED = 717
export const HEIGHT_SCALE = .78

const settings = normalizeSettings({
  seed: WORLD_SEED,
  size: WORLD_TILES,
  forest: 40,
  clearings: 8,
  groves: 14,
  darkCount: 1,
  darkShare: 9,
  heart: 9,
  corridor: 3,
  rivers: 1,
  lakes: 1,
  water: 12,
  wind: 45,
})

export const WORLD_METHOD = seedingMethodForSeed(WORLD_SEED)

export const GENERATED_WORLD = sampleWoodland(
  WORLD_METHOD,
  settings,
  WORLD_TILES,
  WORLD_TILES,
  WORLD_REGION_TILES,
)

function cropWaterField(source: WaterField): WaterField {
  const offsetX = Math.floor((WORLD_REGION_TILES - WORLD_TILES) / 2)
  const offsetZ = Math.floor((WORLD_REGION_TILES - WORLD_TILES) / 2)
  const kind = new Uint8Array(WORLD_TILES * WORLD_TILES)
  const depth = new Uint8Array(kind.length)
  const flow = new Map<number, readonly [number, number]>()
  const bars = new Set<number>()

  for (let z = 0; z < WORLD_TILES; z++) for (let x = 0; x < WORLD_TILES; x++) {
    const local = z * WORLD_TILES + x
    const sourceIndex = (z + offsetZ) * WORLD_REGION_TILES + x + offsetX
    kind[local] = source.kind[sourceIndex]
    depth[local] = source.depth[sourceIndex]
    const heading = source.flow.get(sourceIndex)
    if (heading) flow.set(local, heading)
    if (source.bars.has(sourceIndex)) bars.add(local)
  }

  return { kind, depth, flow, bars }
}

const REGION_WATER = generateWater({
  rng: makeRng(WORLD_SEED ^ 0x94d049bb),
  width: WORLD_REGION_TILES,
  depth: WORLD_REGION_TILES,
  coverage: settings.water / 100,
  riverCount: settings.rivers,
  lakeCount: settings.lakes,
  pondCount: 0,
  landmarkArea: 192 ** 2,
})

export const GENERATED_WATER = cropWaterField(REGION_WATER)

export const GENERATED_ELEVATION: ElevationInfo = generateElevation(
  WORLD_SEED,
  WORLD_TILES,
  WORLD_TILES,
  GENERATED_WATER.kind,
  undefined,
  GENERATED_WATER.flow,
)

export const GENERATED_HYDROLOGY: WaterInfo = drainWater(
  GENERATED_WATER.kind,
  GENERATED_WATER.depth,
  WORLD_TILES,
  WORLD_TILES,
  GENERATED_ELEVATION,
)

finishElevation(
  GENERATED_ELEVATION,
  WORLD_TILES,
  WORLD_TILES,
  GENERATED_WATER.kind,
  GENERATED_HYDROLOGY.surface,
)

const TILE_SIZE = WORLD_SIZE / WORLD_TILES
const HALF_WORLD = WORLD_SIZE / 2

function worldSample(x: number, z: number) {
  const gx = Math.max(0, Math.min(WORLD_TILES - 1e-9, (x + HALF_WORLD) / TILE_SIZE))
  const gz = Math.max(0, Math.min(WORLD_TILES - 1e-9, (z + HALF_WORLD) / TILE_SIZE))
  const tx = Math.min(WORLD_TILES - 1, Math.floor(gx))
  const tz = Math.min(WORLD_TILES - 1, Math.floor(gz))
  return {
    x: tx,
    z: tz,
    index: tz * WORLD_TILES + tx,
    u: gx - tx,
    v: gz - tz,
  }
}

export function worldToTile(x: number, z: number) {
  const sample = worldSample(x, z)
  return { x: sample.x, z: sample.z, index: sample.index }
}

export function tileToWorld(x: number, z: number) {
  return {
    x: -HALF_WORLD + (x + .5) * TILE_SIZE,
    z: -HALF_WORLD + (z + .5) * TILE_SIZE,
  }
}

export function terrainKind(x: number, z: number): TerrainId {
  return GENERATED_WORLD.tiles[worldSample(x, z).index] ?? "grass"
}

function tileCornerHeight(index: number, corner: 0 | 1 | 2 | 3) {
  if (GENERATED_WATER.kind[index]) {
    return GENERATED_HYDROLOGY.surface[index] * HEIGHT_SCALE
  }
  return GENERATED_ELEVATION.corners[index * 4 + corner] * HEIGHT_SCALE
}

function bedHeight(index: number) {
  return GENERATED_ELEVATION.height[index] * HEIGHT_SCALE
}

export function terrainHeight(x: number, z: number) {
  const sample = worldSample(x, z)
  if (GENERATED_WATER.kind[sample.index]) {
    return GENERATED_HYDROLOGY.surface[sample.index] * HEIGHT_SCALE
  }

  const offset = sample.index * 4
  const corners = GENERATED_ELEVATION.corners
  const nw = corners[offset] * HEIGHT_SCALE
  const ne = corners[offset + 1] * HEIGHT_SCALE
  const sw = corners[offset + 2] * HEIGHT_SCALE
  const se = corners[offset + 3] * HEIGHT_SCALE

  if (sample.u + sample.v <= 1) {
    return nw + sample.u * (ne - nw) + sample.v * (sw - nw)
  }

  return se
    + (1 - sample.u) * (sw - se)
    + (1 - sample.v) * (ne - se)
}

export function terrainSlope(x: number, z: number) {
  const epsilon = TILE_SIZE * .35
  const dx = (terrainHeight(x + epsilon, z) - terrainHeight(x - epsilon, z)) / (epsilon * 2)
  const dz = (terrainHeight(x, z + epsilon) - terrainHeight(x, z - epsilon)) / (epsilon * 2)
  return { dx, dz }
}

function tileColor(index: number) {
  const kind = GENERATED_WORLD.tiles[index]
  const definition = TERRAIN[kind]
  const jitterRng = makeRng(WORLD_SEED ^ Math.imul(index + 1, 0x45d9f3b))
  const jitter = (jitterRng() - .5) * definition.jitter * 2
  const color = new THREE.Color(definition.color)
  color.offsetHSL(0, 0, jitter)
  return color
}

function pushTriangle(
  vertices: number[],
  colors: number[],
  color: THREE.Color,
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  c: readonly [number, number, number],
) {
  vertices.push(...a, ...b, ...c)
  for (let i = 0; i < 3; i++) colors.push(color.r, color.g, color.b)
}

export function createTerrainGeometry() {
  const vertices: number[] = []
  const colors: number[] = []

  for (let z = 0; z < WORLD_TILES; z++) for (let x = 0; x < WORLD_TILES; x++) {
    const index = z * WORLD_TILES + x
    const x0 = -HALF_WORLD + x * TILE_SIZE
    const x1 = x0 + TILE_SIZE
    const z0 = -HALF_WORLD + z * TILE_SIZE
    const z1 = z0 + TILE_SIZE
    const color = tileColor(index)

    if (GENERATED_WATER.kind[index]) {
      const y = bedHeight(index)
      pushTriangle(vertices, colors, color, [x0, y, z0], [x1, y, z0], [x0, y, z1])
      pushTriangle(vertices, colors, color, [x1, y, z0], [x1, y, z1], [x0, y, z1])
      continue
    }

    const nw = tileCornerHeight(index, 0)
    const ne = tileCornerHeight(index, 1)
    const sw = tileCornerHeight(index, 2)
    const se = tileCornerHeight(index, 3)

    pushTriangle(vertices, colors, color, [x0, nw, z0], [x1, ne, z0], [x0, sw, z1])
    pushTriangle(vertices, colors, color, [x1, ne, z0], [x1, se, z1], [x0, sw, z1])
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

function waterColor(depth: number) {
  return new THREE.Color(WATER_DEPTH_COLORS[Math.max(0, Math.min(WATER_DEPTH_COLORS.length - 1, depth - 1))])
}

export function createWaterGeometry() {
  const vertices: number[] = []
  const colors: number[] = []

  for (let z = 0; z < WORLD_TILES; z++) for (let x = 0; x < WORLD_TILES; x++) {
    const index = z * WORLD_TILES + x
    if (!GENERATED_WATER.kind[index]) continue

    const x0 = -HALF_WORLD + x * TILE_SIZE
    const x1 = x0 + TILE_SIZE
    const z0 = -HALF_WORLD + z * TILE_SIZE
    const z1 = z0 + TILE_SIZE
    const y = GENERATED_HYDROLOGY.surface[index] * HEIGHT_SCALE + .012
    const color = waterColor(GENERATED_WATER.depth[index])

    pushTriangle(vertices, colors, color, [x0, y, z0], [x1, y, z0], [x0, y, z1])
    pushTriangle(vertices, colors, color, [x1, y, z0], [x1, y, z1], [x0, y, z1])
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

export function createCliffGeometry() {
  const vertices: number[] = []
  const threshold = GENERATED_ELEVATION.settings.cliffThreshold * HEIGHT_SCALE

  const addWall = (
    topA: readonly [number, number, number],
    topB: readonly [number, number, number],
    bottomA: readonly [number, number, number],
    bottomB: readonly [number, number, number],
  ) => {
    if (
      Math.max(
        Math.abs(topA[1] - bottomA[1]),
        Math.abs(topB[1] - bottomB[1]),
      ) < threshold
    ) return
    vertices.push(
      ...topA, ...bottomA, ...topB,
      ...topB, ...bottomA, ...bottomB,
    )
  }

  for (let z = 0; z < WORLD_TILES; z++) for (let x = 0; x < WORLD_TILES; x++) {
    const index = z * WORLD_TILES + x
    if (GENERATED_WATER.kind[index]) continue

    const x0 = -HALF_WORLD + x * TILE_SIZE
    const x1 = x0 + TILE_SIZE
    const z0 = -HALF_WORLD + z * TILE_SIZE
    const z1 = z0 + TILE_SIZE

    if (x + 1 < WORLD_TILES) {
      const east = index + 1
      if (!GENERATED_WATER.kind[east]) {
        const a0 = tileCornerHeight(index, 1)
        const a1 = tileCornerHeight(index, 3)
        const b0 = tileCornerHeight(east, 0)
        const b1 = tileCornerHeight(east, 2)
        if ((a0 + a1) / 2 >= (b0 + b1) / 2) {
          addWall([x1, a0, z0], [x1, a1, z1], [x1, b0, z0], [x1, b1, z1])
        } else {
          addWall([x1, b0, z0], [x1, b1, z1], [x1, a0, z0], [x1, a1, z1])
        }
      }
    }

    if (z + 1 < WORLD_TILES) {
      const south = index + WORLD_TILES
      if (!GENERATED_WATER.kind[south]) {
        const a0 = tileCornerHeight(index, 2)
        const a1 = tileCornerHeight(index, 3)
        const b0 = tileCornerHeight(south, 0)
        const b1 = tileCornerHeight(south, 1)
        if ((a0 + a1) / 2 >= (b0 + b1) / 2) {
          addWall([x0, a0, z1], [x1, a1, z1], [x0, b0, z1], [x1, b1, z1])
        } else {
          addWall([x0, b0, z1], [x1, b1, z1], [x0, a0, z1], [x1, a1, z1])
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

export interface ForestInstance {
  x: number
  z: number
  y: number
  scale: number
  dark: boolean
  rotation: number
}

export function forestInstances(limit = 440): ForestInstance[] {
  const candidates: ForestInstance[] = []

  for (let z = 0; z < WORLD_TILES; z++) for (let x = 0; x < WORLD_TILES; x++) {
    const index = z * WORLD_TILES + x
    const kind = GENERATED_WORLD.tiles[index]
    if (!isWoods(kind)) continue

    const rng = makeRng(WORLD_SEED ^ Math.imul(index + 17, 0x27d4eb2d))
    if (rng() > .2) continue

    const point = tileToWorld(x, z)
    const px = point.x + (rng() - .5) * TILE_SIZE * .85
    const pz = point.z + (rng() - .5) * TILE_SIZE * .85
    candidates.push({
      x: px,
      z: pz,
      y: terrainHeight(px, pz),
      scale: .55 + rng() * .9 + (kind === "darkwood" ? .35 : 0),
      dark: kind === "darkwood",
      rotation: rng() * Math.PI * 2,
    })
  }

  return candidates.slice(0, limit)
}

export function seeded(seed: number) {
  return makeRng(seed)
}
