import { useLayoutEffect, useMemo, useRef } from "react"
import { Color, InstancedMesh, Object3D } from "three"
import { plannedPens } from "./plannedEnclosures"

interface Wall {
  position: [number, number, number]
  size: [number, number, number]
  hue: number
}

export function PlannedEnclosures() {
  const mesh = useRef<InstancedMesh>(null)
  const walls = useMemo<Wall[]>(() => {
    const result: Wall[] = []
    plannedPens.forEach((pen, index) => {
      const { min, max } = pen.bounds_m
      const width = max[0] - min[0]
      const depth = max[2] - min[2]
      const x = (min[0] + max[0]) / 2
      const z = (min[2] + max[2]) / 2
      const height = pen.wall_height_m
      const y = min[1] + height / 2
      const thickness = pen.housing_class === "insectarium" ? .045 : .07
      const hue = (index * .071) % 1

      result.push(
        { position: [min[0], y, z], size: [thickness, height, depth], hue },
        { position: [max[0], y, z], size: [thickness, height, depth], hue },
        { position: [x, y, min[2]], size: [width, height, thickness], hue },
        { position: [x, y, max[2]], size: [width, height, thickness], hue },
      )
    })
    return result
  }, [])

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
