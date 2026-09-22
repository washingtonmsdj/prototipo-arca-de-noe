import type { AnimalClipBake } from "../bake/animal-bake"
import type { HumanClipBake } from "../bake/human-bake"
import type { DepthSpriteMetadata } from "./depth-atlas"

export const BAKE_MANIFEST_VERSION = 1 as const

export type PersistedBakeKind = "human" | "wildlife" | "transport"

export interface BakeManifestEntry {
  id: string
  kind: PersistedBakeKind
  clip: string
  color: string
  depth: string
  shadow?: string
  metadata: DepthSpriteMetadata & Record<string, unknown>
}

export interface BakeManifest {
  version: typeof BAKE_MANIFEST_VERSION
  entries: Record<string, BakeManifestEntry>
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue)
  if (!value || typeof value !== "object") return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, stableValue(item)]),
  )
}

export function stableJson(value: unknown) {
  return JSON.stringify(stableValue(value))
}

export function bakeContentHash(value: unknown) {
  const input = stableJson(value)
  let hash = 0x811c9dc5

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }

  return (hash >>> 0).toString(16).padStart(8, "0")
}

function safePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function humanBakeId(bake: HumanClipBake) {
  const hash = bakeContentHash({
    clip: bake.metadata.clip,
    design: bake.metadata.design,
    attachment: bake.metadata.attachment,
    depthEncoding: bake.metadata.depthEncoding,
    viewSize: bake.metadata.viewSize,
  })
  return `human-${safePart(bake.metadata.clip)}-${hash}`
}

export function animalBakeId(bake: AnimalClipBake) {
  const source = bake.metadata.source ?? {
    family: bake.metadata.family,
    kind: bake.metadata.kind,
    clip: bake.metadata.clip,
  }
  const hash = bakeContentHash({
    source,
    depthEncoding: bake.metadata.depthEncoding,
    viewSize: bake.metadata.viewSize,
  })
  return `animal-${safePart(bake.metadata.kind)}-${safePart(bake.metadata.clip)}-${hash}`
}

export function bakeManifestEntry(
  bake: HumanClipBake | AnimalClipBake,
): BakeManifestEntry {
  const human = "design" in bake.metadata
  const id = human
    ? humanBakeId(bake as HumanClipBake)
    : animalBakeId(bake as AnimalClipBake)
  const base = `/bakes/${id}`

  return {
    id,
    kind: human
      ? "human"
      : (bake as AnimalClipBake).metadata.family,
    clip: bake.metadata.clip,
    color: `${base}-color.png`,
    depth: `${base}-depth.png`,
    shadow: `${base}-shadow.png`,
    metadata: bake.metadata as DepthSpriteMetadata & Record<string, unknown>,
  }
}

export function emptyBakeManifest(): BakeManifest {
  return { version: BAKE_MANIFEST_VERSION, entries: {} }
}

export function validateBakeManifest(input: unknown): BakeManifest {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid bake manifest.")
  }

  const value = input as Partial<BakeManifest>
  if (value.version !== BAKE_MANIFEST_VERSION) {
    throw new Error("Unsupported bake manifest version.")
  }
  if (!value.entries || typeof value.entries !== "object") {
    throw new Error("Bake manifest entries are missing.")
  }

  for (const [id, entry] of Object.entries(value.entries)) {
    if (!entry || typeof entry !== "object") {
      throw new Error(`Invalid bake manifest entry: ${id}`)
    }
    if (entry.id !== id) {
      throw new Error(`Bake manifest key/id mismatch: ${id}`)
    }
    if (!["human", "wildlife", "transport"].includes(entry.kind)) {
      throw new Error(`Invalid bake kind: ${id}`)
    }
    if (!entry.color || !entry.depth || !entry.metadata) {
      throw new Error(`Incomplete bake manifest entry: ${id}`)
    }
    if (entry.metadata.depthEncoding !== "view-offset-rg16-v1") {
      throw new Error(`Unsupported depth encoding: ${id}`)
    }
    if (!(entry.metadata.viewSize > 0)) {
      throw new Error(`Invalid bake view size: ${id}`)
    }
  }

  return value as BakeManifest
}

export async function loadBakeManifest(
  url = "/bakes/manifest.json",
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(url)
  if (!response.ok) {
    throw new Error(`Could not load bake manifest (${response.status}).`)
  }
  return validateBakeManifest(await response.json())
}
