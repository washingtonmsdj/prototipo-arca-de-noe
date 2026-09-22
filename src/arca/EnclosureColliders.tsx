import { useLayoutEffect, useMemo, useRef } from "react"
import { InstancedMesh, Object3D } from "three"
import { enclosureWallSegments } from "./enclosureWallSegments"
import { physicalPens } from "./enclosureLayout"

export function EnclosureColliders() {
  const mesh = useRef<InstancedMesh>(null)
  const walls = useMemo(
    () => physicalPens.flatMap(pen => enclosureWallSegments(pen, .08)),
    [],
  )

  useLayoutEffect(() => {
    if (!mesh.current) return
    const transform = new Object3D()

    walls.forEach((wall, index) => {
      transform.position.set(...wall.position)
      transform.scale.set(...wall.size)
      transform.updateMatrix()
      mesh.current!.setMatrixAt(index, transform.matrix)
    })

    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.computeBoundingBox()
    mesh.current.computeBoundingSphere()
  }, [walls])

  return (
    <instancedMesh
      ref={mesh}
      name="Colisao_Baias_Fisicas"
      args={[undefined, undefined, walls.length]}
      userData={{ colliderBoxes: true, colliderOnly: true }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial visible={false} />
    </instancedMesh>
  )
}
