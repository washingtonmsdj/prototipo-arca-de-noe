import { useEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Animal } from "../animals/Animal"
import { UpstreamAnimal } from "../animals/UpstreamAnimal"
import { UpstreamTransportAnimal, type UpstreamTransportClip, type UpstreamTransportKind } from "../animals/UpstreamTransportAnimal"
import { SPECIES } from "../animals/species"
import type { AnimalSpecies, GaitName } from "../animals/types"
import type { AnimalClip, AnimalRigEdits } from "../pilgrimage/wildlife/rig-edits"
import type { AnimalClipBake } from "../pilgrimage/bake/animal-bake"
import type { HumanClipBake } from "../pilgrimage/bake/human-bake"
import type { WildlifeKind } from "../pilgrimage/wildlife/species"
import { Human } from "../humans/Human"
import type { UpstreamHumanClip } from "../humans/UpstreamHuman"
import { OriginalHumanActor } from "../humans/OriginalHumanActor"
import type { HumanAttachmentKind } from "../humans/attachments"
import type { SocketName } from "../../vendor/pilgrimage/lib/game/base-person/pose"
import { HUMAN_DESIGNS, generatedHuman } from "../humans/designs"
import type { HumanClip, HumanDesign } from "../humans/types"
import type { PoseEdits } from "../../vendor/pilgrimage/lib/game/base-person/pose-edits"
import { LAB_SITE, createCliffGeometry, createTerrainGeometry, findWalkableLoop, terrainHeight, terrainSlope } from "./terrain"
import { GeneratedEnvironment } from "./GeneratedEnvironment"
import { DepthAtlasSprite } from "../pilgrimage/runtime/DepthAtlasSprite"
import type { LabRepresentation } from "../pilgrimage/runtime/lod"
import { wildlifeClipCadence } from "../animals/upstream-motion"
import { animalProfile } from "../pilgrimage/transport-core"

export type LabSubject = "animal" | "human"
export type HumanEngine = "arca" | "pilgrimage"
export type AnimalEngine = "arca" | "pilgrimage"
export type OriginalAnimalGroup = "wildlife" | "transport"
export type { LabRepresentation } from "../pilgrimage/runtime/lod"

interface WorldProps {
  labSubject: LabSubject
  animalEngine: AnimalEngine
  upstreamAnimalGroup: OriginalAnimalGroup
  upstreamTransportKind: UpstreamTransportKind
  upstreamTransportClip: UpstreamTransportClip
  upstreamTransportCoat: string
  animalEdits: AnimalRigEdits
  animalEditPhase?: number
  animalMoving: boolean
  animalRepresentation: LabRepresentation
  animalBakePreview?: AnimalClipBake | null
  labSpecies: AnimalSpecies
  labGait: GaitName
  upstreamAnimalKind: WildlifeKind
  upstreamAnimalClip: AnimalClip
  labHuman: HumanDesign
  humanClip: HumanClip
  humanEngine: HumanEngine
  upstreamHumanPreset: string
  upstreamHumanClip: UpstreamHumanClip
  humanEdits: PoseEdits
  humanEditPhase?: number
  humanAttachment?: HumanAttachmentKind
  humanAttachmentSocket?: SocketName
  humanMoving: boolean
  humanRepresentation: LabRepresentation
  humanBakePreview?: HumanClipBake | null
  speedScale: number
  paused: boolean
  showRig: boolean
}

function BakedLabActor({
  bake,
  scale,
  cadence,
  speedScale,
  paused,
}: {
  bake: HumanClipBake | AnimalClipBake
  scale: number
  cadence: number
  speedScale: number
  paused: boolean
}) {
  const phase = useRef(0)
  const ground = terrainHeight(LAB_SITE[0], LAB_SITE[1])
  const slope = terrainSlope(LAB_SITE[0], LAB_SITE[1])

  useFrame((_, delta) => {
    if (paused) return
    phase.current = (
      phase.current
      + Math.min(delta, .05) * cadence * speedScale
    ) % 1
  })

  return (
    <DepthAtlasSprite
      color={bake.color}
      depth={bake.depth}
      metadata={bake.metadata}
      phase={phase}
      position={[LAB_SITE[0], ground, LAB_SITE[1]]}
      scale={scale}
      groundNormal={[-slope.dx, 1, -slope.dz]}
    />
  )
}

