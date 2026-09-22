import { useEffect, useMemo } from "react"
import { BufferGeometry, CanvasTexture, Float32BufferAttribute, SRGBColorSpace } from "three"
import { physicalPens, galleryAnimals } from "./enclosureLayout"
import dimensions from "../../concepts/arca/dimensoes-animais-jogo-v1.json"

export function EnclosureSigns() {
  const signs = useMemo(() => {
    const labels = physicalPens.map(pen => {
      const animal = dimensions.animals.find(a => a.id === pen.animal_key)
      const { min, max } = pen.bounds_m
      const composition = animal ? animal.quantity === 2 ? "1 CASAL" : `${animal.quantity} animais` : "DISPONÍVEL"
      return { name: animal?.name ?? "Baia disponível", detail: `${pen.id} · ${composition}`,
        measures: `${(max[0] - min[0]).toFixed(2)} × ${(max[2] - min[2]).toFixed(2)} × ${(max[1] - min[1]).toFixed(2)} m`,
        x: (min[0] + max[0]) / 2, y: min[1] + 1.85,
        z: (pen.side > 0 ? max[2] : min[2]) + pen.side * 0.12,
        face: pen.side, width: Math.min(2.2, max[0] - min[0] - 0.1) }
    }).concat(galleryAnimals.map(animal => {
      const p = animal.staging_position_m!
      return { name: animal.name, detail: `${animal.quantity} animais · BAIA PENDENTE`, measures: "Galeria de referência",
        x: p[0], y: p[1] + 1.85, z: p[2] + 3.6, face: 1, width: 2.2 }
    }))
    const columns = 8, rows = Math.ceil(labels.length / columns)
    const canvas = document.createElement("canvas")
    canvas.width = columns * 256; canvas.height = rows * 96
    const ctx = canvas.getContext("2d")!
    const positions: number[] = [], uv: number[] = [], indices: number[] = []
    labels.forEach((label, i) => {
      const column = i % columns, row = Math.floor(i / columns)
      const px = column * 256, py = row * 96
      ctx.fillStyle = "#352719"; ctx.fillRect(px, py, 256, 96)
      ctx.strokeStyle = "#c4a676"; ctx.lineWidth = 3; ctx.strokeRect(px + 5, py + 5, 246, 86)
      ctx.fillStyle = "#fff1d3"; ctx.textAlign = "center"; ctx.textBaseline = "middle"
      let font = 26
      ctx.font = `bold ${font}px sans-serif`
      while (ctx.measureText(label.name).width > 234 && font > 12) ctx.font = `bold ${--font}px sans-serif`
      ctx.fillText(label.name, px + 128, py + 28)
      ctx.font = "13px sans-serif"; ctx.fillStyle = "#dfc293"
      ctx.fillText(label.detail, px + 128, py + 56, 236)
      ctx.font = "12px sans-serif"
      ctx.fillText(label.measures, px + 128, py + 78, 236)
      const half = label.width / 2 * label.face, h = 0.3, base = i * 4
      positions.push(label.x - half, label.y - h, label.z, label.x + half, label.y - h, label.z,
        label.x + half, label.y + h, label.z, label.x - half, label.y + h, label.z)
      const u0 = (column + 0.005) / columns, u1 = (column + 0.995) / columns
      const v0 = 1 - (row + 0.995) / rows, v1 = 1 - (row + 0.005) / rows
      uv.push(u0, v0, u1, v0, u1, v1, u0, v1)
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
    })
    const geometry = new BufferGeometry()
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3))
    geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2))
    geometry.setIndex(indices); geometry.computeBoundingSphere()
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    return { geometry, texture }
  }, [])
  useEffect(() => () => { signs.geometry.dispose(); signs.texture.dispose() }, [signs])
  // Physical pens (including empty ones) and gallery share one draw call.
  return <mesh name="Placas_Identificacao_Recintos" geometry={signs.geometry} userData={{ noCollision: true }}>
    <meshBasicMaterial map={signs.texture} toneMapped={false} />
  </mesh>
}
