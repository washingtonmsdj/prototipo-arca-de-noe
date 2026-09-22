import { describe, expect, it } from "vitest"
import { beachAccess } from "./beaches"
import { elevationSettings, type ElevationInfo } from "./elevation-core"
import type { WaterInfo } from "./hydrology"

function elevation(heights: number[]): ElevationInfo {
  return {
    settings: elevationSettings({ beachHeight: .3, beachSlope: .25 }),
    height: [...heights],
    corners: heights.flatMap((height) => [height, height, height, height]),
    slope: heights.map(() => 0),
    cliffs: heights.map(() => 0),
  }
}

function water(kind: Uint8Array): WaterInfo {
  return {
    depth: Array.from(kind),
    surface: kind.map((wet) => wet ? -.05 : 0) as unknown as number[],
    downstream: Array.from(kind, () => -1),
    drop: Array.from(kind, () => 0),
    motion: Array.from(kind, () => "still" as const),
    flow: {},
  }
}

describe("beach access", () => {
  it("allows a gentle two-tile route from water and stops beyond its reach", () => {
    const kind = Uint8Array.from([1, 0, 0, 0, 0, 0])
    const allowed = beachAccess(
      elevation([-.4, .1, .2, .25, .25, .25]),
      6,
      1,
      kind,
      water(kind),
    )

    expect(Array.from(allowed)).toEqual([0, 1, 1, 0, 0, 0])
  })

  it("rejects a bank that is too high or too steep for sand", () => {
    const kind = Uint8Array.from([1, 0, 0])
    const allowed = beachAccess(
      elevation([-.4, .5, .55]),
      3,
      1,
      kind,
      water(kind),
    )

    expect(Array.from(allowed)).toEqual([0, 0, 0])
  })
})
