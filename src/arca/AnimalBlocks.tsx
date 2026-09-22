import { useLayoutEffect, useMemo, useRef } from "react"
import { Color, InstancedMesh, Object3D } from "three"
import catalog from "../../concepts/arca/catalogo-recintos-v3.json"
import dimensions from "../../concepts/arca/dimensoes-animais-jogo-v1.json"

// One full-size instance per individual; no random placement or scale reduction.
export function AnimalBlocks() {
  const mesh = useRef<InstancedMesh>(null)
  const blocks = useMemo(() => dimensions.animals.flatMap((animal, group) => {
    const staging = animal.staging_position_m
    const pen = staging ? {
      id: animal.enclosure, center: [staging[0], -staging[2], staging[1]],
      length: 7.5, depth: 7.5, clear_height: 4,
    } : catalog.records.find(record => record.id === animal.enclosure)
    if (!pen) throw new Error(`Baia ausente: ${animal.enclosure}`)
    const { length, width, height } = animal.dimensions_m
    // Choose the grid/orientation with the most clearance inside the pen.
    let best = { columns: 1, rows: animal.quantity, rotated: false, clearance: -Infinity }
    for (const rotated of [false, true]) {
      for (let columns = 1; columns <= animal.quantity; columns++) {
        const rows = Math.ceil(animal.quantity / columns)
        const clearance = Math.min(
          (pen.length - 0.3) / columns - (rotated ? width : length),
          (pen.depth - 0.3) / rows - (rotated ? length : width),
        )
        if (clearance > best.clearance) best = { columns, rows, rotated, clearance }
      }
    }
    return Array.from({ length: animal.quantity }, (_, index) => {
      const male = index < animal.males
      const number = male ? index + 1 : index - animal.males + 1
      return {
        id: `${animal.id}-${male ? "M" : "F"}-${number.toString().padStart(2, "0")}`,
        animal: animal.name, enclosure: pen.id, sex: male ? "M" : "F",
        dimensions: [length, height, width],
        position: [
          pen.center[0] - (pen.length - 0.3) / 2 + (index % best.columns + 0.5) * (pen.length - 0.3) / best.columns,
          pen.center[2] + height / 2 + 0.02,
          // Blender Y becomes negative Three.js Z.
          -(pen.center[1] - (pen.depth - 0.3) / 2 + (Math.floor(index / best.columns) + 0.5) * (pen.depth - 0.3) / best.rows),
        ],
        rotation: best.rotated ? Math.PI / 2 : 0,
        needsReview: best.clearance < 0 || height > pen.clear_height,
        hue: (group * 0.61803398875) % 1,
      }
    })
  }), [])

  useLayoutEffect(() => {
    if (!mesh.current) return
    const transform = new Object3D()
    const color = new Color()
    blocks.forEach((block, index) => {
      transform.position.set(block.position[0], block.position[1], block.position[2])
      transform.scale.set(block.dimensions[0], block.dimensions[1], block.dimensions[2])
      transform.rotation.set(0, block.rotation, 0)
      transform.updateMatrix()
      mesh.current!.setMatrixAt(index, transform.matrix)
      color.setHSL(block.hue, 0.35, block.sex === "M" ? 0.42 : 0.58)
      mesh.current!.setColorAt(index, color)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
    mesh.current.computeBoundingBox()
    mesh.current.computeBoundingSphere()
  }, [blocks])

  return <group name="Animais_Referencia">
    {/* Separate reference gallery: pending groups do not consume ark service space. */}
    <mesh name="Piso_Galeria_Animais_Pendentes" position={[115, 5.85, -4]} receiveShadow>
      <boxGeometry args={[48, 0.3, 48]} />
      <meshStandardMaterial color="#80745f" roughness={1} />
    </mesh>
    <instancedMesh ref={mesh} name={`Animais_Blocos_${blocks.length}`} args={[undefined, undefined, blocks.length]}
    userData={{ individuals: blocks, purpose: "Referências dimensionais juvenis, não animais finais" }} receiveShadow>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial roughness={0.9} />
  </instancedMesh>
  </group>
}
