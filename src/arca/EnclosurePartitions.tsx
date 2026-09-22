import { useLayoutEffect, useMemo, useRef } from "react"
import { InstancedMesh, Object3D } from "three"
import { physicalPens } from "./enclosureLayout"

interface Partition {
  module: string
  center: [number, number, number]
  size: [number, number, number]
}

function buildPartitions(): Partition[] {
  const grouped = new Map<string, typeof physicalPens>()
  for (const pen of physicalPens) {
    if (!("runtime_partition" in pen) || !pen.runtime_partition) continue
    const list = grouped.get(pen.module_id)
    if (list) list.push(pen)
    else grouped.set(pen.module_id, [pen])
  }

  const partitions: Partition[] = []
  for (const [module, pens] of grouped) {
    if (pens.length !== 2) {
      throw new Error(`Divisao runtime invalida em ${module}: esperado 2 partes, recebido ${pens.length}`)
    }
    const ordered = [...pens].sort((a, b) => a.bounds_m.min[0] - b.bounds_m.min[0])
    const [left, right] = ordered
    const x0 = left.bounds_m.max[0]
    const x1 = right.bounds_m.min[0]
    const minY = Math.max(left.bounds_m.min[1], right.bounds_m.min[1])
    const maxY = Math.min(left.bounds_m.max[1], right.bounds_m.max[1])
    const minZ = Math.max(left.bounds_m.min[2], right.bounds_m.min[2])
    const maxZ = Math.min(left.bounds_m.max[2], right.bounds_m.max[2])

    if (x1 <= x0 || maxY <= minY || maxZ <= minZ) {
      throw new Error(`Bounds de divisao invalidos em ${module}`)
    }

    partitions.push({
      module,
      center: [(x0 + x1) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2],
      size: [x1 - x0, maxY - minY, maxZ - minZ],
    })
  }
  return partitions
}

export function EnclosurePartitions() {
  const mesh = useRef<InstancedMesh>(null)
  const partitions = useMemo(() => buildPartitions(), [])

  useLayoutEffect(() => {
    if (!mesh.current) return
    const transform = new Object3D()
    partitions.forEach((partition, index) => {
      transform.position.set(...partition.center)
      transform.scale.set(...partition.size)
      transform.updateMatrix()
      mesh.current!.setMatrixAt(index, transform.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.computeBoundingBox()
    mesh.current.computeBoundingSphere()
  }, [partitions])

  return (
    <instancedMesh
      ref={mesh}
      name="Divisorias_Baias_Compactadas"
      args={[undefined, undefined, partitions.length]}
      castShadow
      receiveShadow
      userData={{ noCollision: true, partitions: partitions.map(item => item.module) }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6f4d32" roughness={0.94} metalness={0} />
    </instancedMesh>
  )
}
