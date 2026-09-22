import { useEffect, useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { World, type LabSubject } from "./world/World"
import { SPECIES, speciesById } from "./animals/species"
import type { GaitName } from "./animals/types"
import { HUMAN_DESIGNS, generatedHuman, humanById } from "./humans/designs"
import type { HumanClip } from "./humans/types"

const gaitLabels: Record<GaitName, string> = {
  walk: "Passo",
  trot: "Trote",
  canter: "Galope curto",
  gallop: "Galope",
  hop: "Salto",
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
  const [speciesId, setSpeciesId] = useState("horse")
  const [gait, setGait] = useState<GaitName>("walk")
  const [humanId, setHumanId] = useState("traveler")
  const [humanSeed, setHumanSeed] = useState(42)
  const [humanClip, setHumanClip] = useState<HumanClip>("walk")
  const [speedScale, setSpeedScale] = useState(1)
  const [paused, setPaused] = useState(false)
  const [showRig, setShowRig] = useState(true)

  const species = useMemo(() => speciesById(speciesId), [speciesId])
  const human = useMemo(
    () => humanId === "generated" ? generatedHuman(humanSeed) : humanById(humanId),
    [humanId, humanSeed],
  )

  useEffect(() => {
    if (!species.supportedGaits.includes(gait)) setGait(species.supportedGaits[0])
  }, [species, gait])

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
          labSpecies={species}
          labGait={gait}
          labHuman={human}
          humanClip={humanClip}
          speedScale={speedScale}
          paused={paused}
          showRig={showRig}
        />
      </Canvas>

      <section className="dev-panel" aria-label="Laboratório de animação procedural">
        <div className="eyebrow">ARCA / PROCEDURAL LAB</div>
        <h1>Mundo + animais + humanos</h1>
        <p className="intro">
          Um único laboratório para inspecionar geração, rig, juntas, proporções e animações procedurais.
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
            <>
              <div><dt>Passada</dt><dd>{species.stride.toFixed(2)}</dd></div>
              <div><dt>Cadência</dt><dd>{species.cadence.toFixed(2)}</dd></div>
              <div><dt>Pernas</dt><dd>IK 2 elos</dd></div>
              <div><dt>Fase</dt><dd>por distância</dd></div>
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
