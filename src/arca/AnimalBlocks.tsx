import { useLayoutEffect, useRef } from "react"
import { Color, InstancedMesh, Object3D } from "three"
import { animalPlacements } from "./enclosureLayout"

// One calibrated envelope per individual; no random placement or hidden scale reduction.
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

  return <group name="Animais_Referencia_Internos">
    <instancedMesh
      ref={mesh}
      name={`Animais_Blocos_${blocks.length}`}
      args={[undefined, undefined, blocks.length]}
      userData={{
        individuals: blocks,
        purpose: "Envelopes dimensionais calibrados por especie/postura; todos alocados dentro da arca",
      }}
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.9} />
    </instancedMesh>
  </group>
}
