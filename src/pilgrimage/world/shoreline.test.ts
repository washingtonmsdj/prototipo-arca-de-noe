import { describe, expect, it } from "vitest"
import { elevationSettings, type ElevationInfo } from "./elevation-core"
import {
  shorelineCorners,
  shorelineInset,
  type ShorelineField,
} from "./shoreline"
import type { TerrainId } from "./terrain"

function field(
  water: number[],
  tiles: TerrainId[],
  surfaceLevel = 0,
  landHeight = 0,
): ShorelineField {
  const elevation: ElevationInfo = {
    settings: elevationSettings(),
    height: water.map((wet) => wet ? surfaceLevel - .2 : landHeight),
    corners: water.flatMap((wet) => {
      const height = wet ? surfaceLevel : landHeight
      return [height, height, height, height]
    }),
    slope: water.map(() => 0),
    cliffs: water.map(() => 0),
  }

  return {
    width: 2,
    depth: 2,
    tiles,
    water: Uint8Array.from(water),
    elevation,
    surface: water.map((wet) => wet ? surfaceLevel : 0),
  }
}

describe("diagonal shoreline", () => {
  it("lets a water corner become a matching dry half", () => {
    const source = field(
      [1, 0, 0, 0],
      ["water", "grass", "grass", "grass"],
    )

    expect(shorelineCorners(source, 0, 0)).toEqual([1, 0, 0, 0])
    expect(shorelineInset(.9, .9, [1, 0, 0, 0])).toBeGreaterThan(0)
  })

  it("adds the reciprocal water half to a dry diagonal corner", () => {
    const source = field(
      [0, 1, 1, 1],
      ["grass", "water", "water", "water"],
    )

    expect(shorelineCorners(source, 0, 0)).toEqual([1, 0, 0, 0])
  })

  it("does not smooth a large waterfall or cliff step into a shoreline half", () => {
    const source = field(
      [1, 0, 0, 0],
      ["water", "grass", "grass", "grass"],
      -.8,
      0,
    )

    expect(shorelineCorners(source, 0, 0)).toEqual([0, 0, 0, 0])
  })
})
