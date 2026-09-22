import type { ChangeEvent } from "react"
import { MAX_POSE_OFFSET } from "../../vendor/pilgrimage/lib/game/base-person/pose-edits"
import {
  ANIMAL_FRAMES,
  ANIMAL_JOINT_LABELS,
  EMPTY_ANIMAL_EDITS,
  animalClearFrame,
  animalPoseKey,
  validateAnimalEdits,
  type AnimalClip,
  type AnimalJoint,
  type AnimalRigEdits,
} from "../pilgrimage/wildlife/rig-edits"

interface AnimalRigEditorPanelProps {
  clip: AnimalClip
  edits: AnimalRigEdits
  onChange: (edits: AnimalRigEdits) => void
  frame: number
  onFrameChange: (frame: number) => void
  joint: AnimalJoint
  onJointChange: (joint: AnimalJoint) => void
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function AnimalRigEditorPanel({
  clip,
  edits,
  onChange,
  frame,
  onFrameChange,
  joint,
  onJointChange,
}: AnimalRigEditorPanelProps) {
  const exactKey = edits.clips[clip]?.keys?.[joint]?.find((key) => key.frame === frame)
  const offset = exactKey?.offset ?? [0, 0, 0]
  const radius = exactKey?.radius ?? 3
  const cadence = edits.clips[clip]?.cadence ?? 1
  const contacts = edits.clips[clip]?.contacts ?? [0, 0, 0, 0]

  const setOffset = (axis: 0 | 1 | 2, value: number) => {
    const next = [...offset] as [number, number, number]
    next[axis] = clamp(value, -MAX_POSE_OFFSET, MAX_POSE_OFFSET)
    onChange(animalPoseKey(edits, clip, joint, { frame, offset: next, radius }, frame))
  }

  const setRadius = (value: number) => {
    const nextRadius = clamp(Math.round(value), 1, Math.floor(ANIMAL_FRAMES / 2))
    onChange(animalPoseKey(edits, clip, joint, { frame, offset: [...offset], radius: nextRadius }, frame))
  }

  const setCadence = (value: number) => {
    onChange({
      ...edits,
      clips: {
        ...edits.clips,
        [clip]: { ...edits.clips[clip], cadence: clamp(value, .25, 2) },
      },
    })
  }

  const setContact = (index: number, value: number) => {
    const next = [...contacts] as [number, number, number, number]
    next[index] = clamp(value, -.08, .08)
    onChange({
      ...edits,
      clips: {
        ...edits.clips,
        [clip]: { ...edits.clips[clip], contacts: next },
      },
    })
  }

  const download = () => {
    const blob = new Blob([JSON.stringify(edits, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "arca-animal-rig-edits.json"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      onChange(validateAnimalEdits(JSON.parse(await file.text())))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Arquivo de rig inválido.")
    } finally {
      event.target.value = ""
    }
  }

  return (
    <section className="rig-editor" aria-label="Editor de rig animal">
      <div className="eyebrow">RIG EDITOR · PILGRIMAGE</div>

      <label>
        Frame <strong>{frame + 1}/{ANIMAL_FRAMES}</strong>
        <input
          type="range"
          min="0"
          max={ANIMAL_FRAMES - 1}
          step="1"
          value={frame}
          onChange={(event) => onFrameChange(Number(event.target.value))}
        />
      </label>

      <label>
        Junta
        <select value={joint} onChange={(event) => onJointChange(event.target.value as AnimalJoint)}>
          {(Object.keys(ANIMAL_JOINT_LABELS) as AnimalJoint[]).map((name) => (
            <option key={name} value={name}>{ANIMAL_JOINT_LABELS[name]}</option>
          ))}
        </select>
      </label>

      {(["X", "Y", "Z"] as const).map((axisLabel, axis) => (
        <label key={axisLabel}>
          Offset {axisLabel} <strong>{offset[axis].toFixed(3)}</strong>
          <input
            type="range"
            min={-MAX_POSE_OFFSET}
            max={MAX_POSE_OFFSET}
            step=".005"
            value={offset[axis]}
            onChange={(event) => setOffset(axis as 0 | 1 | 2, Number(event.target.value))}
          />
        </label>
      ))}

      <label>
        Influência <strong>{radius} frames</strong>
        <input
          type="range"
          min="1"
          max={Math.floor(ANIMAL_FRAMES / 2)}
          step="1"
          value={radius}
          onChange={(event) => setRadius(Number(event.target.value))}
        />
      </label>

      <label>
        Cadência do clip <strong>{cadence.toFixed(2)}×</strong>
        <input
          type="range"
          min=".25"
          max="2"
          step=".05"
          value={cadence}
          onChange={(event) => setCadence(Number(event.target.value))}
        />
      </label>

      <div className="contact-grid">
        {["Frente E", "Frente D", "Trás E", "Trás D"].map((label, index) => (
          <label key={label}>
            {label} <strong>{contacts[index].toFixed(3)}</strong>
            <input
              type="range"
              min="-.08"
              max=".08"
              step=".005"
              value={contacts[index]}
              onChange={(event) => setContact(index, Number(event.target.value))}
            />
          </label>
        ))}
      </div>

      <div className="button-row">
        <button type="button" onClick={() => onChange(animalPoseKey(edits, clip, joint, null, frame))}>
          Limpar junta
        </button>
        <button type="button" onClick={() => onChange(animalClearFrame(edits, clip, frame))}>
          Limpar frame
        </button>
      </div>

      <div className="button-row">
        <button type="button" onClick={() => onChange(EMPTY_ANIMAL_EDITS)}>Reset rig</button>
        <button type="button" onClick={download}>Exportar JSON</button>
        <label className="file-button">
          Importar JSON
          <input type="file" accept="application/json,.json" onChange={importFile} />
        </label>
      </div>
    </section>
  )
}
