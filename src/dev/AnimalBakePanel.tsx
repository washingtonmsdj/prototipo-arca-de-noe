import { useEffect, useRef, useState } from "react"
import {
  animalBakeFileStem,
  bakeAnimalClip,
  type AnimalBakeTarget,
  type AnimalClipBake,
} from "../pilgrimage/bake/animal-bake"

interface AnimalBakePanelProps {
  target: AnimalBakeTarget
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

export function AnimalBakePanel({ target }: AnimalBakePanelProps) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState<AnimalClipBake | null>(null)
  const [error, setError] = useState<string | null>(null)
  const generation = useRef(0)

  useEffect(() => {
    generation.current++
    setResult(null)
    setError(null)
    setProgress({ done: 0, total: 0 })
  }, [target])

  const bake = async () => {
    if (busy) return
    const run = ++generation.current
    setBusy(true)
    setError(null)
    setResult(null)
    setProgress({ done: 0, total: 0 })

    try {
      const baked = await bakeAnimalClip(
        target,
        (done, total) => setProgress({ done, total }),
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

  const stem = animalBakeFileStem(target)
  const percent = progress.total
    ? Math.round(progress.done / progress.total * 100)
    : 0

  return (
    <section className="rig-editor bake-panel" aria-label="Baker de sprite animal">
      <div className="eyebrow">ANIMAL SPRITE / DEPTH BAKER</div>
      <p className="intro">
        Gera 20 poses × 8 direções com o rig e as edições atuais, mantendo cor,
        depth, sombra e registro das juntas em arquivos separados.
      </p>

      <button type="button" onClick={bake} disabled={busy}>
        {busy ? `Gerando atlas… ${percent}%` : "Gerar atlas do animal"}
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
            <img src={result.color} alt={`Atlas ${target.kind} ${target.clip}`} />
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
