import { useLayoutEffect, useMemo, useRef } from "react"
import { Color, InstancedMesh, Object3D } from "three"
import { serviceZones } from "./plannedEnclosures"

const PURPOSE_HUE = {
  alimento: .11,
  agua: .55,
  manejo: .08,
  limpeza: .12,
  circulacao: .09,
  ventilacao: .16,
} as const

export function ServiceZones() {
  const padRef = useRef<InstancedMesh>(null)
  const crateRef = useRef<InstancedMesh>(null)
  const zones = useMemo(
    () => serviceZones.filter(zone => zone.area_m2 >= .75),
    [],
  )
  const crateZones = useMemo(
    () => zones.filter(zone => zone.purpose !== "circulacao"),
    [zones],
  )

  useLayoutEffect(() => {
    const transform = new Object3D()
    const color = new Color()

    zones.forEach((zone, index) => {
      const { min, max } = zone.bounds_m
      const width = max[0] - min[0]
      const depth = max[2] - min[2]
      const x = (min[0] + max[0]) / 2
      const z = (min[2] + max[2]) / 2
      const hue = PURPOSE_HUE[zone.purpose]

      if (padRef.current) {
        transform.position.set(x, min[1] + .025, z)
        transform.scale.set(width, .05, depth)
        transform.updateMatrix()
        padRef.current.setMatrixAt(index, transform.matrix)
        color.setHSL(hue, .22, .28)
        padRef.current.setColorAt(index, color)
      }

    })

    crateZones.forEach((zone, index) => {
      if (!crateRef.current) return
      const { min, max } = zone.bounds_m
      const width = max[0] - min[0]
      const depth = max[2] - min[2]
      const x = (min[0] + max[0]) / 2
      const z = (min[2] + max[2]) / 2
      const crateW = Math.min(1.2, Math.max(.35, width * .32))
      const crateD = Math.min(1.2, Math.max(.35, depth * .32))
      const crateH = .65
      transform.position.set(x, min[1] + crateH / 2 + .05, z)
      transform.scale.set(crateW, crateH, crateD)
      transform.updateMatrix()
      crateRef.current.setMatrixAt(index, transform.matrix)
      color.setHSL(PURPOSE_HUE[zone.purpose], .28, zone.purpose === "agua" ? .38 : .33)
      crateRef.current.setColorAt(index, color)
    })

    for (const mesh of [padRef.current, crateRef.current]) {
      if (!mesh) continue
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      mesh.computeBoundingBox()
      mesh.computeBoundingSphere()
    }
  }, [crateZones, zones])

  return (
    <group name="Areas_Servico_Planejadas" userData={{ noCollision: true }}>
      <instancedMesh ref={padRef} args={[undefined, undefined, zones.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={1} vertexColors />
      </instancedMesh>
      <instancedMesh ref={crateRef} args={[undefined, undefined, crateZones.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={.9} vertexColors />
      </instancedMesh>
    </group>
  )
}
