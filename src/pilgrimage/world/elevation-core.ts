import { makeRng } from "../../../vendor/pilgrimage/lib/game/rng"
import { ROUTE_DIRS } from "./grid-utils"

/**
 * Isolated port of Pilgrimage elevation generation.
 *
 * Source: lib/game/map/elevation.ts
 * The building grading and GameMap-dependent helpers are intentionally omitted.
 */
export const ELEVATION_CONTROLS = {
  noiseSeed: { min: 0, max: 9999, value: 0 },
  maxHeight: { min: 0, max: 4, value: 2.4 },
  scale: { min: 8, max: 96, value: 36 },
  detail: { min: 0, max: 0.5, value: 0.12 },
  power: { min: 1, max: 4, value: 2 },
  cliffLength: { min: 8, max: 40, value: 20 },
  cliffRoughness: { min: 0, max: 1, value: 0.7 },
  cliffDensity: { min: 0.2, max: 2, value: 1 },
  bridgeSag: { min: 0.15, max: 1.2, value: 0.55 },
  cliffHeight: { min: 0, max: 2, value: 1 },
  cliffThreshold: { min: 0.25, max: 1, value: 0.65 },
  slopeCost: { min: 0, max: 60, value: 24 },
  bankTaper: { min: 4, max: 24, value: 10 },
  bankSlope: { min: 0.05, max: 0.3, value: 0.16 },
  beachHeight: { min: 0.05, max: 0.6, value: 0.3 },
  beachSlope: { min: 0.05, max: 0.4, value: 0.25 },
  lakeTaper: { min: 4, max: 32, value: 14 },
  lakeCliffs: { min: 0, max: 0.5, value: 0.25 },
  lakeShelf: { min: 1, max: 6, value: 3 },
  erosionScale: { min: 3, max: 24, value: 9 },
  bankWidth: { min: 3, max: 12, value: 5 },
  riverCut: { min: 0, max: 1, value: 0.8 },
  cutFrequency: { min: 0, max: 1, value: 0.55 },
  riverDrop: { min: 0, max: 0.04, value: 0.002 },
  waterfallDrop: { min: 0, max: 1.5, value: 0.8 },
  waterfallSpacing: { min: 12, max: 100, value: 90 },
  waterDepth: { min: 0.1, max: 1, value: 0.4 },
  edgeWidth: { min: 0.01, max: 0.12, value: 0.045 },
  edgeStrength: { min: 0, max: 1, value: 0.7 },
  shimmerCoverage: { min: 0, max: 1, value: 0.45 },
  shimmerSize: { min: 2, max: 16, value: 6 },
  shimmerSpeed: { min: 0.1, max: 2, value: 0.5 },
  shimmerStrength: { min: 0, max: 1, value: 0.35 },
  waterfallTurbulence: { min: 0, max: 1, value: 0.75 },
  turbulenceReach: { min: 1, max: 6, value: 3 },
  turbulenceSpeed: { min: 0.5, max: 4, value: 1.8 },
  foam: { min: 0, max: 1, value: 0.45 },
} as const

export type ElevationSettings = { [K in keyof typeof ELEVATION_CONTROLS]: number }

export const DEFAULT_ELEVATION = Object.fromEntries(
  Object.entries(ELEVATION_CONTROLS).map(([key, control]) => [key, control.value]),
) as ElevationSettings

export function elevationSettings(input: Partial<ElevationSettings> = {}): ElevationSettings {
  const result = { ...DEFAULT_ELEVATION }
  for (const key of Object.keys(result) as (keyof ElevationSettings)[]) {
    const control = ELEVATION_CONTROLS[key]
    const value = input[key]
    if (value !== undefined && Number.isFinite(value)) {
      result[key] = Math.max(control.min, Math.min(control.max, value))
    }
  }
  return result
}

export interface ElevationInfo {
  settings: ElevationSettings
  height: number[]
  corners: number[]
  slope: number[]
  cliffs: number[]
}

const smooth = (t: number) => t * t * (3 - 2 * t)

export function elevationNoise(seed: number, x: number, z: number): number {
  const ix = Math.floor(x)
  const iz = Math.floor(z)
  const fx = smooth(x - ix)
  const fz = smooth(z - iz)
  const hash = (a: number, b: number) => makeRng(seed ^ Math.imul(a, 374761393) ^ Math.imul(b, 668265263))()
  return (hash(ix, iz) * (1 - fx) + hash(ix + 1, iz) * fx) * (1 - fz)
    + (hash(ix, iz + 1) * (1 - fx) + hash(ix + 1, iz + 1) * fx) * fz
}

