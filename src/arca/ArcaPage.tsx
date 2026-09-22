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
  const [birds, setBirds] = useState(false)
  const toggleDoor = useCallback(() => setDoorOpen(value => !value), [])
  return <main className="app-shell">
    <SceneError>
      <Canvas shadows dpr={[1, 1.5]} camera={{ near: 0.1, far: 2000 }}>
        <ArcaScene doorOpen={doorOpen} paused={paused} onInteract={toggleDoor} onNearDoor={setNearDoor} birds={birds} />
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
      <button onClick={() => setBirds(value => !value)}>{birds ? "Voltar à entrada" : "Ir aos viveiros de aves"}</button>
      <p className="intro">Todos os 162 grupos estão alocados dentro da arca. As aves usam os viveiros superiores; avestruzes e emas permanecem no pavimento intermediário.</p>
      <p className="intro">162 baias físicas ocupadas · 1.080 indivíduos de referência · nenhuma galeria externa pendente.</p>
      <a href="/">Voltar ao laboratório</a>
    </section>
  </main>
}
