import { useEffect, useMemo } from "react"
import {
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Float32BufferAttribute,
  SRGBColorSpace,
} from "three"
import { physicalPens } from "./enclosureLayout"
import dimensions from "../../concepts/arca/dimensoes-animais-jogo-v1.json"
import { HOUSING_RULES } from "./animalPlanning"

export function EnclosureSigns() {
  const signs = useMemo(() => {
    const labels = physicalPens.map(pen => {
      const animal = dimensions.animals.find(a => a.id === pen.animal_key)
      if (!animal) throw new Error(`Baia sem animal: ${pen.id}`)
      const { min, max } = pen.bounds_m
      const composition = animal.quantity === 2
        ? "1 CASAL"
        : `${animal.quantity} animais`
      const edge = pen.access.edge
      const alongX = edge === "min_z" || edge === "max_z"
      const wallSpan = alongX ? max[0] - min[0] : max[2] - min[2]
      let x = pen.access.gate_center_m[0]
      let z = pen.access.gate_center_m[2]

      if (edge === "min_z") z = min[2] - .12
      if (edge === "max_z") z = max[2] + .12
      if (edge === "min_x") x = min[0] - .12
      if (edge === "max_x") x = max[0] + .12

      return {
        name: animal.name,
        detail: `${composition} · ${HOUSING_RULES[pen.housing_class].label}`,
        measures: `${(max[0] - min[0]).toFixed(2)} × ${(max[2] - min[2]).toFixed(2)} m · área planejada`,
        x,
        y: Math.min(
          max[1] - .35,
          min[1] + Math.max(.55, pen.wall_height_m * .72),
        ),
        z,
        alongX,
        width: Math.max(.16, Math.min(2.2, wallSpan - .08)),
      }
    })

    const columns = 8
    const rows = Math.ceil(labels.length / columns)
    const canvas = document.createElement("canvas")
    canvas.width = columns * 256
    canvas.height = rows * 96
    const ctx = canvas.getContext("2d")!
    const positions: number[] = []
    const uv: number[] = []
    const indices: number[] = []

    labels.forEach((label, i) => {
      const column = i % columns
      const row = Math.floor(i / columns)
      const px = column * 256
      const py = row * 96
      ctx.fillStyle = "#352719"
      ctx.fillRect(px, py, 256, 96)
      ctx.strokeStyle = "#c4a676"
      ctx.lineWidth = 3
      ctx.strokeRect(px + 5, py + 5, 246, 86)
      ctx.fillStyle = "#fff1d3"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      let font = 26
      ctx.font = `bold ${font}px sans-serif`
      while (ctx.measureText(label.name).width > 234 && font > 12) {
        ctx.font = `bold ${--font}px sans-serif`
      }
      ctx.fillText(label.name, px + 128, py + 28)
      ctx.font = "13px sans-serif"
      ctx.fillStyle = "#dfc293"
      ctx.fillText(label.detail, px + 128, py + 56, 236)
      ctx.font = "12px sans-serif"
      ctx.fillText(label.measures, px + 128, py + 78, 236)

      const half = label.width / 2
      const h = .3
      const base = i * 4
      if (label.alongX) {
        positions.push(
          label.x - half, label.y - h, label.z,
          label.x + half, label.y - h, label.z,
          label.x + half, label.y + h, label.z,
          label.x - half, label.y + h, label.z,
        )
      } else {
        positions.push(
          label.x, label.y - h, label.z - half,
          label.x, label.y - h, label.z + half,
          label.x, label.y + h, label.z + half,
          label.x, label.y + h, label.z - half,
        )
      }

      const u0 = (column + .005) / columns
      const u1 = (column + .995) / columns
      const v0 = 1 - (row + .995) / rows
      const v1 = 1 - (row + .005) / rows
      uv.push(u0, v0, u1, v0, u1, v1, u0, v1)
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
    })

    const geometry = new BufferGeometry()
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3))
    geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2))
    geometry.setIndex(indices)
    geometry.computeBoundingSphere()

    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    return { geometry, texture }
  }, [])

  useEffect(
    () => () => {
      signs.geometry.dispose()
      signs.texture.dispose()
    },
    [signs],
  )

  return (
    <mesh
      name="Placas_Identificacao_Recintos"
      geometry={signs.geometry}
      userData={{ noCollision: true }}
    >
      <meshBasicMaterial map={signs.texture} toneMapped={false} side={DoubleSide} />
    </mesh>
  )
}
