import { useEffect, useRef, useState } from "react"
import { PERSON_PRESETS } from "../../vendor/pilgrimage/lib/game/base-person/design"
import type { PoseEdits } from "../../vendor/pilgrimage/lib/game/base-person/pose-edits"
import type { BaseClip, SocketName } from "../../vendor/pilgrimage/lib/game/base-person/pose"
import type { HumanAttachmentKind } from "../humans/attachments"
import {
  bakeHumanClip,
  humanBakeFileStem,
  type HumanClipBake,
  type HumanBakeAttachment,
} from "../pilgrimage/bake/human-bake"

interface HumanBakePanelProps {
  preset: string
  clip: BaseClip
  edits: PoseEdits
  attachment?: HumanAttachmentKind
  attachmentSocket?: SocketName
}

function downloadUrl(filename: string, url: string) {
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
}

function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  try {
    downloadUrl(filename, url)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function HumanBakePanel({ preset, clip, edits, attachment, attachmentSocket }: HumanBakePanelProps) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState<HumanClipBake | null>(null)
  const [error, setError] = useState<string | null>(null)
  const generation = useRef(0)

  useEffect(() => {
    generation.current++
    setBusy(false)
    setResult(null)
    setError(null)
    setProgress({ done: 0, total: 0 })
  }, [preset, clip, edits, attachment, attachmentSocket])

  const bake = async () => {
    if (busy) return
    const run = ++generation.current
    setBusy(true)
    setError(null)
    setResult(null)
    setProgress({ done: 0, total: 0 })

    try {
      const design = PERSON_PRESETS[preset] ?? PERSON_PRESETS.Storybook
      const bakeAttachment: HumanBakeAttachment | undefined = attachment && attachmentSocket
        ? { kind: attachment, socket: attachmentSocket }
        : undefined
      const baked = await bakeHumanClip(
        clip,
        design,
        edits,
        (done, total) => {
          if (run === generation.current) setProgress({ done, total })
        },
        bakeAttachment,
      )
      if (run === generation.current) setResult(baked)
    } catch (cause) {
      if (run === generation.current) {
        setError(cause instanceof Error ? cause.message : "Falha desconhecida ao gerar o atlas.")
      }
    } finally {
      if (run === generation.current) setBusy(false)
    }
  }

  const bakeAttachment: HumanBakeAttachment | undefined = attachment && attachmentSocket
    ? { kind: attachment, socket: attachmentSocket }
    : undefined
  const stem = humanBakeFileStem(preset, clip, bakeAttachment)
  const percent = progress.total
    ? Math.round(progress.done / progress.total * 100)
    : 0

  return (
    <section className="rig-editor bake-panel" aria-label="Baker de sprite humano">
      <div className="eyebrow">SPRITE / DEPTH BAKER · PILGRIMAGE</div>
      <p className="intro">
        Gera o clip atual nas 8 direções usando o mesmo rig, câmera, pixel-ink, sombra,
        depth encoding e sockets do sistema original.
      </p>

      <button type="button" onClick={bake} disabled={busy}>
        {busy ? `Gerando atlas… ${percent}%` : "Gerar atlas do clip"}
      </button>

      {error && <p className="bake-error">{error}</p>}

      {result && (
        <>
          <dl>
            <div><dt>Frames</dt><dd>{result.metadata.frames}</dd></div>
            <div><dt>Direções</dt><dd>{result.metadata.directions.length}</dd></div>
            <div><dt>Cell</dt><dd>{result.metadata.cellSize}px</dd></div>
            <div><dt>Padding</dt><dd>{result.metadata.safePadding}px</dd></div>
          </dl>

          <div className="bake-preview">
            <img src={result.color} alt={`Atlas ${clip} em oito direções`} />
          </div>

          <div className="button-row">
            <button type="button" onClick={() => downloadUrl(`${stem}-color.png`, result.color)}>
              Cor PNG
            </button>
            <button type="button" onClick={() => downloadUrl(`${stem}-depth.png`, result.depth)}>
              Depth PNG
            </button>
          </div>

          <div className="button-row">
            <button type="button" onClick={() => downloadUrl(`${stem}-shadow.png`, result.shadow)}>
              Sombra PNG
            </button>
            <button type="button" onClick={() => downloadJson(`${stem}.json`, result.metadata)}>
              Metadata JSON
            </button>
          </div>
        </>
      )}
    </section>
  )
}
