import * as THREE from "three"
import { makeRng } from "../../vendor/pilgrimage/lib/game/rng"
import { isWoods, TERRAIN, type TerrainId } from "../pilgrimage/world/terrain"
import {
  normalizeSettings,
  sampleWoodland,
  seedingMethodForSeed,
} from "../pilgrimage/world/woodland"

export const WORLD_SIZE = 44
export const WORLD_TILES = 128
export const WORLD_SEED = 717

const settings = normalizeSettings({
  seed: WORLD_SEED,
  size: WORLD_TILES,
  forest: 40,
  clearings: 8,
  groves: 14,
  darkCount: 1,
  darkShare: 9,
  heart: 9,
  corridor: 3,
  rivers: 1,
  lakes: 1,
  water: 12,
  wind: 45,
})

export const WORLD_METHOD = seedingMethodForSeed(WORLD_SEED)
export const GENERATED_WORLD = sampleWoodland(
  WORLD_METHOD,
  settings,
  WORLD_TILES,
  WORLD_TILES,
  192,
)

const smooth = (t: number) => t * t * (3 - 2 * t)

export function elevationNoise(seed: number, x: number, z: number): number {
  const ix = Math.floor(x)
  const iz = Math.floor(z)
  const fx = smooth(x - ix)
  const fz = smooth(z - iz)
  const hash = (a: number, b: number) => makeRng(seed ^ Math.imul(a, 374761393) ^ Math.imul(b, 668265263))()
  return (hash(ix, iz) * (1 - fx) + hash(ix + 1, iz) * fx) * (1 - fz)
    + (hash(ix, iz + 1) * (1 - fx) + hash(ix + 1, iz + 1) * fx) * fz
}

export function worldToTile(x: number, z: number) {
  const tx = Math.max(0, Math.min(WORLD_TILES - 1, Math.floor((x / WORLD_SIZE + .5) * WORLD_TILES)))
  const tz = Math.max(0, Math.min(WORLD_TILES - 1, Math.floor((z / WORLD_SIZE + .5) * WORLD_TILES)))
  return { x: tx, z: tz, index: tz * WORLD_TILES + tx }
}

export function tileToWorld(x: number, z: number) {
  const tile = WORLD_SIZE / WORLD_TILES
  return {
    x: -WORLD_SIZE / 2 + (x + .5) * tile,
    z: -WORLD_SIZE / 2 + (z + .5) * tile,
  }
}

export function terrainKind(x: number, z: number): TerrainId {
  return GENERATED_WORLD.tiles[worldToTile(x, z).index] ?? "grass"
}

export function terrainHeight(x: number, z: number) {
  const tile = worldToTile(x, z)
  const broad = elevationNoise(WORLD_SEED ^ 0x510e527f, tile.x / 30, tile.z / 30)
  const fine = elevationNoise(WORLD_SEED ^ 0x9b05688c, tile.x / 7, tile.z / 7) - .5
  const edgeDistance = Math.min(tile.x, tile.z, WORLD_TILES - 1 - tile.x, WORLD_TILES - 1 - tile.z)
  const edge = smooth(Math.min(1, edgeDistance / 8))
  let height = Math.pow(Math.max(0, broad + fine * .12), 2) * 1.45 * edge
  if (GENERATED_WORLD.water[tile.index]) height -= .38
  return height
}

export function terrainSlope(x: number, z: number) {
  const epsilon = WORLD_SIZE / WORLD_TILES * .75
  const dx = (terrainHeight(x + epsilon, z) - terrainHeight(x - epsilon, z)) / (epsilon * 2)
  const dz = (terrainHeight(x, z + epsilon) - terrainHeight(x, z - epsilon)) / (epsilon * 2)
  return { dx, dz }
}

function tileColor(x: number, z: number) {
  const kind = terrainKind(x, z)
  const definition = TERRAIN[kind]
  const { index } = worldToTile(x, z)
  const jitterRng = makeRng(WORLD_SEED ^ Math.imul(index + 1, 0x45d9f3b))
  const jitter = (jitterRng() - .5) * definition.jitter * 2
  const color = new THREE.Color(definition.color)
  color.offsetHSL(0, 0, jitter)
  return color
}

export function createTerrainGeometry() {
  const geometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, WORLD_TILES, WORLD_TILES)
  geometry.rotateX(-Math.PI / 2)
  const position = geometry.attributes.position
  const colors: number[] = []

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const z = position.getZ(i)
    position.setY(i, terrainHeight(x, z))
    const color = tileColor(x, z)
    colors.push(color.r, color.g, color.b)
  }

  position.needsUpdate = true
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}

export function createWaterGeometry() {
  const tileSize = WORLD_SIZE / WORLD_TILES
  const vertices: number[] = []

  for (let z = 0; z < WORLD_TILES; z++) for (let x = 0; x < WORLD_TILES; x++) {
    const index = z * WORLD_TILES + x
    if (!GENERATED_WORLD.water[index]) continue
    const centre = tileToWorld(x, z)
    const half = tileSize * .51
    const y = terrainHeight(centre.x, centre.z) + .20
    const x0 = centre.x - half
    const x1 = centre.x + half
    const z0 = centre.z - half
    const z1 = centre.z + half
    vertices.push(
      x0, y, z0, x1, y, z0, x1, y, z1,
      x0, y, z0, x1, y, z1, x0, y, z1,
    )
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
  geometry.computeVertexNormals()
  return geometry
}

export interface ForestInstance {
  x: number
  z: number
  y: number
  scale: number
  dark: boolean
  rotation: number
}

export function forestInstances(limit = 440): ForestInstance[] {
  const candidates: ForestInstance[] = []
  for (let z = 0; z < WORLD_TILES; z++) for (let x = 0; x < WORLD_TILES; x++) {
    const index = z * WORLD_TILES + x
    const kind = GENERATED_WORLD.tiles[index]
    if (!isWoods(kind)) continue
    const rng = makeRng(WORLD_SEED ^ Math.imul(index + 17, 0x27d4eb2d))
    if (rng() > .2) continue
    const point = tileToWorld(x, z)
    const tileSize = WORLD_SIZE / WORLD_TILES
    const px = point.x + (rng() - .5) * tileSize * .85
    const pz = point.z + (rng() - .5) * tileSize * .85
    candidates.push({
      x: px,
      z: pz,
      y: terrainHeight(px, pz),
      scale: .55 + rng() * .9 + (kind === "darkwood" ? .35 : 0),
      dark: kind === "darkwood",
      rotation: rng() * Math.PI * 2,
    })
  }
  return candidates.slice(0, limit)
}

export function seeded(seed: number) {
  return makeRng(seed)
}