export function generateElevation(
  seed: number,
  width: number,
  depth: number,
  water: Uint8Array,
  input?: Partial<ElevationSettings>,
  flow: Map<number, readonly [number, number]> = new Map(),
): ElevationInfo {
  const settings = elevationSettings(input)
  const height = new Array<number>(width * depth)
  seed ^= Math.imul(settings.noiseSeed, 0x5be0cd19)

  const nearestWater = new Int32Array(height.length).fill(-1)
  const distance = new Int32Array(height.length).fill(width + depth)
  const queue: number[] = []

  for (let i = 0; i < height.length; i++) {
    if (!water[i]) continue
    distance[i] = 0
    nearestWater[i] = i
    queue.push(i)
  }

  for (let q = 0; q < queue.length; q++) {
    const i = queue[q]
    const x = i % width
    const z = Math.floor(i / width)
    for (const [dx, dz] of ROUTE_DIRS) {
      const nx = x + dx
      const nz = z + dz
      const n = nz * width + nx
      if (nx < 0 || nz < 0 || nx >= width || nz >= depth || distance[n] <= distance[i] + 1) continue
      distance[n] = distance[i] + 1
      nearestWater[n] = nearestWater[i]
      queue.push(n)
    }
  }

  const rng = makeRng(seed ^ 0x6a09e667)
  const ridges = Array.from(
    { length: Math.ceil(width * depth / 2200 * settings.cliffDensity) },
    () => {
      const angle = rng() * Math.PI * 2
      return {
        x: rng() * width,
        z: rng() * depth,
        c: Math.cos(angle),
        s: Math.sin(angle),
        length: settings.cliffLength * (0.5 + rng()),
        breadth: 4 + rng() * 8,
        bend: (rng() - 0.5) * 0.8,
        phase: rng() * 100,
        relief: 0.7 + rng() * 0.6,
      }
    },
  )

  for (let z = 0; z < depth; z++) for (let x = 0; x < width; x++) {
    const i = z * width + x
    const broad = elevationNoise(seed ^ 0x510e527f, x / settings.scale, z / settings.scale)
    const fine = elevationNoise(seed ^ 0x9b05688c, x / 7, z / 7) - 0.5
    let h = Math.pow(Math.max(0, broad + fine * settings.detail), settings.power)
      * Math.max(0, settings.maxHeight - settings.cliffHeight)

    for (const ridge of ridges) {
      const dx = x - ridge.x
      const dz = z - ridge.z
      const u = (dx * ridge.c + dz * ridge.s) / ridge.length
      if (Math.abs(u) >= 1) continue

      const warp = (elevationNoise(seed ^ 0xa54ff53a, u * 3 + ridge.phase, ridge.phase) - 0.5)
        * settings.cliffRoughness
      const v = (-dx * ridge.s + dz * ridge.c) / ridge.breadth - ridge.bend * u * u - warp
      const rim = 0.35
        + (elevationNoise(seed ^ 0x3c6ef372, u * 7 + ridge.phase, 11) - 0.5)
        * settings.cliffRoughness * 0.65
      if (v < -1 || v >= rim) continue

      const end = smooth(Math.min(1, (1 - Math.abs(u)) / 0.28))
      const back = smooth(Math.min(1, (v + 1) / (rim + 0.6)))
      h += settings.cliffHeight * ridge.relief * end * back
    }

    let bank = smooth(Math.min(1, Math.max(0, (distance[i] - settings.bankWidth) / 6)))
    const river = nearestWater[i]
    const heading = flow.get(river)
    if (heading && !water[i]) {
      const rx = river % width
      const rz = Math.floor(river / width)
      const side = (x - rx) * -heading[1] + (z - rz) * heading[0]
      const cutNoise = elevationNoise(seed ^ 0x1f83d9ab, rx / 16, rz / 16)
      const cut = smooth(Math.min(1, Math.max(0, (settings.cutFrequency - cutNoise) * 8)))
      if (side > 0) bank = Math.max(bank, settings.riverCut * cut)
    }

    const edge = smooth(Math.min(1, Math.min(x, z, width - 1 - x, depth - 1 - z) / 6))
    height[i] = Math.min(settings.maxHeight, h) * bank * edge
  }

  return { settings, height, corners: [], slope: [], cliffs: [] }
}

