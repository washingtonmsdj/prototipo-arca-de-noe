const DEPTH_DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const

/** Distance inside a covered region, capped at three bands. */
export function inwardTileDepth(kind: Uint8Array, width: number, depth: number): Uint8Array {
  const out = new Uint8Array(kind.length)
  const queue: number[] = []
  for (let i = 0; i < kind.length; i++) {
    if (kind[i] === 0) continue
    const x = i % width
    const z = Math.floor(i / width)
    for (const [dx, dz] of DEPTH_DIRECTIONS) {
      const nx = x + dx
      const nz = z + dz
      if (nx < 0 || nz < 0 || nx >= width || nz >= depth) continue
      if (kind[nz * width + nx] === 0) {
        out[i] = 1
        queue.push(i)
        break
      }
    }
  }
  for (let q = 0; q < queue.length; q++) {
    const x = queue[q] % width
    const z = Math.floor(queue[q] / width)
    for (const [dx, dz] of DEPTH_DIRECTIONS) {
      const nx = x + dx
      const nz = z + dz
      if (nx < 0 || nz < 0 || nx >= width || nz >= depth) continue
      const n = nz * width + nx
      if (kind[n] !== 0 && out[n] === 0) {
        out[n] = Math.min(3, out[queue[q]] + 1)
        queue.push(n)
      }
    }
  }
  for (let i = 0; i < kind.length; i++) if (kind[i] !== 0 && out[i] === 0) out[i] = 3
  return out
}
