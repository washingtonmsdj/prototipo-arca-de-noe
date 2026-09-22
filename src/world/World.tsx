import { useEffect, useMemo } from "react"
import { Animal } from "../animals/Animal"
import { UpstreamAnimal } from "../animals/UpstreamAnimal"
import { UpstreamTransportAnimal, type UpstreamTransportClip, type UpstreamTransportKind } from "../animals/UpstreamTransportAnimal"
import { SPECIES } from "../animals/species"
import type { AnimalSpecies, GaitName } from "../animals/types"
import type { AnimalClip, AnimalRigEdits } from "../pilgrimage/wildlife/rig-edits"
import type { WildlifeKind } from "../pilgrimage/wildlife/species"
import { Human } from "../humans/Human"
import { UpstreamHuman, type UpstreamHumanClip } from "../humans/UpstreamHuman"
import { HUMAN_DESIGNS, generatedHuman } from "../humans/designs"
import type { HumanClip, HumanDesign } from "../humans/types"
import type { PoseEdits } from "../../vendor/pilgrimage/lib/game/base-person/pose-edits"
import { createTerrainGeometry, terrainHeight } from "./terrain"
import { GeneratedEnvironment } from "./GeneratedEnvironment"

export type LabSubject = "animal" | "human"
export type HumanEngine = "arca" | "pilgrimage"
export type AnimalEngine = "arca" | "pilgrimage"
export type OriginalAnimalGroup = "wildlife" | "transport"

interface WorldProps {
  labSubject: LabSubject
  animalEngine: AnimalEngine
  upstreamAnimalGroup: OriginalAnimalGroup
  upstreamTransportKind: UpstreamTransportKind
  upstreamTransportClip: UpstreamTransportClip
  upstreamTransportCoat: string
  animalEdits: AnimalRigEdits
  animalEditPhase?: number
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
  speedScale: number
  paused: boolean
  showRig: boolean
}

function Terrain() {
  const geometry = useMemo(() => createTerrainGeometry(), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} flatShading />
    </mesh>
  )
}

function AmbientHerds({ paused }: { paused: boolean }) {
  return (
    <group>
      {SPECIES.map((species, speciesIndex) => {
        const gait = species.supportedGaits[Math.min(1, species.supportedGaits.length - 1)]
        const side = speciesIndex % 2 ? 1 : -1
        const band = Math.floor(speciesIndex / 2)
        return [0, 1].map((pair) => (
          <Animal
            key={species.id + pair}
            species={species}
            gait={gait}
            pathRadius={2.4 + pair * .7}
            pathOffset={speciesIndex * .71 + pair * 1.8}
            origin={[side * (7 + band * 2.5), -7 + band * 4.2]}
            speedScale={.55 + pair * .08}
            paused={paused}
          />
        ))
      })}
    </group>
  )
}

function AmbientPeople({ paused }: { paused: boolean }) {
  return (
    <group>
      {HUMAN_DESIGNS.flatMap((design, index) => {
        const generated = generatedHuman(100 + index)
        const side = index % 2 ? -1 : 1
        const z = 7 + Math.floor(index / 2) * 4
        return [
          <Human
            key={design.id}
            design={design}
            clip="walk"
            pathRadius={2.1}
            pathOffset={index * .83}
            origin={[side * (6.5 + index * .6), z]}
            speedScale={.72}
            paused={paused}
          />,
          <Human
            key={generated.id}
            design={generated}
            clip="walk"
            pathRadius={2.7}
            pathOffset={index * .83 + 1.7}
            origin={[side * (6.5 + index * .6), z]}
            speedScale={.64}
            paused={paused}
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
  speedScale,
  paused,
  showRig,
}: WorldProps) {
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

      <Terrain />
      <GeneratedEnvironment />
      <AmbientHerds paused={paused} />
      <AmbientPeople paused={paused} />

      <group>
        <mesh position={[0, terrainHeight(0, 0) + .02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[2.2, 48]} />
          <meshStandardMaterial color="#8b9c6d" roughness={1} />
        </mesh>

        {labSubject === "animal" ? (
          animalEngine === "pilgrimage" ? (
            upstreamAnimalGroup === "transport" ? (
              <UpstreamTransportAnimal
                kind={upstreamTransportKind}
                clip={upstreamTransportClip}
                coatId={upstreamTransportCoat}
                paused={paused}
                showRig={showRig}
                speedScale={speedScale}
                edits={animalEdits}
                phaseOverride={animalEditPhase}
                origin={[0, 0]}
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
                origin={[0, 0]}
              />
            )
          ) : (
            <Animal
              species={labSpecies}
              gait={labGait}
              stationary
              origin={[0, 0]}
              speedScale={speedScale}
              paused={paused}
              showRig={showRig}
            />
          )
        ) : humanEngine === "pilgrimage" ? (
          <UpstreamHuman
            preset={upstreamHumanPreset}
            clip={upstreamHumanClip}
            paused={paused}
            origin={[0, 0]}
            scale={1.2}
            speedScale={speedScale}
            edits={humanEdits}
            phaseOverride={humanEditPhase}
            showRig={showRig}
          />
        ) : (
          <Human
            design={labHuman}
            clip={humanClip}
            stationary
            origin={[0, 0]}
            speedScale={speedScale}
            paused={paused}
            showRig={showRig}
          />
        )}
      </group>
    </>
  )
}