function forEachEdge(
  elevation: ElevationInfo,
  width: number,
  depth: number,
  water: Uint8Array,
  surface: number[],
  i: number,
  visit: (neighbour: number, side: number, delta: number) => void,
) {
  const x = i % width
  const z = Math.floor(i / width)
  const h = water[i] ? surface[i] : elevation.height[i]

  ROUTE_DIRS.forEach(([dx, dz], side) => {
    const nx = x + dx
    const nz = z + dz
    if (nx < 0 || nz < 0 || nx >= width || nz >= depth) return
    const neighbour = nz * width + nx
    visit(
      neighbour,
      side,
      Math.abs(h - (water[neighbour] ? surface[neighbour] : elevation.height[neighbour])),
    )
  })
}

function updateElevationEdges(
  elevation: ElevationInfo,
  width: number,
  depth: number,
  water: Uint8Array,
  surface: number[],
) {
  elevation.slope = elevation.height.map(() => 0)
  elevation.cliffs = elevation.height.map(() => 0)

  for (let i = 0; i < elevation.height.length; i++) {
    forEachEdge(elevation, width, depth, water, surface, i, (neighbour, side, delta) => {
      if (!water[i] && !water[neighbour]) {
        elevation.slope[i] = Math.max(elevation.slope[i], delta)
      }
      if (delta >= elevation.settings.cliffThreshold) elevation.cliffs[i] |= 1 << side
    })
  }
}

export function cliffMask(
  elevation: ElevationInfo,
  width: number,
  depth: number,
  water: Uint8Array,
  surface: number[],
): Uint8Array {
  const mask = new Uint8Array(elevation.height.length)
  for (let i = 0; i < mask.length; i++) {
    forEachEdge(elevation, width, depth, water, surface, i, (_neighbour, _side, delta) => {
      if (delta >= elevation.settings.cliffThreshold) mask[i] = 1
    })
  }
  return mask
}

export function finishElevation(
  elevation: ElevationInfo,
  width: number,
  depth: number,
  water: Uint8Array,
  surface: number[],
) {
  updateElevationEdges(elevation, width, depth, water, surface)
  elevation.corners = new Array(elevation.height.length * 4)

  for (let vertexZ = 0; vertexZ <= depth; vertexZ++) {
    for (let vertexX = 0; vertexX <= width; vertexX++) {
      const touching: Array<{ i: number; corner: number; x: number; z: number }> = []

      for (let dz = -1; dz <= 0; dz++) for (let dx = -1; dx <= 0; dx++) {
        const x = vertexX + dx
        const z = vertexZ + dz
        if (x < 0 || z < 0 || x >= width || z >= depth) continue
        touching.push({
          i: z * width + x,
          corner: (dx === -1 ? 1 : 0) + (dz === -1 ? 2 : 0),
          x,
          z,
        })
      }

      const seen = new Set<number>()
      for (const tile of touching) {
        if (seen.has(tile.i)) continue
        seen.add(tile.i)

        if (water[tile.i]) {
          elevation.corners[tile.i * 4 + tile.corner] = surface[tile.i]
          continue
        }

        const group = [tile]
        for (let q = 0; q < group.length; q++) {
          for (const neighbour of touching) {
            const at = group[q]
            if (
              seen.has(neighbour.i)
              || water[neighbour.i]
              || Math.abs(at.x - neighbour.x) + Math.abs(at.z - neighbour.z) !== 1
            ) continue
            if (Math.abs(elevation.height[at.i] - elevation.height[neighbour.i]) >= elevation.settings.cliffThreshold) continue
            seen.add(neighbour.i)
            group.push(neighbour)
          }
        }

        const h = group.reduce((sum, point) => sum + elevation.height[point.i], 0) / group.length
        for (const point of group) elevation.corners[point.i * 4 + point.corner] = h
      }
    }
  }
}

export function elevationStep(elevation: ElevationInfo | undefined, a: number, b: number): number {
  if (!elevation) return 0
  const delta = Math.abs(elevation.height[a] - elevation.height[b])
  return delta >= elevation.settings.cliffThreshold ? Infinity : delta * elevation.settings.slopeCost
}
