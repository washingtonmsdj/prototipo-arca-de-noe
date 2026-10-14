import { useLayoutEffect, useMemo, useRef } from "react"
import { Color, InstancedMesh, Object3D } from "three"
import { enclosureGateSegment, enclosureWallSegments } from "./enclosureWallSegments"
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
      const bars: Wall[] = []
      const isSmall = pen.housing_class === "small_bird" || pen.housing_class === "small_cage"
        || pen.housing_class === "terrarium" || pen.housing_class === "micro_terrarium"
        || pen.housing_class === "insectarium"
      const postSpacing = isSmall ? .45 : 1.05
      const gate = enclosureGateSegment(pen, thickness)
      for (const segment of [...enclosureWallSegments(pen, thickness), ...(gate ? [gate] : [])]) {
        const alongX = segment.size[0] > segment.size[2]
        const length = alongX ? segment.size[0] : segment.size[2]
        const height = segment.size[1]
        const baseY = segment.position[1] - height / 2
        const railThickness = Math.min(.065, thickness)
        const railLevels = isSmall ? [.12, .4, .68, .94] : [.12, .53, .96]
        for (const level of railLevels) {
          bars.push({
            position: [segment.position[0], baseY + height * level, segment.position[2]],
            size: alongX ? [length, railThickness, thickness] : [thickness, railThickness, length],
            hue,
          })
        }
        const intervals = Math.max(1, Math.ceil(length / postSpacing))
        for (let step = 0; step <= intervals; step++) {
          const offset = -length / 2 + length * step / intervals
          bars.push({
            position: [segment.position[0] + (alongX ? offset : 0), baseY + height / 2,
              segment.position[2] + (alongX ? 0 : offset)],
            size: [thickness, height, thickness],
            hue,
          })
        }
      }
      return bars
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
      color.setHSL(.08 + wall.hue * .025, .32, .52)
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
      userData={{ noCollision: true, planned: true }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={.92} metalness={0} />
    </instancedMesh>
  )
}
