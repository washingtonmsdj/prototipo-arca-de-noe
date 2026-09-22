import type { Point2 } from "./types"

export interface LegSolution {
  knee: Point2
  foot: Point2
}

export function solveTwoBoneLeg(hip: Point2, desiredFoot: Point2, upper: number, lower: number): LegSolution {
  const dy = desiredFoot.y - hip.y
  const dz = desiredFoot.z - hip.z
  const rawDistance = Math.hypot(dy, dz)
  const minReach = Math.abs(upper - lower) + 1e-4
  const maxReach = upper + lower - 1e-4
  const distance = Math.min(maxReach, Math.max(minReach, rawDistance))
  const ny = rawDistance > 1e-6 ? dy / rawDistance : -1
  const nz = rawDistance > 1e-6 ? dz / rawDistance : 0
  const foot = {
    y: hip.y + ny * distance,
    z: hip.z + nz * distance,
  }

  const a = (upper * upper - lower * lower + distance * distance) / (2 * distance)
  const h = Math.sqrt(Math.max(0, upper * upper - a * a))
  const baseY = hip.y + ny * a
  const baseZ = hip.z + nz * a

  const candidateA = { y: baseY - nz * h, z: baseZ + ny * h }
  const candidateB = { y: baseY + nz * h, z: baseZ - ny * h }
  const knee = candidateA.z >= candidateB.z ? candidateA : candidateB

  return { knee, foot }
}
