export const DEPTH_ATLAS_ENCODING = "view-offset-rg16-v1" as const

export interface DepthSpriteMetadata {
  frames: number
  directions: readonly string[]
  cellSize: number
  viewSize: number
  anchor: readonly number[]
  depthEncoding: typeof DEPTH_ATLAS_ENCODING
}

export function spriteRow(
  heading: number,
  cameraYaw: number,
  directions = 8,
) {
  const step = Math.PI * 2 / directions
  return ((Math.round((cameraYaw - heading) / step) % directions) + directions) % directions
}

export function atlasCell(
  frame: number,
  row: number,
  frames: number,
  rows: number,
) {
  const safeFrame = ((Math.floor(frame) % frames) + frames) % frames
  const safeRow = ((Math.floor(row) % rows) + rows) % rows
  return {
    scale: [1 / frames, 1 / rows] as const,
    offset: [
      safeFrame / frames,
      (rows - 1 - safeRow) / rows,
    ] as const,
  }
}

export function anchorInCell(
  anchor: readonly number[],
  cellSize: number,
) {
  return [
    anchor[0] / cellSize - .5,
    .5 - anchor[1] / cellSize,
  ] as const
}

export function decodeDepthOffset(high: number, low: number) {
  const packed = Math.max(0, Math.min(255, high)) * 256
    + Math.max(0, Math.min(255, low))
  return packed / 65535 * 2 - 1
}

export function projectPerspectiveViewZ(
  viewZ: number,
  near: number,
  far: number,
) {
  if (!(viewZ < 0) || near <= 0 || far <= near) {
    throw new Error("Invalid perspective depth inputs.")
  }
  const m22 = -(far + near) / (far - near)
  const m32 = -(2 * far * near) / (far - near)
  const ndc = (m22 * viewZ + m32) / -viewZ
  return ndc * .5 + .5
}

export function poseDepthFromBytes(
  anchorViewZ: number,
  high: number,
  low: number,
  worldSize: number,
  near: number,
  far: number,
) {
  const sampleViewZ = anchorViewZ + decodeDepthOffset(high, low) * worldSize
  return projectPerspectiveViewZ(sampleViewZ, near, far)
}
