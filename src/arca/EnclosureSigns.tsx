import { useEffect, useMemo } from "react"
import { BufferGeometry, CanvasTexture, Float32BufferAttribute, SRGBColorSpace } from "three"
import catalog from "../../concepts/arca/catalogo-recintos-v3.json"
import dimensions from "../../concepts/arca/dimensoes-animais-jogo-v1.json"

export function EnclosureSigns() {
  const signs = useMemo(() => {
    const labels = dimensions.animals.map(animal => {
      const pen = catalog.records.find(p => p.id === animal.enclosure)
      if (pen) {
        const side = Math.sign(pen.center[1])
        return { name: animal.name, detail: `${pen.classification === "ave" ? "AVES · " : ""}${pen.id} · ${animal.quantity} animais`,
          x: pen.center[0], y: pen.center[2] + 1.85,
          z: -pen.center[1] + side * (pen.depth / 2 + 0.08), face: side,
          width: Math.min(2.2, pen.length - 0.15) }
      }
      const p = animal.staging_position_m!
      return { name: animal.name, detail: `${animal.quantity} animais · BAIA PENDENTE`,
        x: p[0], y: p[1] + 1.85, z: p[2] + 3.6, face: 1, width: 2.2 }
    })
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
      ctx.fillText(label.name, px + 128, py + 35)
      ctx.font = "13px sans-serif"; ctx.fillStyle = "#dfc293"
      ctx.fillText(label.detail, px + 128, py + 68, 236)
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
  // All 162 signs share one texture and one draw call; no per-frame text layout.
  return <mesh name="Placas_Identificacao_Recintos" geometry={signs.geometry} userData={{ noCollision: true }}>
    <meshBasicMaterial map={signs.texture} toneMapped={false} />
  </mesh>
}
