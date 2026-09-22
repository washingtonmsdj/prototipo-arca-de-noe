import type { ElevationInfo } from "./elevation-core"
import type { TerrainId } from "./terrain"

export const SHORE_CORNERS = [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const
export type ShoreFlags = [number, number, number, number]

export const SHORELINE_MAX_STEP = .06

export interface ShorelineField {
  width: number
  depth: number
  tiles: readonly TerrainId[]
  water: Uint8Array
  elevation: ElevationInfo
  surface: readonly number[]
}

const BANKS = new Set<TerrainId>([
  "sand",
  "grass",
  "dirt",
  "clearing",
  "hills",
  "forest",
  "darkwood",
])

const normalizedMaterial = (terrain: TerrainId) =>
  terrain === "forest" || terrain === "darkwood" || terrain === "clearing"
    ? "grass"
    : terrain

function inBounds(field: ShorelineField, x: number, z: number) {
  return x >= 0 && z >= 0 && x < field.width && z < field.depth
}

function indexAt(field: ShorelineField, x: number, z: number) {
  return z * field.width + x
}

export function isWaterCell(field: ShorelineField, x: number, z: number) {
  return inBounds(field, x, z) && !!field.water[indexAt(field, x, z)]
}

function cornerHeight(field: ShorelineField, x: number, z: number, corner: number) {
  const index = indexAt(field, x, z)
  return field.water[index]
    ? field.surface[index]
    : field.elevation.corners[index * 4 + corner]
}

function cornerSurfacesMeet(
  field: ShorelineField,
  x: number,
  z: number,
  dx: number,
  dz: number,
) {
  let low = Infinity
  let high = -Infinity
  const corner = (dx > 0 ? 1 : 0) + (dz > 0 ? 2 : 0)
  const samples = [
    { x, z, corners: [corner, corner ^ 1, corner ^ 2] },
    { x: x + dx, z, corners: [corner ^ 1, corner ^ 3] },
    { x, z: z + dz, corners: [corner ^ 2, corner ^ 3] },
    { x: x + dx, z: z + dz, corners: [corner ^ 3] },
  ]

  for (const sample of samples) {
    if (!inBounds(field, sample.x, sample.z)) return false
    for (const sampleCorner of sample.corners) {
      const height = cornerHeight(field, sample.x, sample.z, sampleCorner)
      low = Math.min(low, height)
      high = Math.max(high, height)
    }
  }

  return high - low <= SHORELINE_MAX_STEP
}

/**
 * A water cell may donate one triangular half to a coherent dry bank.
 * This is the gameplay-free core of Pilgrimage's waterCorner().
 */
export function waterShoreCorner(field: ShorelineField, x: number, z: number) {
  if (!isWaterCell(field, x, z)) return -1

  for (const [corner, [dx, dz]] of SHORE_CORNERS.entries()) {
    const neighbours = [
      [x + dx, z],
      [x, z + dz],
      [x + dx, z + dz],
    ] as const

    if (neighbours.some(([nx, nz]) => {
      if (!inBounds(field, nx, nz)) return true
      const index = indexAt(field, nx, nz)
      return !!field.water[index] || !BANKS.has(field.tiles[index])
    })) continue

    const xMaterial = normalizedMaterial(field.tiles[indexAt(field, x + dx, z)])
    const zMaterial = normalizedMaterial(field.tiles[indexAt(field, x, z + dz)])
    if (xMaterial !== zMaterial) continue

    if (cornerSurfacesMeet(field, x, z, dx, dz)) return corner
  }

  return -1
}

/**
 * Reciprocal half-tile shoreline flags.
 * On water, a set corner is dry bank. On land, a set corner is water.
 */
export function shorelineCorners(field: ShorelineField, x: number, z: number): ShoreFlags {
  const corners: ShoreFlags = [0, 0, 0, 0]
  if (!inBounds(field, x, z)) return corners

  const index = indexAt(field, x, z)
  const terrain = field.tiles[index]
  if (!field.water[index] && !BANKS.has(terrain)) return corners

  if (field.water[index]) {
    const corner = waterShoreCorner(field, x, z)
    if (corner >= 0) corners[corner] = 1
    return corners
  }

  for (let corner = 0; corner < SHORE_CORNERS.length; corner++) {
    const [dx, dz] = SHORE_CORNERS[corner]
    if (
      !isWaterCell(field, x + dx, z)
      || !isWaterCell(field, x, z + dz)
      || !isWaterCell(field, x + dx, z + dz)
    ) continue

    if (!cornerSurfacesMeet(field, x, z, dx, dz)) continue

    const a = waterShoreCorner(field, x + dx, z)
    const b = waterShoreCorner(field, x, z + dz)
    if (
      (a >= 0 && SHORE_CORNERS[a][0] === -dx)
      || (b >= 0 && SHORE_CORNERS[b][1] === -dz)
    ) continue

    corners[corner] = 1
    break
  }

  return corners
}

export function shorelineInset(x: number, z: number, corners: ShoreFlags) {
  let inset = -1
  SHORE_CORNERS.forEach(([dx, dz], index) => {
    if (!corners[index]) return
    inset = Math.max(
      inset,
      1 - (dx > 0 ? 1 - x : x) - (dz > 0 ? 1 - z : z),
    )
  })
  return inset
}
