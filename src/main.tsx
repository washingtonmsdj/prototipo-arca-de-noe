import { StrictMode, Suspense, lazy } from "react"
import { createRoot } from "react-dom/client"
const Lab = lazy(() => import("./App").then(module => ({ default: module.App })))
const ArcaPage = lazy(() => import("./arca/ArcaPage"))
import "./styles.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<p role="status">Carregando…</p>}>
      {window.location.pathname.replace(/\/$/, "") === "/arca" ? <ArcaPage /> : <Lab />}
    </Suspense>
  </StrictMode>,
)
