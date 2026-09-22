import { describe, expect, it } from "vitest"
import { isWoods } from "../pilgrimage/world/terrain"
import {
  GENERATED_ELEVATION,
  GENERATED_HYDROLOGY,
  GENERATED_WATER,
  GENERATED_WORLD,
  WORLD_METHOD,
  WORLD_TILES,
  createCliffGeometry,
  findWalkableLoop,
  forestInstances,
  isWalkableLoop,
  terrainHeight,
  worldToTile,
} from "./terrain"

describe("generated world", () => {
  it("keeps woodland and water on the same deterministic seed field", () => {
    expect(GENERATED_WORLD.tiles).toHaveLength(WORLD_TILES * WORLD_TILES)
    expect(GENERATED_WORLD.water).toHaveLength(WORLD_TILES * WORLD_TILES)
    expect(GENERATED_WATER.kind).toHaveLength(WORLD_TILES * WORLD_TILES)
    expect(Array.from(GENERATED_WATER.kind)).toEqual(Array.from(GENERATED_WORLD.water))
    expect(GENERATED_WORLD.tiles.filter(isWoods).length).toBeGreaterThan(0)
    expect(Array.from(GENERATED_WATER.kind).some(Boolean)).toBe(true)
    expect(["groves", "cellular"]).toContain(WORLD_METHOD)
  })

  it("finishes elevation, corners, slopes and hydrology for every tile", () => {
    const area = WORLD_TILES * WORLD_TILES
    expect(GENERATED_ELEVATION.height).toHaveLength(area)
    expect(GENERATED_ELEVATION.corners).toHaveLength(area * 4)
    expect(GENERATED_ELEVATION.slope).toHaveLength(area)
    expect(GENERATED_ELEVATION.cliffs).toHaveLength(area)
    expect(GENERATED_HYDROLOGY.surface).toHaveLength(area)
    expect(GENERATED_HYDROLOGY.downstream).toHaveLength(area)
    expect(GENERATED_HYDROLOGY.drop).toHaveLength(area)
    expect(GENERATED_HYDROLOGY.motion).toHaveLength(area)

    expect(GENERATED_ELEVATION.height.every(Number.isFinite)).toBe(true)
    expect(GENERATED_ELEVATION.corners.every(Number.isFinite)).toBe(true)

    const wet = Array.from(GENERATED_WATER.kind)
      .map((kind, index) => kind ? index : -1)
      .filter((index) => index >= 0)

    expect(wet.length).toBeGreaterThan(0)
    expect(wet.every((index) => GENERATED_HYDROLOGY.surface[index] <= -0.05)).toBe(true)
  })

  it("keeps terrain sampling stable and bounded", () => {
    const samples = [[0, 0], [8.25, -11.5], [-21.9, 21.9]] as const
    for (const [x, z] of samples) {
      expect(terrainHeight(x, z)).toBe(terrainHeight(x, z))
      expect(Number.isFinite(terrainHeight(x, z))).toBe(true)
      const tile = worldToTile(x, z)
      expect(tile.x).toBeGreaterThanOrEqual(0)
      expect(tile.x).toBeLessThan(WORLD_TILES)
      expect(tile.z).toBeGreaterThanOrEqual(0)
      expect(tile.z).toBeLessThan(WORLD_TILES)
    }
  })

  it("derives forest instances deterministically from woodland data", () => {
    const first = forestInstances(32)
    const second = forestInstances(32)
    expect(first.length).toBeGreaterThan(0)
    expect(first.length).toBeLessThanOrEqual(32)
    expect(first).toEqual(second)
  })

  it("derives deterministic roaming loops that do not cross blocked terrain", () => {
    for (let seed = 0; seed < 16; seed++) {
      const first = findWalkableLoop(3000 + seed, 2.6)
      const second = findWalkableLoop(3000 + seed, 2.6)
      expect(first).toEqual(second)
      if (first.radius > 0) expect(isWalkableLoop(first.origin, first.radius)).toBe(true)
    }
  })

  it("builds cliff wall geometry when dry cliff edges exist", () => {
    let dryCliffEdges = 0
    for (let z = 0; z < WORLD_TILES; z++) for (let x = 0; x < WORLD_TILES; x++) {
      const index = z * WORLD_TILES + x
      if (GENERATED_WATER.kind[index]) continue

      if (x + 1 < WORLD_TILES) {
        const east = index + 1
        if (!GENERATED_WATER.kind[east]
          && Math.abs(GENERATED_ELEVATION.height[index] - GENERATED_ELEVATION.height[east])
            >= GENERATED_ELEVATION.settings.cliffThreshold) dryCliffEdges++
      }

      if (z + 1 < WORLD_TILES) {
        const south = index + WORLD_TILES
        if (!GENERATED_WATER.kind[south]
          && Math.abs(GENERATED_ELEVATION.height[index] - GENERATED_ELEVATION.height[south])
            >= GENERATED_ELEVATION.settings.cliffThreshold) dryCliffEdges++
      }
    }

    const geometry = createCliffGeometry()
    try {
      expect(geometry.attributes.position.count % 6).toBe(0)
      if (dryCliffEdges > 0) expect(geometry.attributes.position.count).toBeGreaterThan(0)
    } finally {
      geometry.dispose()
    }
  })
})
