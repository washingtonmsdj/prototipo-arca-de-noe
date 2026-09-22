import { useLayoutEffect, useMemo, useRef } from "react"
import { Color, InstancedMesh, Object3D } from "three"
import { plannedPens } from "./plannedEnclosures"

const WET_ANIMALS = new Set([
  "hipopotamos",
  "capivaras",
  "patos",
  "marrecos",
  "cisnes",
  "gansos",
  "tartarugas_semiaquaticas",
  "ras",
  "pererecas",
  "sapos",
])

interface Fixture {
  position: [number, number, number]
  size: [number, number, number]
  hue: number
}

function boxAt(
  result: Fixture[],
  position: [number, number, number],
  size: [number, number, number],
  hue: number,
) {
  result.push({ position, size, hue })
}

export function HousingFixtures() {
  const troughRef = useRef<InstancedMesh>(null)
  const perchRef = useRef<InstancedMesh>(null)
  const baseRef = useRef<InstancedMesh>(null)
  const wetRef = useRef<InstancedMesh>(null)
  const restRef = useRef<InstancedMesh>(null)

  const fixtures = useMemo(() => {
    const troughs: Fixture[] = []
    const perches: Fixture[] = []
    const bases: Fixture[] = []
    const wet: Fixture[] = []
    const rest: Fixture[] = []

    plannedPens.forEach((pen, index) => {
      const { min, max } = pen.bounds_m
      const width = max[0] - min[0]
      const depth = max[2] - min[2]
      const x = (min[0] + max[0]) / 2
      const z = (min[2] + max[2]) / 2
      const floor = min[1]
      const hue = (index * .037) % 1

      if (
        pen.housing_class === "large_mammal"
        || pen.housing_class === "herd_mammal"
        || pen.housing_class === "medium_mammal"
        || pen.housing_class === "small_mammal"
      ) {
        const accessOnX = pen.access.edge === "min_x" || pen.access.edge === "max_x"

        if (accessOnX) {
          const troughLength = Math.min(1.8, Math.max(.5, depth * .32))
          const troughDepth = Math.min(.55, Math.max(.28, width * .14))
          const troughX = pen.access.edge === "min_x"
            ? max[0] - troughDepth / 2 - .18
            : min[0] + troughDepth / 2 + .18
          boxAt(
            troughs,
            [troughX, floor + .18, z],
            [troughDepth, .36, troughLength],
            .09 + hue * .015,
          )
        } else {
          const troughLength = Math.min(1.8, Math.max(.5, width * .32))
          const troughDepth = Math.min(.55, Math.max(.28, depth * .14))
          const troughZ = pen.access.edge === "max_z"
            ? min[2] + troughDepth / 2 + .18
            : max[2] - troughDepth / 2 - .18
          boxAt(
            troughs,
            [x, floor + .18, troughZ],
            [troughLength, .36, troughDepth],
            .09 + hue * .015,
          )
        }

        // Resting pads stay away from the access opening and from the feeder
        // wall, preserving a visible handling path through the pen.
        const restWidth = Math.max(.55, Math.min(width * .42, 2.4))
        const restDepth = Math.max(.45, Math.min(depth * .28, 1.35))
        const restX = accessOnX
          ? x
          : min[0] + restWidth / 2 + .16
        const restZ = accessOnX
          ? (pen.side > 0
              ? min[2] + restDepth / 2 + .16
              : max[2] - restDepth / 2 - .16)
          : z
        boxAt(
          rest,
          [restX, floor + .025, restZ],
          [restWidth, .05, restDepth],
          .11,
        )
      }

      if (pen.housing_class === "large_bird" || pen.housing_class === "small_bird") {
        const high = Math.min(max[1] - .3, floor + pen.wall_height_m * .62)
        const low = Math.min(max[1] - .5, floor + pen.wall_height_m * .38)
        const alongX = width >= depth
        if (alongX) {
          const perchLength = Math.max(.5, width * .72)
          boxAt(perches, [x, high, z - depth * .18], [perchLength, .055, .055], .08)
          boxAt(perches, [x, low, z + depth * .18], [perchLength * .82, .055, .055], .08)
        } else {
          const perchLength = Math.max(.5, depth * .72)
          boxAt(perches, [x - width * .18, high, z], [.055, .055, perchLength], .08)
          boxAt(perches, [x + width * .18, low, z], [.055, .055, perchLength * .82], .08)
        }
      }

      if (
        pen.housing_class === "small_cage"
        || pen.housing_class === "terrarium"
        || pen.housing_class === "micro_terrarium"
        || pen.housing_class === "insectarium"
      ) {
        const baseHeight = pen.housing_class === "insectarium" ? .16 : .1
        boxAt(
          bases,
          [x, floor + baseHeight / 2, z],
          [Math.max(.2, width - .08), baseHeight, Math.max(.2, depth - .08)],
          pen.housing_class === "insectarium" ? .12 : .1,
        )
      }

      if (WET_ANIMALS.has(pen.animal_key)) {
        const patchWidth = Math.min(width * .42, 2)
        const patchDepth = Math.min(depth * .42, 1.5)
        boxAt(
          wet,
          [x, floor + .035, z],
          [Math.max(.35, patchWidth), .07, Math.max(.35, patchDepth)],
          .56,
        )
      }
    })

    return { troughs, perches, bases, wet, rest }
  }, [])

  useLayoutEffect(() => {
    const transform = new Object3D()
    const color = new Color()

    const apply = (
      mesh: InstancedMesh | null,
      items: Fixture[],
      saturation: number,
      lightness: number,
    ) => {
      if (!mesh) return
      items.forEach((item, index) => {
        transform.position.set(...item.position)
        transform.scale.set(...item.size)
        transform.updateMatrix()
        mesh.setMatrixAt(index, transform.matrix)
        color.setHSL(item.hue, saturation, lightness)
        mesh.setColorAt(index, color)
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      mesh.computeBoundingBox()
      mesh.computeBoundingSphere()
    }

    apply(troughRef.current, fixtures.troughs, .35, .27)
    apply(perchRef.current, fixtures.perches, .34, .31)
    apply(baseRef.current, fixtures.bases, .24, .24)
    apply(wetRef.current, fixtures.wet, .42, .34)
    apply(restRef.current, fixtures.rest, .38, .31)
  }, [fixtures])

  return (
    <group name="Equipamentos_Recintos_Planejados" userData={{ noCollision: true }}>
      <instancedMesh ref={troughRef} args={[undefined, undefined, fixtures.troughs.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={.95} vertexColors />
      </instancedMesh>
      <instancedMesh ref={perchRef} args={[undefined, undefined, fixtures.perches.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={.9} vertexColors />
      </instancedMesh>
      <instancedMesh ref={baseRef} args={[undefined, undefined, fixtures.bases.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={1} vertexColors />
      </instancedMesh>
      <instancedMesh ref={wetRef} args={[undefined, undefined, fixtures.wet.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={.65} vertexColors />
      </instancedMesh>
      <instancedMesh ref={restRef} args={[undefined, undefined, fixtures.rest.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={1} vertexColors />
      </instancedMesh>
    </group>
  )
}
