import { useLayoutEffect, useRef } from "react"
import { InstancedMesh, Object3D } from "three"
import { physicalPens } from "./enclosureLayout"

// Four continuous wall/closed-gate boxes per physical pen; no floor or roof.
export function EnclosureColliders() {
  const mesh = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    if (!mesh.current) return
    const transform = new Object3D()
    let index = 0
    for (const pen of physicalPens) {
      const { min, max } = pen.bounds_m
      const x = (min[0] + max[0]) / 2, y = (min[1] + max[1]) / 2, z = (min[2] + max[2]) / 2
      const width = max[0] - min[0], depth = max[2] - min[2], height = max[1] - min[1]
      for (const wall of [
        [min[0] - 0.04, y, z, 0.08, height, depth + 0.16],
        [max[0] + 0.04, y, z, 0.08, height, depth + 0.16],
        [x, y, min[2] - 0.04, width, height, 0.08],
        [x, y, max[2] + 0.04, width, height, 0.08],
      ]) {
        transform.position.set(wall[0], wall[1], wall[2])
        transform.scale.set(wall[3], wall[4], wall[5]); transform.updateMatrix()
        mesh.current.setMatrixAt(index++, transform.matrix)
      }
    }
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.computeBoundingBox(); mesh.current.computeBoundingSphere()
  }, [])
  return <instancedMesh ref={mesh} name="Colisao_Baias_Fisicas" args={[undefined, undefined, physicalPens.length * 4]}
    userData={{ colliderBoxes: true, colliderOnly: true }}>
    <boxGeometry args={[1, 1, 1]} />
    <meshBasicMaterial visible={false} />
  </instancedMesh>
}
