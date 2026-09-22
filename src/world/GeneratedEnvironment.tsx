import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { createWaterGeometry, forestInstances, type ForestInstance } from "./terrain"

function ForestLayer({ items, dark }: { items: ForestInstance[]; dark: boolean }) {
  const trunks = useRef<THREE.InstancedMesh>(null)
  const crowns = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    const dummy = new THREE.Object3D()
    items.forEach((tree, index) => {
      dummy.position.set(tree.x, tree.y + .48 * tree.scale, tree.z)
      dummy.rotation.set(0, tree.rotation, 0)
      dummy.scale.set(tree.scale, tree.scale, tree.scale)
      dummy.updateMatrix()
      trunks.current?.setMatrixAt(index, dummy.matrix)

      dummy.position.set(tree.x, tree.y + 1.23 * tree.scale, tree.z)
      dummy.rotation.set(0, tree.rotation, 0)
      dummy.scale.set(tree.scale, tree.scale, tree.scale)
      dummy.updateMatrix()
      crowns.current?.setMatrixAt(index, dummy.matrix)
    })
    if (trunks.current) trunks.current.instanceMatrix.needsUpdate = true
    if (crowns.current) crowns.current.instanceMatrix.needsUpdate = true
  }, [items])

  if (!items.length) return null

  return (
    <>
      <instancedMesh ref={trunks} args={[undefined, undefined, items.length]} castShadow receiveShadow>
        <cylinderGeometry args={[.09, .14, .96, 7]} />
        <meshStandardMaterial color={dark ? "#44392b" : "#594733"} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, items.length]} castShadow receiveShadow>
        <coneGeometry args={[.52, 1.48, 8]} />
        <meshStandardMaterial color={dark ? "#26351f" : "#38533a"} roughness={1} />
      </instancedMesh>
    </>
  )
}

export function GeneratedEnvironment() {
  const water = useMemo(() => createWaterGeometry(), [])
  const trees = useMemo(() => forestInstances(), [])
  const ordinary = useMemo(() => trees.filter((tree) => !tree.dark), [trees])
  const dark = useMemo(() => trees.filter((tree) => tree.dark), [trees])

  useEffect(() => () => water.dispose(), [water])

  return (
    <group name="pilgrimage-generated-environment">
      <mesh geometry={water} receiveShadow renderOrder={1}>
        <meshStandardMaterial
          vertexColors
          roughness={.34}
          metalness={.03}
          transparent
          opacity={.9}
          depthWrite={false}
        />
      </mesh>
      <ForestLayer items={ordinary} dark={false} />
      <ForestLayer items={dark} dark />
    </group>
  )
}
