import { useEffect, useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { World, type AnimalEngine, type HumanEngine, type LabSubject } from "./world/World"
import { SPECIES, speciesById } from "./animals/species"
import type { GaitName } from "./animals/types"
import {
  UPSTREAM_WILDLIFE_SPECIES,
  upstreamAnimalClips,
  type UpstreamAnimalClip,
} from "./animals/UpstreamAnimal"
import { WILDLIFE_PROFILES, type WildlifeKind } from "../vendor/pilgrimage/lib/game/wildlife/species"
import { HUMAN_DESIGNS, generatedHuman, humanById } from "./humans/designs"
import { UPSTREAM_PERSON_PRESETS } from "./humans/UpstreamHuman"
import type { HumanClip } from "./humans/types"

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

const humanClipLabels: Record<HumanClip, string> = {
  idle: "Parado",
  walk: "Caminhada",
  carry: "Carregando",
  pray: "Rezar",
  build: "Construir",
  gather: "Coletar",
}

const HUMAN_CLIPS = Object.keys(humanClipLabels) as HumanClip[]

export function App() {
  const [labSubject, setLabSubject] = useState<LabSubject>("animal")
  const [animalEngine, setAnimalEngine] = useState<AnimalEngine>("pilgrimage")
  const [speciesId, setSpeciesId] = useState("horse")
  const [gait, setGait] = useState<GaitName>("walk")
  const [upstreamAnimalKind, setUpstreamAnimalKind] = useState<WildlifeKind>("deer")
  const [upstreamAnimalClip, setUpstreamAnimalClip] = useState<UpstreamAnimalClip>("walk")
  const [humanEngine, setHumanEngine] = useState<HumanEngine>("pilgrimage")
  const [humanId, setHumanId] = useState("traveler")
  const [humanSeed, setHumanSeed] = useState(42)
  const [upstreamHumanPreset, setUpstreamHumanPreset] = useState("Storybook")
  const [humanClip, setHumanClip] = useState<HumanClip>("walk")
  const [speedScale, setSpeedScale] = useState(1)
  const [paused, setPaused] = useState(false)
  const [showRig, setShowRig] = useState(true)

  const species = useMemo(() => speciesById(speciesId), [speciesId])
  const human = useMemo(
    () => humanId === "generated" ? generatedHuman(humanSeed) : humanById(humanId),
    [humanId, humanSeed],
  )
  const availableUpstreamAnimalClips = useMemo(
    () => upstreamAnimalClips(upstreamAnimalKind),
    [upstreamAnimalKind],
  )

  useEffect(() => {
    if (!species.supportedGaits.includes(gait)) setGait(species.supportedGaits[0])
  }, [species, gait])

  useEffect(() => {
    if (!availableUpstreamAnimalClips.includes(upstreamAnimalClip)) {
      setUpstreamAnimalClip(availableUpstreamAnimalClips[0] ?? "idle")
    }
  }, [availableUpstreamAnimalClips, upstreamAnimalClip])

  return (
    <main className="app-shell">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [13, 10, 14], fov: 42, near: .1, far: 100 }}
        gl={{ antialias: true }}
      >
        <World
          labSubject={labSubject}
          animalEngine={animalEngine}
          labSpecies={species}
          labGait={gait}
          upstreamAnimalKind={upstreamAnimalKind}
          upstreamAnimalClip={upstreamAnimalClip}
          labHuman={human}
          humanClip={humanClip}
          humanEngine={humanEngine}
          upstreamHumanPreset={upstreamHumanPreset}
          speedScale={speedScale}
          paused={paused}
          showRig={showRig}
        />
      </Canvas>

      <section className="dev-panel" aria-label="Laboratório de animação procedural">
        <div className="eyebrow">ARCA / PROCEDURAL LAB</div>
        <h1>Mundo + animais + humanos</h1>
        <p className="intro">
          Laboratório para comparar a implementação Arca com os sistemas autorizados do Pilgrimage.
        </p>

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
              <label>
                Preset original
                <select value={upstreamHumanPreset} onChange={(event) => setUpstreamHumanPreset(event.target.value)}>
                  {UPSTREAM_PERSON_PRESETS.map((preset) => <option key={preset} value={preset}>{preset}</option>)}
                </select>
              </label>
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
              </>
            )}

            <label>
              Ação
              <select value={humanClip} onChange={(event) => setHumanClip(event.target.value as HumanClip)}>
                {HUMAN_CLIPS.map((clip) => <option key={clip} value={clip}>{humanClipLabels[clip]}</option>)}
              </select>
            </label>
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
              <>
                <div><dt>Origem</dt><dd>Pilgrimage</dd></div>
                <div><dt>Espécie</dt><dd>{WILDLIFE_PROFILES[upstreamAnimalKind].label}</dd></div>
                <div><dt>Rig</dt><dd>original</dd></div>
                <div><dt>Ação</dt><dd>{upstreamAnimalClipLabels[upstreamAnimalClip]}</dd></div>
              </>
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
              <div><dt>Clip</dt><dd>{humanClipLabels[humanClip]}</dd></div>
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
