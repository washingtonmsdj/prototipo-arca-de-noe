import { Component, useCallback, useState, type ReactNode } from "react"
import { Canvas } from "@react-three/fiber"
import * as THREE from "three"
import { ArcaScene } from "./ArcaScene"
import { type ArcaTimeOfDay } from "./ArcaEnvironment"

class SceneError extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed
      ? <p role="alert">Não foi possível carregar a arca. Recarregue a página.</p>
      : this.props.children
  }
}

export default function ArcaPage() {
  const [doorOpen, setDoorOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  const [nearDoor, setNearDoor] = useState(false)
  const [birds, setBirds] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState<ArcaTimeOfDay>("day")
  const [rainEnabled, setRainEnabled] = useState(false)
  const toggleDoor = useCallback(() => setDoorOpen(value => !value), [])
  return <main className="app-shell">
    <SceneError>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.shadowMap.type = THREE.PCFSoftShadowMap
        }}
        camera={{ near: 0.1, far: 2000 }}
      >
        <ArcaScene doorOpen={doorOpen} paused={paused} onInteract={toggleDoor} onNearDoor={setNearDoor} birds={birds} timeOfDay={timeOfDay} rainEnabled={rainEnabled} />
      </Canvas>
    </SceneError>
    <section className="dev-panel" aria-label="Arca finalizada">
      <h1>Arca finalizada</h1>
      <p className="intro">WASD ou setas: mover Noé · Shift: correr · Arrastar: girar câmera · Roda: zoom.</p>
      <p role="status">{nearDoor ? `E — ${doorOpen ? "fechar" : "abrir"} porta` : "Aproxime-se da porta para usar E."}</p>
      <div className="button-row">
        <button disabled={!nearDoor || paused} onClick={toggleDoor}>{doorOpen ? "Fechar porta (E)" : "Abrir porta (E)"}</button>
        <button onClick={() => setPaused(v => !v)}>{paused ? "Continuar animação" : "Pausar animação"}</button>
      </div>
      <p className="intro">Prévia do modelo exterior. O modo de construção progressiva será desenvolvido separadamente.</p>
      <div className="environment-controls" aria-label="Ambiente do mundo">
        <label>Horário
          <select value={timeOfDay} onChange={event => setTimeOfDay(event.target.value as ArcaTimeOfDay)}>
            <option value="day">Dia</option>
            <option value="sunset">Fim da tarde</option>
            <option value="night">Noite</option>
          </select>
        </label>
        <button type="button" aria-pressed={rainEnabled} onClick={() => setRainEnabled(value => !value)}>
          {rainEnabled ? "Chuva ligada" : "Chuva desligada"}
        </button>
      </div>
      <button onClick={() => setBirds(value => !value)}>{birds ? "Voltar à entrada" : "Ir aos viveiros de aves"}</button>
      <p className="intro">Os 162 grupos do catálogo atual estão alocados. As baias encostam no casco externo, com portões voltados para um corredor central: grandes animais abaixo, rebanhos e microfauna separados no meio, viveiros e recintos menores acima.</p>
      <p className="intro">162 alojamentos planejados · 128 módulos estruturais · 1.080 indivíduos de referência · espaço residual dedicado a serviço.</p>
      <a href="/">Voltar ao laboratório</a>
    </section>
  </main>
}
