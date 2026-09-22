import { describe, expect, it } from "vitest"
import {
  anchorInCell,
  atlasCell,
  decodeDepthOffset,
  poseDepthFromBytes,
  projectPerspectiveViewZ,
  spriteRow,
} from "./depth-atlas"

describe("runtime depth atlas math", () => {
  it("selects the same eight-direction row convention as Pilgrimage", () => {
    expect(spriteRow(0, 0, 8)).toBe(0)
    expect(spriteRow(0, Math.PI / 4, 8)).toBe(1)
    expect(spriteRow(Math.PI / 2, 0, 8)).toBe(6)
    expect(spriteRow(0, -Math.PI / 4, 8)).toBe(7)
  })

  it("maps atlas rows from top-authored sheets into Three.js UV space", () => {
    expect(atlasCell(0, 0, 20, 8)).toEqual({
      scale: [1 / 20, 1 / 8],
      offset: [0, 7 / 8],
    })
    expect(atlasCell(19, 7, 20, 8)).toEqual({
      scale: [1 / 20, 1 / 8],
      offset: [19 / 20, 0],
    })
  })

  it("aligns the baked foot anchor with the runtime actor origin", () => {
    expect(anchorInCell([32, 48.5], 64)).toEqual([0, .5 - 48.5 / 64])
  })

  it("decodes the RG16 midpoint as approximately zero view offset", () => {
    const zero = decodeDepthOffset(128, 0)
    expect(Math.abs(zero)).toBeLessThan(2 / 65535)
    expect(decodeDepthOffset(255, 255)).toBe(1)
  })

  it("projects perspective view depth monotonically from near to far", () => {
    const near = .1
    const far = 100
    expect(projectPerspectiveViewZ(-near, near, far)).toBeCloseTo(0, 8)
    expect(projectPerspectiveViewZ(-far, near, far)).toBeCloseTo(1, 8)
    expect(projectPerspectiveViewZ(-2, near, far))
      .toBeLessThan(projectPerspectiveViewZ(-8, near, far))
  })

  it("moves positive baked depth offsets toward the camera", () => {
    const anchor = -10
    const near = .1
    const far = 100
    const anchorDepth = projectPerspectiveViewZ(anchor, near, far)
    const closer = poseDepthFromBytes(anchor, 192, 0, 3.4, near, far)

    expect(closer).toBeLessThan(anchorDepth)
  })
})
