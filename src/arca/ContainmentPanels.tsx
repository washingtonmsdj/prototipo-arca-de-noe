import { useLayoutEffect, useMemo, useRef } from "react"
import { InstancedMesh, Object3D } from "three"
import { SECURE_PREDATORS } from "./animalPlanning"
import { enclosureGateSegment, enclosureWallSegments, type EnclosureWallSegment } from "./enclosureWallSegments"
import { plannedPens } from "./plannedEnclosures"

const CLOSED_CLASSES = new Set([
  "large_bird", "small_bird", "small_cage", "terrarium",
  "micro_terrarium", "insectarium",
])

// Clear panels stand in for fine mesh or solid transparent containment in the
// blockout. Rails alone would not retain birds, small animals or predators.
export function ContainmentPanels() {
  const mesh = useRef<InstancedMesh>(null)
  const panels = useMemo<EnclosureWallSegment[]>(() =>
    plannedPens.flatMap(pen => {
      const closed = CLOSED_CLASSES.has(pen.housing_class) || SECURE_PREDATORS.has(pen.animal_key)
      if (!closed) return []
      const gate = enclosureGateSegment(pen, .025)
      const walls = enclosureWallSegments(pen, .025)
      const { min, max } = pen.bounds_m
      const roof: EnclosureWallSegment = {
        position: [(min[0] + max[0]) / 2, min[1] + pen.wall_height_m, (min[2] + max[2]) / 2],
        size: [max[0] - min[0], .025, max[2] - min[2]],
      }
      return [...walls, ...(gate ? [gate] : []), roof]
    }),
  [])

  useLayoutEffect(() => {
    if (!mesh.current) return
    const transform = new Object3D()
    panels.forEach((panel, index) => {
      transform.position.set(...panel.position)
      transform.scale.set(...panel.size)
      transform.updateMatrix()
      mesh.current!.setMatrixAt(index, transform.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.computeBoundingBox()
    mesh.current.computeBoundingSphere()
  }, [panels])

  return <instancedMesh
    ref={mesh}
    name="Contencao_Recintos_Fechados"
    args={[undefined, undefined, panels.length]}
    userData={{ noCollision: true }}
  >
    <boxGeometry args={[1, 1, 1]} />
    <meshBasicMaterial color="#a5afa0" transparent opacity={.16} depthWrite={false} />
  </instancedMesh>
}
