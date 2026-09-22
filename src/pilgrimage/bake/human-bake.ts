import * as THREE from "three"
import {
  PERSON_CLIPS,
  SOCKET_NAMES,
  WALK_CLIP_STRIDES,
  type BaseClip,
  type SocketName,
} from "../../../vendor/pilgrimage/lib/game/base-person/pose"
import {
  DEFAULT_DESIGN,
  personRecipe,
  type PersonDesign,
} from "../../../vendor/pilgrimage/lib/game/base-person/design"
import type { PoseEdits } from "../../../vendor/pilgrimage/lib/game/base-person/pose-edits"
import { createBasePersonRig } from "../../../vendor/pilgrimage/lib/game/base-person/rig"
import { personCamera } from "./camera"
import { spriteDepthBaker, SPRITE_DEPTH_ENCODING } from "./depth"
import { inkPersonFrame } from "./ink"
import { addSurfaceLighting } from "./lighting"
import { personCastShadow } from "./shadow"
import { createHumanAttachment, type HumanAttachmentKind } from "../../humans/attachments"

export interface HumanBakeAttachment {
  kind: HumanAttachmentKind
  socket: SocketName
}

export interface HumanBakeRegistration {
  direction: string
  frame: number
  phase: number
  sockets: Record<SocketName, { x: number; y: number; depth: number }>
}

export interface HumanClipBake {
  color: string
  shadow: string
  depth: string
  metadata: {
    clip: BaseClip
    frames: number
    directions: string[]
    cellSize: number
    viewSize: number
    anchor: number[]
    safePadding: number
    depthEncoding: typeof SPRITE_DEPTH_ENCODING
    registrations: HumanBakeRegistration[]
    design: PersonDesign
    attachment?: HumanBakeAttachment
  }
}

let sharedRenderer: THREE.WebGLRenderer | undefined

function frameRenderer(design: PersonDesign, attachment?: HumanBakeAttachment) {
  const recipe = personRecipe(design)
  const size = recipe.cellSize
  const renderer = sharedRenderer ??= new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    preserveDrawingBuffer: true,
  })

  renderer.localClippingEnabled = true
  renderer.setSize(size, size, false)
  renderer.setPixelRatio(1)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(0, 0)

  const scene = new THREE.Scene()
  const rig = createBasePersonRig(recipe)
  const attachmentInstance = attachment ? createHumanAttachment(attachment.kind) : null
  if (attachmentInstance && attachment) rig.sockets[attachment.socket].add(attachmentInstance.group)
  scene.add(rig.root)
  addSurfaceLighting(scene)

  const camera = personCamera(recipe)
  const depthBaker = spriteDepthBaker(renderer)
  const palette = recipe.renderPalette.map((hex) =>
    [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)),
  )
  const paletteTones = [...recipe.paletteTones]
  const position = new THREE.Vector3()

  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext("2d", { willReadFrequently: true })!

  const maskCanvas = document.createElement("canvas")
  maskCanvas.width = size
  maskCanvas.height = size
  const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true })!

  return {
    recipe,
    render(clip: BaseClip, phase: number, row: number, edits?: PoseEdits) {
      if (renderer.domElement.width !== size || renderer.domElement.height !== size) {
        renderer.setSize(size, size, false)
      }

      rig.trackSides(false)
      rig.view(row)
      rig.pose(
        phase * (clip === "walk" ? WALK_CLIP_STRIDES : 1),
        clip,
        edits ?? recipe.design.poseEdits,
      )

      renderer.render(scene, camera)
      context.clearRect(0, 0, size, size)
      context.drawImage(renderer.domElement, 0, 0)

      const attachmentVisible = attachmentInstance?.group.visible ?? false
      if (attachmentInstance) attachmentInstance.group.visible = false
      rig.inkMask(true)
      renderer.render(scene, camera)
      maskContext.clearRect(0, 0, size, size)
      maskContext.drawImage(renderer.domElement, 0, 0)
      rig.inkMask(false)
      if (attachmentInstance) attachmentInstance.group.visible = attachmentVisible

      const colors = context.getImageData(0, 0, size, size)
      const inked = inkPersonFrame(
        colors.data,
        maskContext.getImageData(0, 0, size, size).data,
        size,
        palette,
        recipe.design.ink,
        paletteTones,
      )

      const depth = depthBaker.render(
        scene,
        camera,
        size,
        recipe.camera.viewSize,
        colors.data,
        inked.pixels,
      )

      if (inked.padding < 4) {
        throw new Error(
          `${clip}, ${recipe.directions[row]}, frame ${Math.round(phase * PERSON_CLIPS[clip].frames) + 1}: design exceeds the four-pixel safe frame.`,
        )
      }

      colors.data.set(inked.pixels)
      context.putImageData(colors, 0, 0)

      const sockets = {} as HumanBakeRegistration["sockets"]
      for (const name of SOCKET_NAMES) {
        rig.sockets[name].getWorldPosition(position).project(camera)
        sockets[name] = {
          x: (position.x + 1) * size / 2,
          y: (1 - position.y) * size / 2,
          depth: position.z,
        }
      }

      return {
        canvas,
        depth,
        padding: inked.padding,
        sockets,
        shadow: personCastShadow(canvas, [...recipe.anchor], recipe.design.shadow),
      }
    },
    dispose() {
      attachmentInstance?.dispose()
      depthBaker.dispose()
      rig.dispose()
      renderer.renderLists.dispose()
    },
  }
}

