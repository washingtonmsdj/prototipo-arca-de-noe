import * as THREE from "three"
import {
  BASE_PERSON,
  type Point3,
} from "../../../vendor/pilgrimage/lib/game/base-person/pose"
import { createWildlifeRig } from "../wildlife/rig"
import {
  speciesGaits,
  type WildlifeGait,
} from "../wildlife/gait"
import {
  isBird,
  type WildlifeKind,
} from "../wildlife/species"
import {
  ANIMAL_FRAMES,
  type AnimalClip,
  type AnimalJoint,
  type AnimalRigEdits,
} from "../wildlife/rig-edits"
import { easeWing } from "../wildlife/motion"
import { burrowPreview } from "../wildlife/burrow-motion"
import { createAnimalRig } from "../transport/animal-rig"
import {
  TRANSPORT,
  type Animal,
  type HorseVariant,
} from "../transport-core"
import { personCamera } from "./camera"
import { spriteDepthBaker, SPRITE_DEPTH_ENCODING } from "./depth"
import { inkAnimalFrame } from "./ink"
import { addSurfaceLighting } from "./lighting"
import { personCastShadow } from "./shadow"

export type AnimalBakeTarget =
  | {
      family: "wildlife"
      kind: WildlifeKind
      clip: AnimalClip
      edits?: AnimalRigEdits
    }
  | {
      family: "transport"
      kind: Animal
      variant?: HorseVariant
      coatId?: string
      clip: "idle" | "walk" | "graze"
      edits?: AnimalRigEdits
    }

export interface AnimalBakeRegistration {
  direction: string
  frame: number
  phase: number
  joints: Partial<Record<AnimalJoint, { x: number; y: number; depth: number; world: Point3 }>>
}

export interface AnimalClipBake {
  color: string
  depth: string
  shadow: string
  metadata: {
    family: AnimalBakeTarget["family"]
    kind: string
    clip: string
    frames: number
    directions: string[]
    cellSize: number
    anchor: number[]
    safePadding: number
    depthEncoding: typeof SPRITE_DEPTH_ENCODING
    registrations: AnimalBakeRegistration[]
  }
}

interface NormalizedRig {
  root: THREE.Group
  joints: () => Partial<Record<AnimalJoint, { position: Point3 }>>
  pose: (phase: number) => void
  dispose: () => void
}

function wildlifeGait(kind: WildlifeKind, clip: AnimalClip): WildlifeGait {
  const gaits = speciesGaits(kind)
  return gaits.includes(clip as WildlifeGait)
    ? clip as WildlifeGait
    : gaits[0] ?? "walk"
}

function normalizedRig(target: AnimalBakeTarget): NormalizedRig {
  if (target.family === "transport") {
    const variant = target.variant ?? "common"
    const rig = createAnimalRig(target.kind, variant, target.coatId)
    return {
      root: rig.root,
      joints: rig.joints,
      pose(phase) {
        rig.pose(
          phase,
          target.clip === "walk",
          target.clip === "graze" ? 1 : 0,
          target.edits,
        )
      },
      dispose: rig.dispose,
    }
  }

  const rig = createWildlifeRig(target.kind)
  const gait = wildlifeGait(target.kind, target.clip)
  const moving = ["walk", "trot", "canter", "gallop", "hop", "leap", "fly", "glide"].includes(target.clip)
  const bird = isBird(target.kind)

  return {
    root: rig.root,
    joints: rig.joints,
    pose(phase) {
      const restBlend = easeWing(Math.min(phase / .2, (1 - phase) / .2))
      const shelter = target.clip === "burrow" ? burrowPreview(phase) : null

      rig.pose(
        phase,
        moving,
        phase * 10,
        target.clip === "graze" ? 1 : 0,
        bird && moving,
        gait,
        {
          lying: target.clip === "lie" ? restBlend : 0,
          edits: target.edits,
          clip: target.clip,
          burrow: shelter ?? undefined,
          glide: target.clip === "glide" ? 1 : 0,
        },
      )

      rig.root.position.set(0, shelter?.y ?? (bird && moving ? .3 : 0), shelter?.z ?? 0)
      rig.root.rotation.x = shelter?.pitch ?? 0
      rig.root.visible = !shelter?.concealed
    },
    dispose: rig.dispose,
  }
}

function frameConfig(target: AnimalBakeTarget) {
  if (target.family === "transport") {
    return {
      size: TRANSPORT.cellSize,
      anchor: [...TRANSPORT.anchor] as [number, number],
      viewSize: TRANSPORT.viewSize,
    }
  }

  return {
    size: BASE_PERSON.cellSize,
    anchor: [...BASE_PERSON.anchor] as [number, number],
    viewSize: BASE_PERSON.camera.viewSize,
  }
}

function createCamera(size: number, anchor: [number, number], viewSize: number) {
  return personCamera({
    ...BASE_PERSON,
    cellSize: size,
    anchor,
    camera: { ...BASE_PERSON.camera, viewSize },
  })
}

function quantizeTransportPixels(source: Uint8ClampedArray) {
  const output = new Uint8ClampedArray(source)
  for (let i = 0; i < output.length; i += 4) {
    if (output[i + 3] < 128) {
      output.fill(0, i, i + 4)
      continue
    }
    output[i + 3] = 255
    for (let channel = 0; channel < 3; channel++) {
      output[i + channel] = Math.min(255, Math.round(output[i + channel] / 12) * 12)
    }
  }
  return output
}