function Terrain() {
  const geometry = useMemo(() => createTerrainGeometry(), [])
  const cliffs = useMemo(() => createCliffGeometry(), [])

  useEffect(() => () => {
    geometry.dispose()
    cliffs.dispose()
  }, [geometry, cliffs])

  return (
    <group name="generated-terrain">
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={1} flatShading />
      </mesh>
      <mesh geometry={cliffs} castShadow receiveShadow>
        <meshStandardMaterial color="#675f50" roughness={1} flatShading />
      </mesh>
    </group>
  )
}

function LabCamera() {
  const { camera } = useThree()

  useEffect(() => {
    const ground = terrainHeight(LAB_SITE[0], LAB_SITE[1])
    camera.position.set(LAB_SITE[0] + 13, ground + 10, LAB_SITE[1] + 14)
    camera.lookAt(LAB_SITE[0], ground + 1, LAB_SITE[1])
    camera.updateProjectionMatrix()
  }, [camera])

  return null
}

function AmbientHerds({ paused }: { paused: boolean }) {
  const loops = useMemo(
    () => SPECIES.flatMap((_, speciesIndex) => [
      findWalkableLoop(1000 + speciesIndex * 2, 2.4),
      findWalkableLoop(1001 + speciesIndex * 2, 3.1),
    ]),
    [],
  )

  return (
    <group>
      {SPECIES.map((species, speciesIndex) => {
        const gait = species.supportedGaits[Math.min(1, species.supportedGaits.length - 1)]
        return [0, 1].map((pair) => {
          const loop = loops[speciesIndex * 2 + pair]
          return (
            <Animal
              key={species.id + pair}
              species={species}
              gait={gait}
              pathRadius={loop.radius}
              pathOffset={loop.phase}
              origin={loop.origin}
              speedScale={.55 + pair * .08}
              paused={paused}
              stationary={loop.radius === 0}
            />
          )
        })
      })}
    </group>
  )
}

function AmbientPeople({ paused }: { paused: boolean }) {
  const loops = useMemo(
    () => HUMAN_DESIGNS.flatMap((_, index) => [
      findWalkableLoop(2000 + index * 2, 2.1),
      findWalkableLoop(2001 + index * 2, 2.7),
    ]),
    [],
  )

  return (
    <group>
      {HUMAN_DESIGNS.flatMap((design, index) => {
        const generated = generatedHuman(100 + index)
        const authoredLoop = loops[index * 2]
        const generatedLoop = loops[index * 2 + 1]
        return [
          <Human
            key={design.id}
            design={design}
            clip="walk"
            pathRadius={authoredLoop.radius}
            pathOffset={authoredLoop.phase}
            origin={authoredLoop.origin}
            speedScale={.72}
            paused={paused}
            stationary={authoredLoop.radius === 0}
          />,
          <Human
            key={generated.id}
            design={generated}
            clip="walk"
            pathRadius={generatedLoop.radius}
            pathOffset={generatedLoop.phase}
            origin={generatedLoop.origin}
            speedScale={.64}
            paused={paused}
            stationary={generatedLoop.radius === 0}
          />,
        ]
      })}
    </group>
  )
}

