import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { createBasePersonRig } from "../../vendor/pilgrimage/lib/game/base-person/rig"
import { PERSON_PRESETS, personRecipe } from "../../vendor/pilgrimage/lib/game/base-person/design"
import type { BaseClip } from "../../vendor/pilgrimage/lib/game/base-person/pose"
import { terrainHeight, terrainSlope } from "../world/terrain"
import type { HumanClip } from "./types"

export const UPSTREAM_PERSON_PRESETS = Object.keys(PERSON_PRESETS)

const clipMap: Record<HumanClip, BaseClip> = {
  idle: "idle",
  walk: "walk",
  carry: "carrying",
  pray: "praying",
  build: "building",
  gather: "gathering",
}

export interface UpstreamHumanProps {
  preset: string
  clip: HumanClip
  paused?: boolean
  origin?: [number, number]
  scale?: number
  speedScale?: number
}

export function UpstreamHuman({
  preset,
  clip,
  paused = false,
  origin = [0, 0],
  scale = 1.2,
  speedScale = 1,
}: UpstreamHumanProps) {
  const container = useRef<THREE.Group>(null)
  const phase = useRef(0)

  const setup = useMemo(() => {
    const design = PERSON_PRESETS[preset] ?? PERSON_PRESETS.Storybook
    const recipe = personRecipe(design)
    const rig = createBasePersonRig(recipe)
    rig.root.name = `pilgrimage-person-${preset}`
    return { design, recipe, rig }
  }, [preset])

  useEffect(() => () => setup.rig.dispose(), [setup])

  useFrame((_, delta) => {
    if (!container.current) return
    const dt = paused ? 0 : Math.min(delta, .05)
    phase.current = (phase.current + dt * 1.1 * speedScale) % 1

    const x = origin[0]
    const z = origin[1]
    const y = terrainHeight(x, z)
    const slope = terrainSlope(x, z)

    container.current.position.set(x, y, z)
    container.current.rotation.order = "YXZ"
    container.current.rotation.x = -Math.atan(slope.dz * .22)
    container.current.rotation.z = Math.atan(slope.dx * .22)

    setup.rig.pose(phase.current, clipMap[clip])
  })

  return (
    <group ref={container} scale={scale}>
      <primitive object={setup.rig.root} />
    </group>
  )
}
