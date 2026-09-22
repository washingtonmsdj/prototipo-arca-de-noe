import { useLayoutEffect, useMemo, useRef } from "react"
import { Color, InstancedMesh, Object3D } from "three"
import { enclosureWallSegments } from "./enclosureWallSegments"
import { plannedPens } from "./plannedEnclosures"

interface Wall {
  position: [number, number, number]
  size: [number, number, number]
  hue: number
}

export function PlannedEnclosures() {
  const mesh = useRef<InstancedMesh>(null)
  const walls = useMemo<Wall[]>(() =>
    plannedPens.flatMap((pen, index) => {
      const thickness = pen.housing_class === "insectarium" ? .045 : .07
      const hue = (index * .071) % 1
      return enclosureWallSegments(pen, thickness).map(segment => ({
        ...segment,
        hue,
      }))
    }),
  [])

  useLayoutEffect(() => {
    if (!mesh.current) return
    const transform = new Object3D()
    const color = new Color()

    walls.forEach((wall, index) => {
      transform.position.set(...wall.position)
      transform.scale.set(...wall.size)
      transform.updateMatrix()
      mesh.current!.setMatrixAt(index, transform.matrix)
      color.setHSL(.08 + wall.hue * .025, .38, .34)
      mesh.current!.setColorAt(index, color)
    })

    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
    mesh.current.computeBoundingBox()
    mesh.current.computeBoundingSphere()
  }, [walls])

  return (
    <instancedMesh
      ref={mesh}
      name="Baias_Planejadas_Procedurais"
      args={[undefined, undefined, walls.length]}
      castShadow
      receiveShadow
      userData={{ noCollision: true, planned: true }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={.92} metalness={0} vertexColors />
    </instancedMesh>
  )
}
