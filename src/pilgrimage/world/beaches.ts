import type { ElevationInfo } from "./elevation-core"
import type { WaterInfo } from "./hydrology"

/**
 * Isolated port of Pilgrimage beachAccess().
 * Sand is only allowed where low, gently sloped dry ground has a continuous
 * route to the local water surface.
 */
export function beachAccess(
  elevation: ElevationInfo,
  width: number,
  depth: number,
  kind: Uint8Array,
  water: WaterInfo,
): Uint8Array {
  const allowed = new Uint8Array(kind.length)
  const { beachHeight, beachSlope } = elevation.settings
  const suitable = new Uint8Array(kind.length)

  for (let i = 0; i < kind.length; i++) {
    if (kind[i]) continue

    const x = i % width
    const z = Math.floor(i / width)
    const corners = elevation.corners.slice(i * 4, i * 4 + 4)
    if (corners.length && Math.max(...corners) - Math.min(...corners) > beachSlope) continue

    suitable[i] = 1
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx
      const nz = z + dz
      if (nx < 0 || nz < 0 || nx >= width || nz >= depth) continue

      const neighbour = nz * width + nx
      if (!kind[neighbour]) continue
      if (Math.abs(elevation.height[i] - water.surface[neighbour]) > beachHeight) suitable[i] = 0
    }
  }

  const queue: Array<{ i: number; distance: number; level: number }> = []
  for (let i = 0; i < kind.length; i++) {
    if (kind[i]) queue.push({ i, distance: 0, level: water.surface[i] })
  }

  for (let q = 0; q < queue.length; q++) {
    const { i, distance, level } = queue[q]
    const x = i % width
    const z = Math.floor(i / width)
    if (distance >= 2) continue

    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx
      const nz = z + dz
      if (nx < 0 || nz < 0 || nx >= width || nz >= depth) continue

      const neighbour = nz * width + nx
      if (!suitable[neighbour] || allowed[neighbour]) continue

      const rise = elevation.height[neighbour] - level
      if (rise < -.01 || rise > beachHeight) continue
      if (Math.abs(elevation.height[neighbour] - (kind[i] ? level : elevation.height[i])) > beachSlope) continue

      allowed[neighbour] = 1
      queue.push({ i: neighbour, distance: distance + 1, level })
    }
  }

  return allowed
}
