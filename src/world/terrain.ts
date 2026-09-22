import * as THREE from "three"

export const WORLD_SIZE = 44

export function terrainHeight(x: number, z: number) {
  const broad = Math.sin(x * .14) * .55 + Math.cos(z * .11) * .48
  const detail = Math.sin((x + z) * .31) * .16 + Math.cos((x - z) * .27) * .12
  const valley = -Math.exp(-((x + Math.sin(z * .13) * 2.2) ** 2) / 8) * .65
  return broad + detail + valley
}

export function terrainSlope(x: number, z: number) {
  const epsilon = .08
  const dx = (terrainHeight(x + epsilon, z) - terrainHeight(x - epsilon, z)) / (epsilon * 2)
  const dz = (terrainHeight(x, z + epsilon) - terrainHeight(x, z - epsilon)) / (epsilon * 2)
  return { dx, dz }
}

export function createTerrainGeometry() {
  const geometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 72, 72)
  geometry.rotateX(-Math.PI / 2)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const z = position.getZ(i)
    position.setY(i, terrainHeight(x, z))
  }
  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

export function seeded(seed: number) {
  let value = seed >>> 0
  return () => {
    value = Math.imul(value ^ (value >>> 15), 1 | value)
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}
