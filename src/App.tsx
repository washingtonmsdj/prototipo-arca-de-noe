import { useCallback, useEffect, useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { World, type AnimalEngine, type HumanEngine, type LabRepresentation, type LabSubject, type OriginalAnimalGroup } from "./world/World"
import { ArcaScene } from "./arca/ArcaScene"
import { SPECIES, speciesById } from "./animals/species"
import type { GaitName } from "./animals/types"
import {
  UPSTREAM_WILDLIFE_SPECIES,
  upstreamAnimalClips,
  type UpstreamAnimalClip,
} from "./animals/UpstreamAnimal"
import { WILDLIFE_PROFILES, type WildlifeKind } from "./pilgrimage/wildlife/species"
import {
  UPSTREAM_TRANSPORT_ANIMALS,
  upstreamTransportCoats,
  upstreamTransportDefinition,
  type UpstreamTransportClip,
  type UpstreamTransportKind,
} from "./animals/UpstreamTransportAnimal"
import { HUMAN_DESIGNS, generatedHuman, humanById } from "./humans/designs"
import {
  UPSTREAM_PERSON_CLIPS,
  UPSTREAM_PERSON_PRESETS,
  upstreamHumanFrames,
  type UpstreamHumanClip,
} from "./humans/UpstreamHuman"
import type { HumanClip } from "./humans/types"
import { AnimalRigEditorPanel } from "./dev/AnimalRigEditorPanel"
import { AnimalBakePanel } from "./dev/AnimalBakePanel"
import type { AnimalBakeTarget, AnimalClipBake } from "./pilgrimage/bake/animal-bake"
import { HumanRigEditorPanel } from "./dev/HumanRigEditorPanel"
import { HumanBakePanel } from "./dev/HumanBakePanel"
import type { HumanClipBake } from "./pilgrimage/bake/human-bake"
import type { EditableJoint, PoseEdits } from "../vendor/pilgrimage/lib/game/base-person/pose-edits"
import { SOCKET_NAMES, type SocketName } from "../vendor/pilgrimage/lib/game/base-person/pose"
import { HUMAN_ATTACHMENTS, type HumanAttachmentKind } from "./humans/attachments"
import { isOriginalMovingClip } from "./humans/upstream-motion"
import { isGroundWildlifeClip } from "./animals/upstream-motion"
import {
  ANIMAL_FRAMES,
  EMPTY_ANIMAL_EDITS,
  type AnimalClip,
  type AnimalJoint,
  type AnimalRigEdits,
} from "./pilgrimage/wildlife/rig-edits"

const gaitLabels: Record<GaitName, string> = {
  walk: "Passo",
  trot: "Trote",
  canter: "Galope curto",
  gallop: "Galope",
  hop: "Salto",
}

const upstreamAnimalClipLabels: Record<UpstreamAnimalClip, string> = {
  idle: "Parado",
  graze: "Pastando / alimentando",
  walk: "Passo",
  trot: "Trote",
  canter: "Canter",
  gallop: "Galope",
  hop: "Salto",
  leap: "Pulo longo",
  lie: "Deitado",
  burrow: "Toca",
  fly: "Voo",
  glide: "Planar",
}

const upstreamTransportClipLabels: Record<UpstreamTransportClip, string> = {
  idle: "Parado",
  walk: "Passo",
  graze: "Pastando",
}

const humanClipLabels: Record<HumanClip, string> = {
  idle: "Parado",
  walk: "Caminhada",
  carry: "Carregando",
  pray: "Rezar",
  build: "Construir",
  gather: "Coletar",
}

const upstreamHumanClipLabels: Record<UpstreamHumanClip, string> = {
  idle: "Parado",
  walk: "Caminhada",
  wearyWalk: "Caminhada cansada",
  sleeping: "Dormindo",
  sitting: "Sentado",
  seatedMeal: "Comendo sentado",
  seatedDrink: "Bebendo sentado",
  seatedPrayer: "Oração sentado",
  praying: "Rezando",
  drinking: "Bebendo no poço",
  drinkingLow: "Bebendo em fonte baixa",
  preaching: "Pregando",
  treeFelling: "Derrubando árvore",
  woodcutting: "Cortando madeira",
  building: "Construindo",
  gathering: "Coletando",
  carrying: "Carregando",
  hoisting: "Erguendo relíquia",
  procession: "Carregando acima da cabeça",
}

const HUMAN_CLIPS = Object.keys(humanClipLabels) as HumanClip[]

export function App() {
  const [labSubject, setLabSubject] = useState<LabSubject>("animal")
  const [animalEngine, setAnimalEngine] = useState<AnimalEngine>("pilgrimage")
  const [upstreamAnimalGroup, setUpstreamAnimalGroup] = useState<OriginalAnimalGroup>("wildlife")
  const [upstreamTransportKind, setUpstreamTransportKind] = useState<UpstreamTransportKind>("horse-common")
  const [upstreamTransportClip, setUpstreamTransportClip] = useState<UpstreamTransportClip>("walk")
  const [upstreamTransportCoat, setUpstreamTransportCoat] = useState("bay")
  const [animalRigEditing, setAnimalRigEditing] = useState(false)
  const [animalEditFrame, setAnimalEditFrame] = useState(0)
  const [animalEditJoint, setAnimalEditJoint] = useState<AnimalJoint>("head")
  const [animalEdits, setAnimalEdits] = useState<AnimalRigEdits>(EMPTY_ANIMAL_EDITS)
  const [animalMoving, setAnimalMoving] = useState(false)
  const [animalRepresentation, setAnimalRepresentation] = useState<LabRepresentation>("rig")
  const [animalBakePreview, setAnimalBakePreview] = useState<AnimalClipBake | null>(null)
  const [speciesId, setSpeciesId] = useState("horse")
  const [gait, setGait] = useState<GaitName>("walk")
  const [upstreamAnimalKind, setUpstreamAnimalKind] = useState<WildlifeKind>("deer")
  const [upstreamAnimalClip, setUpstreamAnimalClip] = useState<UpstreamAnimalClip>("walk")
  const [humanEngine, setHumanEngine] = useState<HumanEngine>("pilgrimage")
  const [humanId, setHumanId] = useState("traveler")
  const [humanSeed, setHumanSeed] = useState(42)
  const [upstreamHumanPreset, setUpstreamHumanPreset] = useState("Storybook")
  const [upstreamHumanClip, setUpstreamHumanClip] = useState<UpstreamHumanClip>("walk")
  const [humanRigEditing, setHumanRigEditing] = useState(false)
  const [humanEditFrame, setHumanEditFrame] = useState(0)
  const [humanEditJoint, setHumanEditJoint] = useState<EditableJoint>("head")
  const [humanEdits, setHumanEdits] = useState<PoseEdits>({})
  const [humanAttachment, setHumanAttachment] = useState<HumanAttachmentKind | "">("")
  const [humanAttachmentSocket, setHumanAttachmentSocket] = useState<SocketName>("rightHand")
  const [humanMoving, setHumanMoving] = useState(false)
  const [humanRepresentation, setHumanRepresentation] = useState<LabRepresentation>("rig")
  const [humanBakePreview, setHumanBakePreview] = useState<HumanClipBake | null>(null)
  const [humanClip, setHumanClip] = useState<HumanClip>("walk")
  const [speedScale, setSpeedScale] = useState(1)
  const [paused, setPaused] = useState(false)
  const [showRig, setShowRig] = useState(true)
  const [showArca, setShowArca] = useState(false)
  const [arcaDoorOpen, setArcaDoorOpen] = useState(false)

  const species = useMemo(() => speciesById(speciesId), [speciesId])
  const human = useMemo(
    () => humanId === "generated" ? generatedHuman(humanSeed) : humanById(humanId),
    [humanId, humanSeed],
  )
  const availableUpstreamAnimalClips = useMemo(
    () => upstreamAnimalClips(upstreamAnimalKind),
    [upstreamAnimalKind],
  )
  const availableTransportCoats = useMemo(
    () => upstreamTransportCoats(upstreamTransportKind),
    [upstreamTransportKind],
  )
  const transportDefinition = useMemo(
    () => upstreamTransportDefinition(upstreamTransportKind),
    [upstreamTransportKind],
  )
  const editableAnimalClip: AnimalClip = upstreamAnimalGroup === "wildlife"
    ? upstreamAnimalClip
    : upstreamTransportClip
  const canMoveOriginalAnimal = upstreamAnimalGroup === "wildlife"
    ? isGroundWildlifeClip(upstreamAnimalClip)
    : upstreamTransportClip === "walk"
  const animalBakeTarget = useMemo<AnimalBakeTarget>(
    () => upstreamAnimalGroup === "wildlife"
      ? {
          family: "wildlife",
          kind: upstreamAnimalKind,
          clip: upstreamAnimalClip,
          edits: animalEdits,
        }
      : {
          family: "transport",
          kind: transportDefinition.animal,
          variant: transportDefinition.variant,
          coatId: upstreamTransportCoat,
          clip: upstreamTransportClip,
          edits: animalEdits,
        },
    [
      upstreamAnimalGroup,
      upstreamAnimalKind,
      upstreamAnimalClip,
      transportDefinition,
      upstreamTransportCoat,
      upstreamTransportClip,
      animalEdits,
    ],
  )
  const upstreamHumanFrameCount = upstreamHumanFrames(upstreamHumanClip)
  const safeHumanEditFrame = Math.min(humanEditFrame, upstreamHumanFrameCount - 1)
  const canMoveOriginalHuman = isOriginalMovingClip(upstreamHumanClip)

  const handleAnimalBake = useCallback((result: AnimalClipBake | null) => {
    setAnimalBakePreview(result)
    if (!result) setAnimalRepresentation("rig")
  }, [])

  const handleHumanBake = useCallback((result: HumanClipBake | null) => {
    setHumanBakePreview(result)
    if (!result) setHumanRepresentation("rig")
  }, [])

  useEffect(() => {
    if (!species.supportedGaits.includes(gait)) setGait(species.supportedGaits[0])
  }, [species, gait])

  useEffect(() => {
    if (!availableUpstreamAnimalClips.includes(upstreamAnimalClip)) {
      setUpstreamAnimalClip(availableUpstreamAnimalClips[0] ?? "idle")
    }
  }, [availableUpstreamAnimalClips, upstreamAnimalClip])

  useEffect(() => {
    if (!availableTransportCoats.some((coat) => coat.id === upstreamTransportCoat)) {
      setUpstreamTransportCoat(availableTransportCoats[0]?.id ?? "")
    }
  }, [availableTransportCoats, upstreamTransportCoat])

  useEffect(() => {
    if (!canMoveOriginalAnimal && animalMoving) setAnimalMoving(false)
  }, [canMoveOriginalAnimal, animalMoving])

  useEffect(() => {
    if (humanEditFrame !== safeHumanEditFrame) setHumanEditFrame(safeHumanEditFrame)
  }, [humanEditFrame, safeHumanEditFrame])

  useEffect(() => {
    if (!canMoveOriginalHuman && humanMoving) setHumanMoving(false)
  }, [canMoveOriginalHuman, humanMoving])

  return (
    <main className="app-shell">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [13, 10, 14], fov: 42, near: .1, far: 100 }}
        gl={{ antialias: true }}
      >
        {showArca ? (
          <ArcaScene doorOpen={arcaDoorOpen} paused={paused} />
        ) : (
          <World
            labSubject={labSubject}
            animalEngine={animalEngine}
            upstreamAnimalGroup={upstreamAnimalGroup}
            upstreamTransportKind={upstreamTransportKind}
            upstreamTransportClip={upstreamTransportClip}
            upstreamTransportCoat={upstreamTransportCoat}
            animalEdits={animalEdits}
            animalEditPhase={animalRigEditing ? animalEditFrame / ANIMAL_FRAMES : undefined}
            animalMoving={animalMoving}
            animalRepresentation={animalRepresentation}
            animalBakePreview={animalBakePreview}
            labSpecies={species}
            labGait={gait}
            upstreamAnimalKind={upstreamAnimalKind}
            upstreamAnimalClip={upstreamAnimalClip}
            labHuman={human}
            humanClip={humanClip}
            humanEngine={humanEngine}
            upstreamHumanPreset={upstreamHumanPreset}
            upstreamHumanClip={upstreamHumanClip}
            humanEdits={humanEdits}
            humanEditPhase={humanRigEditing ? safeHumanEditFrame / upstreamHumanFrameCount : undefined}
            humanAttachment={humanAttachment || undefined}
            humanAttachmentSocket={humanAttachment ? humanAttachmentSocket : undefined}
            humanMoving={humanMoving}
            humanRepresentation={humanRepresentation}
            humanBakePreview={humanBakePreview}
            speedScale={speedScale}
            paused={paused}
            showRig={showRig}
          />
        )}
      </Canvas>

      <section className="dev-panel" aria-label="Laboratório de animação procedural">
        <div className="eyebrow">ARCA / PROCEDURAL LAB</div>
        <h1>{showArca ? "Prévia 3D da arca" : "Mundo + animais + humanos"}</h1>
        <p className="intro">
          {showArca
            ? "Assets GLB preparados para o runtime Three.js: terreno do canteiro, arca modular e porta com pivot de acesso."
            : "Laboratório para comparar a implementação Arca com os sistemas autorizados do Pilgrimage."}
        </p>

        <div className="button-row arca-toolbar">
          <button
            type="button"
            className={showArca ? "active" : ""}
            onClick={() => setShowArca((value) => !value)}
          >
            {showArca ? "Voltar ao laboratório" : "Abrir arca 3D"}
          </button>
          <button
            type="button"
            className={arcaDoorOpen ? "active" : ""}
            disabled={!showArca}
            onClick={() => setArcaDoorOpen((value) => !value)}
          >
            {arcaDoorOpen ? "Fechar porta" : "Abrir porta"}
          </button>
        </div>

        <label>
          Tipo
          <select value={labSubject} onChange={(event) => setLabSubject(event.target.value as LabSubject)}>
            <option value="animal">Animal</option>
            <option value="human">Humano</option>
          </select>
        </label>

        {labSubject === "animal" ? (
          <>
            <label>
              Motor animal
              <select value={animalEngine} onChange={(event) => setAnimalEngine(event.target.value as AnimalEngine)}>
                <option value="pilgrimage">Pilgrimage original</option>
                <option value="arca">Arca simplificado</option>
              </select>
            </label>

            {animalEngine === "pilgrimage" ? (
              <>
                <label>
                  Sistema original
                  <select
                    value={upstreamAnimalGroup}
                    onChange={(event) => setUpstreamAnimalGroup(event.target.value as OriginalAnimalGroup)}
                  >
                    <option value="wildlife">Fauna</option>
                    <option value="transport">Equinos e bovino</option>
                  </select>
                </label>

                {upstreamAnimalGroup === "wildlife" ? (
                  <>
                    <label>
                      Espécie original
                      <select
                        value={upstreamAnimalKind}
                        onChange={(event) => setUpstreamAnimalKind(event.target.value as WildlifeKind)}
                      >
                        {UPSTREAM_WILDLIFE_SPECIES.map((kind) => (
                          <option key={kind} value={kind}>{WILDLIFE_PROFILES[kind].label}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Ação
                      <select
                        value={upstreamAnimalClip}
                        onChange={(event) => setUpstreamAnimalClip(event.target.value as UpstreamAnimalClip)}
                      >
                        {availableUpstreamAnimalClips.map((clip) => (
                          <option key={clip} value={clip}>{upstreamAnimalClipLabels[clip]}</option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      Animal original
                      <select
                        value={upstreamTransportKind}
                        onChange={(event) => setUpstreamTransportKind(event.target.value as UpstreamTransportKind)}
                      >
                        {UPSTREAM_TRANSPORT_ANIMALS.map((entry) => (
                          <option key={entry.id} value={entry.id}>{entry.label}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Pelagem
                      <select
                        value={upstreamTransportCoat}
                        onChange={(event) => setUpstreamTransportCoat(event.target.value)}
                      >
                        {availableTransportCoats.map((coat) => (
                          <option key={coat.id} value={coat.id}>{coat.label}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Ação
                      <select
                        value={upstreamTransportClip}
                        onChange={(event) => setUpstreamTransportClip(event.target.value as UpstreamTransportClip)}
                      >
                        {(Object.keys(upstreamTransportClipLabels) as UpstreamTransportClip[]).map((clip) => (
                          <option key={clip} value={clip}>{upstreamTransportClipLabels[clip]}</option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
                <div className="button-row">
                  <button
                    type="button"
                    className={animalMoving ? "active" : ""}
                    disabled={!canMoveOriginalAnimal || animalRigEditing}
                    onClick={() => setAnimalMoving((value) => !value)}
                  >
                    {animalMoving ? "Parar deslocamento" : "Mover no mundo"}
                  </button>
                  <button
                    type="button"
                    className={animalRigEditing ? "active" : ""}
                    onClick={() => setAnimalRigEditing((value) => !value)}
                  >
                    {animalRigEditing ? "Fechar editor" : "Editar rig"}
                  </button>
                </div>

                {animalRigEditing && (
                  <AnimalRigEditorPanel
                    clip={editableAnimalClip}
                    edits={animalEdits}
                    onChange={setAnimalEdits}
                    frame={animalEditFrame}
                    onFrameChange={setAnimalEditFrame}
                    joint={animalEditJoint}
                    onJointChange={setAnimalEditJoint}
                  />
                )}

                <label>
                  Representação
                  <select
                    value={animalRepresentation}
                    onChange={(event) => setAnimalRepresentation(event.target.value as LabRepresentation)}
                  >
                    <option value="rig">Rig 3D</option>
                    <option value="sprite" disabled={!animalBakePreview}>Sprite + depth</option>
                    <option value="auto" disabled={!animalBakePreview}>Auto por distância</option>
                  </select>
                </label>

                <AnimalBakePanel target={animalBakeTarget} onBake={handleAnimalBake} />
              </>
            ) : (
              <>
                <label>
                  Espécie
                  <select value={speciesId} onChange={(event) => setSpeciesId(event.target.value)}>
                    {SPECIES.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
                  </select>
                </label>

                <label>
                  Movimento
                  <select value={gait} onChange={(event) => setGait(event.target.value as GaitName)}>
                    {species.supportedGaits.map((name) => <option key={name} value={name}>{gaitLabels[name]}</option>)}
                  </select>
                </label>
              </>
            )}
          </>
        ) : (
          <>
            <label>
              Motor humano
              <select value={humanEngine} onChange={(event) => setHumanEngine(event.target.value as HumanEngine)}>
                <option value="pilgrimage">Pilgrimage original</option>
                <option value="arca">Arca simplificado</option>
              </select>
            </label>

            {humanEngine === "pilgrimage" ? (
              <>
                <label>
                  Preset original
                  <select value={upstreamHumanPreset} onChange={(event) => setUpstreamHumanPreset(event.target.value)}>
                    {UPSTREAM_PERSON_PRESETS.map((preset) => <option key={preset} value={preset}>{preset}</option>)}
                  </select>
                </label>

                <label>
                  Ação original
                  <select
                    value={upstreamHumanClip}
                    onChange={(event) => setUpstreamHumanClip(event.target.value as UpstreamHumanClip)}
                  >
                    {UPSTREAM_PERSON_CLIPS.map((clip) => (
                      <option key={clip} value={clip}>
                        {upstreamHumanClipLabels[clip]} · {upstreamHumanFrames(clip)}f
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Objeto de socket
                  <select
                    value={humanAttachment}
                    onChange={(event) => {
                      const value = event.target.value as HumanAttachmentKind | ""
                      setHumanAttachment(value)
                      const definition = HUMAN_ATTACHMENTS.find((entry) => entry.id === value)
                      if (definition) setHumanAttachmentSocket(definition.defaultSocket)
                    }}
                  >
                    <option value="">Nenhum</option>
                    {HUMAN_ATTACHMENTS.map((entry) => (
                      <option key={entry.id} value={entry.id}>{entry.label}</option>
                    ))}
                  </select>
                </label>

                {humanAttachment && (
                  <label>
                    Socket
                    <select
                      value={humanAttachmentSocket}
                      onChange={(event) => setHumanAttachmentSocket(event.target.value as SocketName)}
                    >
                      {SOCKET_NAMES.map((socket) => (
                        <option key={socket} value={socket}>{socket}</option>
                      ))}
                    </select>
                  </label>
                )}

                <div className="button-row">
                  <button
                    type="button"
                    className={humanMoving ? "active" : ""}
                    disabled={!canMoveOriginalHuman || humanRigEditing}
                    onClick={() => setHumanMoving((value) => !value)}
                  >
                    {humanMoving ? "Parar deslocamento" : "Mover no mundo"}
                  </button>
                  <button
                    type="button"
                    className={humanRigEditing ? "active" : ""}
                    onClick={() => setHumanRigEditing((value) => !value)}
                  >
                    {humanRigEditing ? "Fechar editor" : "Editar pose"}
                  </button>
                </div>

                {humanRigEditing && (
                  <HumanRigEditorPanel
                    clip={upstreamHumanClip}
                    edits={humanEdits}
                    onChange={setHumanEdits}
                    frame={safeHumanEditFrame}
                    onFrameChange={setHumanEditFrame}
                    joint={humanEditJoint}
                    onJointChange={setHumanEditJoint}
                  />
                )}

                <label>
                  Representação
                  <select
                    value={humanRepresentation}
                    onChange={(event) => setHumanRepresentation(event.target.value as LabRepresentation)}
                  >
                    <option value="rig">Rig 3D</option>
                    <option value="sprite" disabled={!humanBakePreview}>Sprite + depth</option>
                    <option value="auto" disabled={!humanBakePreview}>Auto por distância</option>
                  </select>
                </label>

                <HumanBakePanel
                  preset={upstreamHumanPreset}
                  clip={upstreamHumanClip}
                  edits={humanEdits}
                  attachment={humanAttachment || undefined}
                  attachmentSocket={humanAttachment ? humanAttachmentSocket : undefined}
                  onBake={handleHumanBake}
                />
              </>
            ) : (
              <>
                <label>
                  Perfil humano
                  <select value={humanId} onChange={(event) => setHumanId(event.target.value)}>
                    {HUMAN_DESIGNS.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
                    <option value="generated">Gerado por seed</option>
                  </select>
                </label>

                {humanId === "generated" && (
                  <label>
                    Seed <strong>{humanSeed}</strong>
                    <input
                      type="range"
                      min="1"
                      max="250"
                      step="1"
                      value={humanSeed}
                      onChange={(event) => setHumanSeed(Number(event.target.value))}
                    />
                  </label>
                )}

                <label>
                  Ação
                  <select value={humanClip} onChange={(event) => setHumanClip(event.target.value as HumanClip)}>
                    {HUMAN_CLIPS.map((clip) => <option key={clip} value={clip}>{humanClipLabels[clip]}</option>)}
                  </select>
                </label>
              </>
            )}
          </>
        )}

        <label>
          Velocidade <strong>{speedScale.toFixed(2)}×</strong>
          <input
            type="range"
            min=".25"
            max="2"
            step=".05"
            value={speedScale}
            onChange={(event) => setSpeedScale(Number(event.target.value))}
          />
        </label>

        <div className="button-row">
          <button type="button" onClick={() => setPaused((value) => !value)}>{paused ? "Continuar" : "Pausar"}</button>
          <button type="button" className={showRig ? "active" : ""} onClick={() => setShowRig((value) => !value)}>Juntas</button>
        </div>

        <dl>
          {labSubject === "animal" ? (
            animalEngine === "pilgrimage" ? (
              upstreamAnimalGroup === "wildlife" ? (
                <>
                  <div><dt>Origem</dt><dd>Pilgrimage</dd></div>
                  <div><dt>Espécie</dt><dd>{WILDLIFE_PROFILES[upstreamAnimalKind].label}</dd></div>
                  <div><dt>Rig</dt><dd>wildlife original</dd></div>
                  <div><dt>Ação</dt><dd>{upstreamAnimalClipLabels[upstreamAnimalClip]}</dd></div>
                  <div><dt>Locomoção</dt><dd>{animalMoving ? "fase por distância" : "preview estacionário"}</dd></div>
                  <div><dt>Representação</dt><dd>{
                    animalRepresentation === "auto"
                      ? "auto por distância"
                      : animalRepresentation === "sprite"
                        ? "sprite + depth"
                        : "rig 3D"
                  }</dd></div>
                  <div><dt>Representação</dt><dd>{animalRepresentation === "sprite" ? "sprite + depth" : "rig 3D"}</dd></div>
                </>
              ) : (
                <>
                  <div><dt>Origem</dt><dd>Pilgrimage</dd></div>
                  <div><dt>Animal</dt><dd>{transportDefinition.label}</dd></div>
                  <div><dt>Rig</dt><dd>transport original</dd></div>
                  <div><dt>Ação</dt><dd>{upstreamTransportClipLabels[upstreamTransportClip]}</dd></div>
                  <div><dt>Locomoção</dt><dd>{animalMoving ? "fase por distância" : "preview estacionário"}</dd></div>
                </>
              )
            ) : (
              <>
                <div><dt>Passada</dt><dd>{species.stride.toFixed(2)}</dd></div>
                <div><dt>Cadência</dt><dd>{species.cadence.toFixed(2)}</dd></div>
                <div><dt>Pernas</dt><dd>IK 2 elos</dd></div>
                <div><dt>Fase</dt><dd>por distância</dd></div>
              </>
            )
          ) : humanEngine === "pilgrimage" ? (
            <>
              <div><dt>Origem</dt><dd>Pilgrimage</dd></div>
              <div><dt>Preset</dt><dd>{upstreamHumanPreset}</dd></div>
              <div><dt>Rig</dt><dd>original</dd></div>
              <div><dt>Clip</dt><dd>{upstreamHumanClipLabels[upstreamHumanClip]}</dd></div>
              <div><dt>Locomoção</dt><dd>{humanMoving ? "distância + foot lock" : "preview estacionário"}</dd></div>
              <div><dt>Representação</dt><dd>{
                humanRepresentation === "auto"
                  ? "auto por distância"
                  : humanRepresentation === "sprite"
                    ? "sprite + depth"
                    : "rig 3D"
              }</dd></div>
            </>
          ) : (
            <>
              <div><dt>Altura</dt><dd>{human.height.toFixed(2)}×</dd></div>
              <div><dt>Cadência</dt><dd>{human.cadence.toFixed(2)}</dd></div>
              <div><dt>Pernas</dt><dd>IK 2 elos</dd></div>
              <div><dt>Clip</dt><dd>{humanClipLabels[humanClip]}</dd></div>
            </>
          )}
        </dl>
      </section>

      <aside className="status">Pilgrimage authorized port · procedural generation · TypeScript · Three.js · R3F</aside>
    </main>
  )
}
