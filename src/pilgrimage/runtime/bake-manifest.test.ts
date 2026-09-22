import { describe, expect, it } from "vitest"
import {
  animalBakeId,
  bakeContentHash,
  bakeManifestEntry,
  emptyBakeManifest,
  humanBakeId,
  stableJson,
  validateBakeManifest,
} from "./bake-manifest"

const depthMetadata = {
  frames: 20,
  directions: ["S", "SW", "W", "NW", "N", "NE", "E", "SE"],
  cellSize: 64,
  viewSize: 3.466666666666667,
  anchor: [32, 48.5],
  safePadding: 4,
  depthEncoding: "view-offset-rg16-v1" as const,
}

describe("persistent bake manifest", () => {
  it("hashes equivalent objects identically regardless of key order", () => {
    expect(stableJson({ b: 2, a: 1 })).toBe(stableJson({ a: 1, b: 2 }))
    expect(bakeContentHash({ b: 2, a: 1 })).toBe(bakeContentHash({ a: 1, b: 2 }))
  })

  it("changes human identity when the authored design changes", () => {
    const base = {
      color: "data:image/png;base64,color",
      depth: "data:image/png;base64,depth",
      shadow: "data:image/png;base64,shadow",
      metadata: {
        ...depthMetadata,
        clip: "walk",
        registrations: [],
        design: { stride: .8, tunicColor: "#507186" },
      },
    }

    const changed = {
      ...base,
      metadata: {
        ...base.metadata,
        design: { ...base.metadata.design, stride: .9 },
      },
    }

    expect(humanBakeId(base as never)).not.toBe(humanBakeId(changed as never))
  })

  it("changes animal identity for pelage, variant or rig edits", () => {
    const base = {
      color: "data:image/png;base64,color",
      depth: "data:image/png;base64,depth",
      shadow: "data:image/png;base64,shadow",
      metadata: {
        ...depthMetadata,
        family: "transport",
        kind: "horse",
        clip: "walk",
        registrations: [],
        source: {
          family: "transport",
          kind: "horse",
          variant: "common",
          coatId: "bay",
          clip: "walk",
          edits: { version: 1, clips: {} },
        },
      },
    }

    const changed = {
      ...base,
      metadata: {
        ...base.metadata,
        source: { ...base.metadata.source, coatId: "grey" },
      },
    }

    expect(animalBakeId(base as never)).not.toBe(animalBakeId(changed as never))
  })

  it("builds flat public bake URLs from deterministic ids", () => {
    const bake = {
      color: "data:image/png;base64,color",
      depth: "data:image/png;base64,depth",
      shadow: "data:image/png;base64,shadow",
      metadata: {
        ...depthMetadata,
        clip: "walk",
        registrations: [],
        design: { stride: .8 },
      },
    }
    const entry = bakeManifestEntry(bake as never)

    expect(entry.id.startsWith("human-walk-")).toBe(true)
    expect(entry.color).toBe(`/bakes/${entry.id}-color.png`)
    expect(entry.depth).toBe(`/bakes/${entry.id}-depth.png`)
  })

  it("validates the empty manifest and rejects unsupported depth metadata", () => {
    expect(validateBakeManifest(emptyBakeManifest())).toEqual({
      version: 1,
      entries: {},
    })

    expect(() => validateBakeManifest({
      version: 1,
      entries: {
        bad: {
          id: "bad",
          kind: "human",
          clip: "walk",
          color: "/bakes/bad-color.png",
          depth: "/bakes/bad-depth.png",
          metadata: { ...depthMetadata, depthEncoding: "wrong" },
        },
      },
    })).toThrow(/depth encoding/i)
  })
})
