import { describe, expect, it } from "vitest"
import type { WaterInfo } from "./hydrology"
import { waterfallTurbulence } from "./waterfall-turbulence"

describe("waterfall turbulence", () => {
  it("propagates from a fall upstream and downstream through the drainage graph", () => {
    const water: WaterInfo = {
      depth: [1, 1, 1, 1, 1],
      surface: [0, -.01, -.8, -.81, -.82],
      downstream: [1, 2, 3, 4, -1],
      drop: [.01, .79, .01, .01, 0],
      motion: ["flow", "waterfall", "flow", "flow", "still"],
      flow: {
        0: [1, 0],
        1: [1, 0],
        2: [1, 0],
        3: [1, 0],
      },
    }

    const field = waterfallTurbulence(water, water.depth.length, 2)

    expect(field).toHaveLength(water.depth.length * 3)
    expect(field[1 * 3]).toBe(1)
    expect(field[0 * 3]).toBeGreaterThan(0)
    expect(field[2 * 3]).toBeGreaterThan(0)
    expect(field[3 * 3]).toBeGreaterThan(0)
    expect(field[4 * 3]).toBe(0)
    expect(Array.from(field).every(Number.isFinite)).toBe(true)
  })
})
