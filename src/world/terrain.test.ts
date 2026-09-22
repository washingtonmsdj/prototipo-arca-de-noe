import { describe, expect, it } from "vitest"
import { isWoods } from "../pilgrimage/world/terrain"
import {
  GENERATED_WORLD,
  WORLD_METHOD,
  WORLD_TILES,
  forestInstances,
  terrainHeight,
  worldToTile,
} from "./terrain"

describe("generated world", () => {
  it("builds woodland and water from the seeded generator", () => {
    expect(GENERATED_WORLD.tiles).toHaveLength(WORLD_TILES * WORLD_TILES)
    expect(GENERATED_WORLD.water).toHaveLength(WORLD_TILES * WORLD_TILES)
    expect(GENERATED_WORLD.tiles.filter(isWoods).length).toBeGreaterThan(0)
    expect(Array.from(GENERATED_WORLD.water).some(Boolean)).toBe(true)
    expect(["groves", "cellular"]).toContain(WORLD_METHOD)
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
})
