import { describe, expect, it } from "vitest"
import { BASE_PERSON } from "../../../vendor/pilgrimage/lib/game/base-person/pose"
import { personCamera } from "./camera"
import { registerDepthPixels, SPRITE_DEPTH_ENCODING } from "./depth"
import { humanBakeFileStem } from "./human-bake"
import { animalBakeFileStem } from "./animal-bake"

describe("Pilgrimage human bake primitives", () => {
  it("keeps the registered orthographic camera aligned with the person recipe", () => {
    const camera = personCamera(BASE_PERSON)
    expect(camera.isOrthographicCamera).toBe(true)
    expect(camera.right - camera.left).toBeCloseTo(BASE_PERSON.camera.viewSize)
    expect(camera.top - camera.bottom).toBeCloseTo(BASE_PERSON.camera.viewSize)
  })

  it("preserves RG16 depth bytes for an opaque source pixel", () => {
    const depth = new Uint8Array([128, 42, 255, 255])
    const source = new Uint8ClampedArray([90, 80, 70, 255])
    const inked = new Uint8ClampedArray([90, 80, 70, 255])
    const output = registerDepthPixels(depth, source, inked, 1)

    expect(Array.from(output)).toEqual([128, 42, 255, 255])
    expect(SPRITE_DEPTH_ENCODING).toBe("view-offset-rg16-v1")
  })

  it("creates stable filesystem-safe bake names", () => {
    expect(humanBakeFileStem("Storybook", "wearyWalk")).toBe("human-storybook-wearyWalk")
    expect(humanBakeFileStem("Tall / Warm", "idle")).toBe("human-tall-warm-idle")
    expect(humanBakeFileStem("Storybook", "walk", { kind: "hammer", socket: "rightHand" }))
      .toBe("human-storybook-walk-hammer-rightHand")
    expect(animalBakeFileStem({ family: "wildlife", kind: "deer", clip: "walk" })).toBe("animal-deer-walk")
    expect(animalBakeFileStem({ family: "transport", kind: "horse", variant: "noble", clip: "graze" })).toBe("animal-horse-noble-graze")
  })
})