export function World({
  labSubject,
  animalEngine,
  upstreamAnimalGroup,
  upstreamTransportKind,
  upstreamTransportClip,
  upstreamTransportCoat,
  animalEdits,
  animalEditPhase,
  animalMoving,
  animalRepresentation,
  animalBakePreview,
  labSpecies,
  labGait,
  upstreamAnimalKind,
  upstreamAnimalClip,
  labHuman,
  humanClip,
  humanEngine,
  upstreamHumanPreset,
  upstreamHumanClip,
  humanEdits,
  humanEditPhase,
  humanAttachment,
  humanAttachmentSocket,
  humanMoving,
  humanRepresentation,
  humanBakePreview,
  speedScale,
  paused,
  showRig,
}: WorldProps) {
  const animalBakeCadence = upstreamAnimalGroup === "transport"
    ? animalProfile(
        upstreamTransportKind === "horse-noble" || upstreamTransportKind === "horse-common"
          ? "horse"
          : upstreamTransportKind,
        upstreamTransportKind === "horse-noble" ? "noble" : "common",
      ).cyclesPerSecond * (animalEdits.clips.walk?.cadence ?? 1)
    : wildlifeClipCadence(upstreamAnimalKind, upstreamAnimalClip, animalEdits)

  return (
    <>
      <color attach="background" args={["#bac5a7"]} />
      <fog attach="fog" args={["#bac5a7", 26, 62]} />
      <ambientLight intensity={1.25} />
      <directionalLight
        castShadow
        intensity={2.2}
        position={[12, 18, 8]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
      />

      <LabCamera />
      <Terrain />
      <GeneratedEnvironment />
      <AmbientHerds paused={paused} />
      <AmbientPeople paused={paused} />

      <group>
        <mesh
          position={[LAB_SITE[0], terrainHeight(LAB_SITE[0], LAB_SITE[1]) + .02, LAB_SITE[1]]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <circleGeometry args={[2.2, 48]} />
          <meshStandardMaterial color="#8b9c6d" roughness={1} />
        </mesh>

        {labSubject === "animal" ? (
          animalEngine === "pilgrimage" ? (
            animalRepresentation === "sprite" && animalBakePreview ? (
              <BakedLabActor
                bake={animalBakePreview}
                scale={upstreamAnimalGroup === "transport" ? 1.05 : 1.35}
                cadence={animalBakeCadence}
                speedScale={speedScale}
                paused={paused}
              />
            ) : upstreamAnimalGroup === "transport" ? (
              <UpstreamTransportAnimal
                kind={upstreamTransportKind}
                clip={upstreamTransportClip}
                coatId={upstreamTransportCoat}
                paused={paused}
                showRig={showRig}
                speedScale={speedScale}
                edits={animalEdits}
                phaseOverride={animalEditPhase}
                origin={LAB_SITE}
                pathRadius={1.6}
                pathOffset={0}
                stationary={!animalMoving || animalEditPhase !== undefined}
              />
            ) : (
              <UpstreamAnimal
                kind={upstreamAnimalKind}
                clip={upstreamAnimalClip}
                paused={paused}
                showRig={showRig}
                speedScale={speedScale}
                edits={animalEdits}
                phaseOverride={animalEditPhase}
                origin={LAB_SITE}
                pathRadius={1.6}
                pathOffset={0}
                stationary={!animalMoving || animalEditPhase !== undefined}
              />
            )
          ) : (
            <Animal
              species={labSpecies}
              gait={labGait}
              stationary
              origin={LAB_SITE}
              speedScale={speedScale}
              paused={paused}
              showRig={showRig}
            />
          )
        ) : humanEngine === "pilgrimage" ? (
          <OriginalHumanActor
            preset={upstreamHumanPreset}
            clip={upstreamHumanClip}
            paused={paused}
            origin={LAB_SITE}
            scale={1.2}
            speedScale={speedScale}
            edits={humanEdits}
            phaseOverride={humanEditPhase}
            showRig={showRig}
            attachment={humanAttachment}
            attachmentSocket={humanAttachmentSocket}
            pathRadius={1.6}
            pathOffset={0}
            moving={humanMoving && humanEditPhase === undefined}
            representation={humanRepresentation}
            bake={humanBakePreview}
          />
        ) : (
          <Human
            design={labHuman}
            clip={humanClip}
            stationary
            origin={LAB_SITE}
            speedScale={speedScale}
            paused={paused}
            showRig={showRig}
          />
        )}
      </group>
    </>
  )
}