const paintFrame = () => new Promise<void>((resolve) => {
  requestAnimationFrame(() => setTimeout(resolve, 0))
})

export async function bakeAnimalClip(
  target: AnimalBakeTarget,
  onProgress?: (done: number, total: number) => void,
): Promise<AnimalClipBake> {
  const config = frameConfig(target)
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    preserveDrawingBuffer: true,
  })
  renderer.localClippingEnabled = true
  renderer.setPixelRatio(1)
  renderer.setSize(config.size, config.size, false)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(0, 0)

  const scene = new THREE.Scene()
  addSurfaceLighting(scene)
  const camera = createCamera(config.size, config.anchor, config.viewSize)
  const depthBaker = spriteDepthBaker(renderer)
  const rig = normalizedRig(target)
  scene.add(rig.root)

  const frame = document.createElement("canvas")
  frame.width = config.size
  frame.height = config.size
  const frameContext = frame.getContext("2d", { willReadFrequently: true })!

  const sheet = document.createElement("canvas")
  sheet.width = config.size * ANIMAL_FRAMES
  sheet.height = config.size * BASE_PERSON.directions.length
  const sheetContext = sheet.getContext("2d")!

  const depthSheet = document.createElement("canvas")
  depthSheet.width = sheet.width
  depthSheet.height = sheet.height
  const depthContext = depthSheet.getContext("2d")!

  const shadowSheet = document.createElement("canvas")
  shadowSheet.width = sheet.width
  shadowSheet.height = sheet.height
  const shadowContext = shadowSheet.getContext("2d")!

  const registrations: AnimalBakeRegistration[] = []
  const point = new THREE.Vector3()
  let safePadding = config.size
  let done = 0
  const total = ANIMAL_FRAMES * BASE_PERSON.directions.length

  try {
    for (let row = 0; row < BASE_PERSON.directions.length; row++) {
      const heading = -row * Math.PI * 2 / BASE_PERSON.directions.length

      for (let frameIndex = 0; frameIndex < ANIMAL_FRAMES; frameIndex++) {
        const phase = frameIndex / ANIMAL_FRAMES
        rig.pose(phase)
        rig.root.rotation.y = heading
        rig.root.updateMatrixWorld(true)

        renderer.render(scene, camera)
        frameContext.clearRect(0, 0, config.size, config.size)
        frameContext.drawImage(renderer.domElement, 0, 0)

        const sourceImage = frameContext.getImageData(0, 0, config.size, config.size)
        const source = target.family === "transport"
          ? quantizeTransportPixels(sourceImage.data)
          : new Uint8ClampedArray(sourceImage.data)
        const inked = inkAnimalFrame(source, config.size)

        for (let y = 0; y < config.size; y++) for (let x = 0; x < config.size; x++) {
          const i = (y * config.size + x) * 4
          if (inked[i + 3] >= 128) {
            safePadding = Math.min(safePadding, x, y, config.size - 1 - x, config.size - 1 - y)
          }
        }

        const colorImage = frameContext.createImageData(config.size, config.size)
        colorImage.data.set(inked)
        frameContext.putImageData(colorImage, 0, 0)

        const depth = depthBaker.render(
          scene,
          camera,
          config.size,
          config.viewSize,
          source,
          inked,
        )
        const shadow = personCastShadow(frame, config.anchor, .22)

        sheetContext.drawImage(frame, frameIndex * config.size, row * config.size)
        depthContext.drawImage(depth, frameIndex * config.size, row * config.size)
        shadowContext.drawImage(shadow, frameIndex * config.size, row * config.size)

        const joints: AnimalBakeRegistration["joints"] = {}
        for (const [name, joint] of Object.entries(rig.joints())) {
          if (!joint) continue
          point.set(...joint.position)
          rig.root.localToWorld(point)
          const world = point.toArray() as Point3
          point.project(camera)
          joints[name as AnimalJoint] = {
            x: (point.x + 1) * config.size / 2,
            y: (1 - point.y) * config.size / 2,
            depth: point.z,
            world,
          }
        }

        registrations.push({
          direction: BASE_PERSON.directions[row],
          frame: frameIndex,
          phase,
          joints,
        })

        done++
        onProgress?.(done, total)
      }

      await paintFrame()
    }

    if (safePadding < 4) {
      throw new Error(`Animal exceeds the four-pixel safe frame (${safePadding}px).`)
    }

    return {
      color: sheet.toDataURL("image/png"),
      depth: depthSheet.toDataURL("image/png"),
      shadow: shadowSheet.toDataURL("image/png"),
      metadata: {
        family: target.family,
        kind: target.kind,
        clip: target.clip,
        frames: ANIMAL_FRAMES,
        directions: [...BASE_PERSON.directions],
        cellSize: config.size,
        anchor: config.anchor,
        safePadding,
        depthEncoding: SPRITE_DEPTH_ENCODING,
        registrations,
      },
    }
  } finally {
    scene.remove(rig.root)
    rig.dispose()
    depthBaker.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }
}

export function animalBakeFileStem(target: AnimalBakeTarget) {
  const kind = target.family === "transport" && target.kind === "horse"
    ? `horse-${target.variant ?? "common"}`
    : target.kind
  return `animal-${kind}-${target.clip}`
}
