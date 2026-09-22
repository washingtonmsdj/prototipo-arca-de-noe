import type { PlannedPen } from "./plannedEnclosures"

export interface EnclosureWallSegment {
  position: [number, number, number]
  size: [number, number, number]
}

const MIN_SEGMENT = .03

export function enclosureWallSegments(
  pen: PlannedPen,
  thickness: number,
): EnclosureWallSegment[] {
  const { min, max } = pen.bounds_m
  const height = pen.wall_height_m
  const y = min[1] + height / 2
  const x = (min[0] + max[0]) / 2
  const z = (min[2] + max[2]) / 2
  const width = max[0] - min[0]
  const depth = max[2] - min[2]
  const splitAccessWall = pen.access.kind === "walk_gate"
  const gateHalf = pen.access.opening_width_m / 2
  const result: EnclosureWallSegment[] = []

  const addWallAlongZ = (
    wallX: number,
    edge: "min_x" | "max_x",
  ) => {
    if (!splitAccessWall || pen.access.edge !== edge) {
      result.push({
        position: [wallX, y, z],
        size: [thickness, height, depth],
      })
      return
    }

    const gateZ = pen.access.gate_center_m[2]
    const gateStart = Math.max(min[2], gateZ - gateHalf)
    const gateEnd = Math.min(max[2], gateZ + gateHalf)
    const before = gateStart - min[2]
    const after = max[2] - gateEnd

    if (before > MIN_SEGMENT) {
      result.push({
        position: [wallX, y, (min[2] + gateStart) / 2],
        size: [thickness, height, before],
      })
    }
    if (after > MIN_SEGMENT) {
      result.push({
        position: [wallX, y, (gateEnd + max[2]) / 2],
        size: [thickness, height, after],
      })
    }
  }

  const addWallAlongX = (
    wallZ: number,
    edge: "min_z" | "max_z",
  ) => {
    if (!splitAccessWall || pen.access.edge !== edge) {
      result.push({
        position: [x, y, wallZ],
        size: [width, height, thickness],
      })
      return
    }

    const gateX = pen.access.gate_center_m[0]
    const gateStart = Math.max(min[0], gateX - gateHalf)
    const gateEnd = Math.min(max[0], gateX + gateHalf)
    const before = gateStart - min[0]
    const after = max[0] - gateEnd

    if (before > MIN_SEGMENT) {
      result.push({
        position: [(min[0] + gateStart) / 2, y, wallZ],
        size: [before, height, thickness],
      })
    }
    if (after > MIN_SEGMENT) {
      result.push({
        position: [(gateEnd + max[0]) / 2, y, wallZ],
        size: [after, height, thickness],
      })
    }
  }

  addWallAlongZ(min[0], "min_x")
  addWallAlongZ(max[0], "max_x")
  addWallAlongX(min[2], "min_z")
  addWallAlongX(max[2], "max_z")

  return result
}
