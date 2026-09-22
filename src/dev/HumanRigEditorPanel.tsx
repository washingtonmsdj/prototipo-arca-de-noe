import type { ChangeEvent } from "react"
import {
  EDITABLE_JOINTS,
  MAX_POSE_OFFSET,
  clearFrameKeys,
  setPoseKey,
  validatePoseEdits,
  type EditableJoint,
  type PoseEdits,
} from "../../vendor/pilgrimage/lib/game/base-person/pose-edits"
import {
  PERSON_CLIPS,
  type BaseClip,
} from "../../vendor/pilgrimage/lib/game/base-person/pose"

interface HumanRigEditorPanelProps {
  clip: BaseClip
  edits: PoseEdits
  onChange: (edits: PoseEdits) => void
  frame: number
  onFrameChange: (frame: number) => void
  joint: EditableJoint
  onJointChange: (joint: EditableJoint) => void
}

const labels: Record<EditableJoint, string> = {
  head: "Cabeça",
  chest: "Peito",
  pelvis: "Pelve",
  leftShoulder: "Ombro E",
  rightShoulder: "Ombro D",
  leftHand: "Mão E",
  rightHand: "Mão D",
  leftElbow: "Cotovelo E",
  rightElbow: "Cotovelo D",
  leftHip: "Quadril E",
  rightHip: "Quadril D",
  leftKnee: "Joelho E",
  rightKnee: "Joelho D",
  leftFoot: "Pé E",
  rightFoot: "Pé D",
  staffTip: "Ponta do cajado",
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function HumanRigEditorPanel({
  clip,
  edits,
  onChange,
  frame,
  onFrameChange,
  joint,
  onJointChange,
}: HumanRigEditorPanelProps) {
  const frames = PERSON_CLIPS[clip].frames
  const safeFrame = Math.min(frame, frames - 1)
  const exactKey = edits[clip]?.[joint]?.find((key) => key.frame === safeFrame)
  const offset = exactKey?.offset ?? [0, 0, 0]
  const radius = exactKey?.radius ?? Math.min(3, Math.max(1, Math.floor(frames / 2)))

  const setOffset = (axis: 0 | 1 | 2, value: number) => {
    const next = [...offset] as [number, number, number]
    next[axis] = clamp(value, -MAX_POSE_OFFSET, MAX_POSE_OFFSET)
    onChange(setPoseKey(edits, clip, joint, { frame: safeFrame, offset: next, radius }, safeFrame))
  }

  const setRadius = (value: number) => {
    const nextRadius = clamp(Math.round(value), 1, Math.max(1, Math.floor(frames / 2)))
    onChange(setPoseKey(edits, clip, joint, {
      frame: safeFrame,
      offset: [...offset],
      radius: nextRadius,
    }, safeFrame))
  }

  const download = () => {
    const blob = new Blob([JSON.stringify(edits, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "arca-human-pose-edits.json"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      onChange(validatePoseEdits(JSON.parse(await file.text())))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Arquivo de pose inválido.")
    } finally {
      event.target.value = ""
    }
  }

  return (
    <section className="rig-editor" aria-label="Editor de rig humano">
      <div className="eyebrow">HUMAN RIG EDITOR · PILGRIMAGE</div>

      <label>
        Frame <strong>{safeFrame + 1}/{frames}</strong>
        <input
          type="range"
          min="0"
          max={frames - 1}
          step="1"
          value={safeFrame}
          onChange={(event) => onFrameChange(Number(event.target.value))}
        />
      </label>

      <label>
        Junta
        <select value={joint} onChange={(event) => onJointChange(event.target.value as EditableJoint)}>
          {EDITABLE_JOINTS.map((name) => <option key={name} value={name}>{labels[name]}</option>)}
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
          max={Math.max(1, Math.floor(frames / 2))}
          step="1"
          value={radius}
          onChange={(event) => setRadius(Number(event.target.value))}
        />
      </label>

      <div className="button-row">
        <button type="button" onClick={() => onChange(setPoseKey(edits, clip, joint, null, safeFrame))}>
          Limpar junta
        </button>
        <button type="button" onClick={() => onChange(clearFrameKeys(edits, clip, safeFrame))}>
          Limpar frame
        </button>
      </div>

      <div className="button-row">
        <button type="button" onClick={() => onChange({})}>Reset poses</button>
        <button type="button" onClick={download}>Exportar JSON</button>
        <label className="file-button">
          Importar JSON
          <input type="file" accept="application/json,.json" onChange={importFile} />
        </label>
      </div>
    </section>
  )
}
