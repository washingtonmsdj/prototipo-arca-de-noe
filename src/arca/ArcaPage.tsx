import { Component, useCallback, useState, type ReactNode } from "react"
import { Canvas } from "@react-three/fiber"
import { ArcaScene } from "./ArcaScene"

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
  const [gallery, setGallery] = useState(false)
  const [birds, setBirds] = useState(false)
  const toggleDoor = useCallback(() => setDoorOpen(value => !value), [])
  return <main className="app-shell">
    <SceneError>
      <Canvas shadows dpr={[1, 1.5]} camera={{ near: 0.1, far: 2000 }}>
        <ArcaScene doorOpen={doorOpen} paused={paused} onInteract={toggleDoor} onNearDoor={setNearDoor} gallery={gallery} birds={birds} />
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
      <button onClick={() => { setBirds(false); setGallery(value => !value) }}>{gallery ? "Voltar à entrada" : "Ver novos animais"}</button>
      <button onClick={() => { setGallery(false); setBirds(value => !value) }}>{birds ? "Voltar à entrada" : "Ir aos viveiros de aves"}</button>
      <p className="intro">Aves: 40 grupos nos viveiros superiores. Avestruzes e emas no intermediário. Novas aves ainda na galeria externa.</p>
      <p className="intro">142 baias identificadas: 138 ocupadas e 4 disponíveis. 24 grupos permanecem na galeria externa.</p>
      <a href="/">Voltar ao laboratório</a>
    </section>
  </main>
}