const paintFrame = () => new Promise<void>((resolve) => {
  requestAnimationFrame(() => setTimeout(resolve, 0))
})

export async function bakeHumanClip(
  clip: BaseClip,
  design: PersonDesign = DEFAULT_DESIGN,
  edits?: PoseEdits,
  onProgress?: (done: number, total: number) => void,
  attachment?: HumanBakeAttachment,
): Promise<HumanClipBake> {
  const session = frameRenderer(
    { ...design, poseEdits: edits ?? design.poseEdits },
    attachment,
  )
  const size = session.recipe.cellSize
  const frames = PERSON_CLIPS[clip].frames
  const rows = session.recipe.directions.length
  const total = rows * frames

  const sheet = document.createElement("canvas")
  sheet.width = frames * size
  sheet.height = rows * size
  const context = sheet.getContext("2d")!

  const shadowSheet = document.createElement("canvas")
  shadowSheet.width = sheet.width
  shadowSheet.height = sheet.height
  const shadowContext = shadowSheet.getContext("2d")!

  const depthSheet = document.createElement("canvas")
  depthSheet.width = sheet.width
  depthSheet.height = sheet.height
  const depthContext = depthSheet.getContext("2d")!

  const registrations: HumanBakeRegistration[] = []
  let safePadding = size
  let done = 0

  try {
    for (let row = 0; row < rows; row++) {
      for (let frame = 0; frame < frames; frame++) {
        const phase = frame / frames
        const rendered = session.render(clip, phase, row, edits)
        context.drawImage(rendered.canvas, frame * size, row * size)
        shadowContext.drawImage(rendered.shadow, frame * size, row * size)
        depthContext.drawImage(rendered.depth, frame * size, row * size)
        safePadding = Math.min(safePadding, rendered.padding)
        registrations.push({
          direction: session.recipe.directions[row],
          frame,
          phase,
          sockets: rendered.sockets,
        })
        done++
        onProgress?.(done, total)
      }
      await paintFrame()
    }

    return {
      color: sheet.toDataURL("image/png"),
      shadow: shadowSheet.toDataURL("image/png"),
      depth: depthSheet.toDataURL("image/png"),
      metadata: {
        clip,
        frames,
        directions: [...session.recipe.directions],
        cellSize: size,
        viewSize: session.recipe.camera.viewSize,
        anchor: [...session.recipe.anchor],
        safePadding,
        depthEncoding: SPRITE_DEPTH_ENCODING,
        registrations,
        design: session.recipe.design,
        attachment,
      },
    }
  } finally {
    session.dispose()
  }
}

export function humanBakeFileStem(
  preset: string,
  clip: BaseClip,
  attachment?: HumanBakeAttachment,
) {
  const safePreset = preset.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const suffix = attachment ? `-${attachment.kind}-${attachment.socket}` : ""
  return `human-${safePreset || "custom"}-${clip}${suffix}`
}
