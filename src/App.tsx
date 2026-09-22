import { useEffect, useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { World } from "./world/World"
import { SPECIES, speciesById } from "./animals/species"
import type { GaitName } from "./animals/types"

const gaitLabels: Record<GaitName, string> = {
  walk: "Passo",
  trot: "Trote",
  canter: "Galope curto",
  gallop: "Galope",
  hop: "Salto",
}

export function App() {
  const [speciesId, setSpeciesId] = useState("horse")
  const [gait, setGait] = useState<GaitName>("walk")
  const [speedScale, setSpeedScale] = useState(1)
  const [paused, setPaused] = useState(false)
  const [showRig, setShowRig] = useState(true)
  const species = useMemo(() => speciesById(speciesId), [speciesId])

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
          labSpecies={species}
          labGait={gait}
          speedScale={speedScale}
          paused={paused}
          showRig={showRig}
        />
      </Canvas>

      <section className="dev-panel" aria-label="Laboratório de animação">
        <div className="eyebrow">ARCA / FAUNA LAB</div>
        <h1>Mundo + animação procedural</h1>
        <p className="intro">O animal central é o laboratório. O restante do mundo mantém pares das espécies registradas.</p>

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
          <div><dt>Passada</dt><dd>{species.stride.toFixed(2)}</dd></div>
          <div><dt>Cadência</dt><dd>{species.cadence.toFixed(2)}</dd></div>
          <div><dt>Pernas</dt><dd>IK 2 elos</dd></div>
          <div><dt>Fase</dt><dd>por distância</dd></div>
        </dl>
      </section>

      <aside className="status">clean-room · TypeScript · Three.js · R3F</aside>
    </main>
  )
}
