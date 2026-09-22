import { useLayoutEffect, useRef } from "react"
import { Color, InstancedMesh, Object3D } from "three"
import { animalPlacements } from "./enclosureLayout"

// One full-size instance per individual; no random placement or scale reduction.
export function AnimalBlocks() {
  const mesh = useRef<InstancedMesh>(null)
  const blocks = animalPlacements

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
