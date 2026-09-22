import { ROUTE_DIRS } from "./grid-utils"
import type { ElevationInfo } from "./elevation-core"

export interface WaterInfo {
  surface: number[]
  downstream: number[]
  drop: number[]
  motion: Array<"still" | "flow" | "waterfall">
  depth: number[]
  flow: Record<number, readonly [number, number]>
}

/**
 * Isolated port of Pilgrimage drainWater().
 * Source: lib/game/map/hydrology.ts
 */
export function drainWater(
  kind: Uint8Array,
  depths: Uint8Array,
  width: number,
  depth: number,
  elevation: ElevationInfo,
): WaterInfo {
  const { settings } = elevation
  const size = kind.length
  const surface = new Array<number>(size).fill(0)
  const downstream = new Array<number>(size).fill(-1)
  const drop = new Array<number>(size).fill(0)
  const motion: WaterInfo["motion"] = new Array(size).fill("still")
  const flow: WaterInfo["flow"] = {}
  const seen = new Uint8Array(size)

  const neighbours = (i: number): number[] => {
    const x = i % width
    const z = Math.floor(i / width)
    return ROUTE_DIRS.flatMap(([dx, dz]) => {
      const nx = x + dx
      const nz = z + dz
      return nx >= 0 && nz >= 0 && nx < width && nz < depth && kind[nz * width + nx]
        ? [nz * width + nx]
        : []
    })
  }

  for (let start = 0; start < size; start++) {
    if (!kind[start] || seen[start]) continue

    const body = [start]
    seen[start] = 1
    for (let q = 0; q < body.length; q++) {
      for (const neighbour of neighbours(body[q])) {
        if (seen[neighbour]) continue
        seen[neighbour] = 1
        body.push(neighbour)
      }
    }

    let outlets = body.filter((i) => kind[i] === 2)
    if (!outlets.length) {
      const edge = body.find(
        (i) => i % width === 0 || i % width === width - 1 || i < width || i >= size - width,
      )
      outlets = [edge ?? body[0]]
    }

    const distance = new Map(outlets.map((i) => [i, 0]))
    const queue = [...outlets]
    let maxDistance = 0

    for (let q = 0; q < queue.length; q++) {
      for (const neighbour of neighbours(queue[q])) {
        if (distance.has(neighbour)) continue
        const d = distance.get(queue[q])! + 1
        distance.set(neighbour, d)
        downstream[neighbour] = queue[q]
        maxDistance = Math.max(maxDistance, d)
        queue.push(neighbour)
      }
    }

    for (const i of body) {
      const along = maxDistance - distance.get(i)!
      surface[i] = -0.05
        - along * settings.riverDrop
        - Math.floor(along / settings.waterfallSpacing) * settings.waterfallDrop
      elevation.height[i] = surface[i] - depths[i] * settings.waterDepth
    }

    for (const i of body) {
      const neighbour = downstream[i]
      if (kind[i] !== 1) continue

      if (neighbour < 0) {
        const x = i % width
        const z = Math.floor(i / width)
        if (x === 0) flow[i] = [-1, 0]
        else if (x === width - 1) flow[i] = [1, 0]
        else if (z === 0) flow[i] = [0, -1]
        else if (z === depth - 1) flow[i] = [0, 1]
        if (flow[i]) motion[i] = "flow"
        continue
      }

      drop[i] = Math.max(0, surface[i] - surface[neighbour])
      flow[i] = [
        (neighbour % width) - (i % width),
        Math.floor(neighbour / width) - Math.floor(i / width),
      ]
      motion[i] = drop[i] >= settings.cliffThreshold ? "waterfall" : "flow"
    }
  }

  return {
    depth: Array.from(depths),
    flow,
    surface,
    downstream,
    drop,
    motion,
  }
}
