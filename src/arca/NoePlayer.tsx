import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Group, PerspectiveCamera, Raycaster, Vector3 } from "three"
import { SceneCollision, WALKABLE, SOLID, CAMERA } from "./SceneCollision"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

// Tuned for a large world measured in metres: responsive exploration pace,
// while keeping sprint useful for crossing the shipyard.
const WALK_SPEED = 5.8
const RUN_SPEED = 9.2

export function NoePlayer({ paused, onInteract, onNearDoor, birds = false }: {
  birds?: boolean
  paused: boolean
  onInteract: () => void
  onNearDoor: (near: boolean) => void
}) {
  const player = useRef<Group>(null)
  const keys = useRef(new Set<string>())
  const near = useRef(false)
  const controls = useRef<OrbitControls | null>(null)
  const collision = useRef<SceneCollision | null>(null)
  const cameraDesired = useRef<Vector3 | null>(null)
  const cameraCorrection = useRef(new Vector3())
  const { camera, gl, scene } = useThree()
  const scratch = useRef({
    forward: new Vector3(), right: new Vector3(), move: new Vector3(),
    next: new Vector3(), old: new Vector3(), origin: new Vector3(), follow: new Vector3(),
    down: new Vector3(0, -1, 0), up: new Vector3(0, 1, 0), ray: new Raycaster(),
  })

  useEffect(() => {
    const orbit = new OrbitControls(camera, gl.domElement)
    controls.current = orbit
    orbit.enablePan = false
    orbit.enableDamping = true
    orbit.dampingFactor = .085
    orbit.rotateSpeed = .62
    orbit.zoomSpeed = .72
    orbit.minDistance = 3.2
    orbit.maxDistance = 22
    orbit.minPolarAngle = .28
    orbit.maxPolarAngle = Math.PI / 2 - 0.06
    orbit.target.set(-55, 6.1, 18)
    camera.position.set(-55, 9, 26)
    if (camera instanceof PerspectiveCamera) {
      camera.fov = 55
      camera.near = 0.1
      camera.far = 1500
      camera.updateProjectionMatrix()
    }
    orbit.update()
    return () => { orbit.dispose(); controls.current = null }
  }, [camera, gl])

  useEffect(() => {
    const body = player.current
    const orbit = controls.current
    if (!body || !orbit) return
    if (birds) body.position.set(-50, 9.08, 0)
    else body.position.set(-55, 5, 18)
    orbit.target.copy(body.position).add(new Vector3(0, 1.25, 0))
    camera.position.copy(body.position).add(new Vector3(0, 4, 8))
    cameraCorrection.current.set(0, 0, 0)
    cameraDesired.current = null
    keys.current.clear()
    orbit.update()
  }, [birds, camera])

  useEffect(() => {
    const editable = (target: EventTarget | null) => target instanceof HTMLElement
      && (target.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName))
    const down = (event: KeyboardEvent) => {
      if (editable(event.target)) return
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "ShiftLeft", "ShiftRight"].includes(event.code)) {
        event.preventDefault()
        keys.current.add(event.code)
      }
      if (event.code === "KeyE" && !event.repeat && near.current && !paused) onInteract()
    }
    const up = (event: KeyboardEvent) => keys.current.delete(event.code)
    const clear = () => keys.current.clear()
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    window.addEventListener("blur", clear)
    document.addEventListener("visibilitychange", clear)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      window.removeEventListener("blur", clear)
      document.removeEventListener("visibilitychange", clear)
      clear()
    }
  }, [onInteract, paused])

  useFrame((_, delta) => {
    const body = player.current
    const orbit = controls.current
    if (!body || !orbit) return
    // Undo only the previous collision correction; preserve mouse/zoom input.
    if (cameraDesired.current) camera.position.add(cameraCorrection.current)
    cameraCorrection.current.set(0, 0, 0)
    // Build these lists after the suspended GLBs have mounted.
    if (!collision.current) collision.current = new SceneCollision(scene, body)
    collision.current.refreshDoor()
    const s = scratch.current
    // Vite may preserve an older scratch ref across hot updates; restore any
    // fields added by a newer controller revision before using the hot loop.
    if (!s.forward || !s.right || !s.move || !s.next || !s.old || !s.origin
      || !s.follow || !s.down || !s.up || !s.ray || !s.ray.ray) {
      scratch.current = {
        forward: new Vector3(), right: new Vector3(), move: new Vector3(),
        next: new Vector3(), old: new Vector3(), origin: new Vector3(), follow: new Vector3(),
        down: new Vector3(0, -1, 0), up: new Vector3(0, 1, 0), ray: new Raycaster(),
      }
    }
    const currentScratch = scratch.current
    currentScratch.old.copy(body.position)
    const k = keys.current
    const x = Number(k.has("KeyD") || k.has("ArrowRight")) - Number(k.has("KeyA") || k.has("ArrowLeft"))
    const z = Number(k.has("KeyW") || k.has("ArrowUp")) - Number(k.has("KeyS") || k.has("ArrowDown"))
    camera.getWorldDirection(currentScratch.forward)
    currentScratch.forward.y = 0
    currentScratch.forward.normalize()
    currentScratch.right.crossVectors(currentScratch.forward, currentScratch.up).normalize()
    currentScratch.move.copy(currentScratch.forward).multiplyScalar(z).addScaledVector(currentScratch.right, x).normalize()
    currentScratch.next.copy(body.position)
    const dt = Math.min(delta, 0.05)
    if (!paused && currentScratch.move.lengthSq() > 0) {
      const step = dt * (k.has("ShiftLeft") || k.has("ShiftRight") ? RUN_SPEED : WALK_SPEED)
      currentScratch.origin.copy(body.position); currentScratch.origin.y += 1
      currentScratch.ray.set(currentScratch.origin, currentScratch.move)
      currentScratch.ray.far = step + 0.32
      if (!collision.current.firstHit(currentScratch.ray, SOLID, 0.28)) currentScratch.next.addScaledVector(currentScratch.move, step)
      body.rotation.y = Math.atan2(currentScratch.move.x, currentScratch.move.z)
    }
    currentScratch.origin.copy(currentScratch.next); currentScratch.origin.y += 0.55
    currentScratch.ray.set(currentScratch.origin, currentScratch.down)
    currentScratch.ray.far = 30
    const ground = collision.current.firstHit(currentScratch.ray, WALKABLE)
    if (ground) {
      currentScratch.next.y = Math.max(ground.point.y + 0.03, body.position.y - 9.8 * dt)
      body.position.copy(currentScratch.next)
    }
    // Door centre in metres, exported from Blender to Y-up.
    const close = Math.hypot(body.position.x + 55, body.position.z - 11.55) < 4
      && Math.abs(body.position.y - 4.85) < 1.5
    if (near.current !== close) { near.current = close; onNearDoor(close) }
    currentScratch.move.subVectors(body.position, currentScratch.old)
    camera.position.add(currentScratch.move)
    currentScratch.follow.copy(body.position); currentScratch.follow.y += 1.25
    orbit.target.lerp(currentScratch.follow, 1 - Math.exp(-delta * 11))
    orbit.update()
    if (!cameraDesired.current) cameraDesired.current = new Vector3()
    cameraDesired.current.copy(camera.position)
    currentScratch.move.subVectors(camera.position, orbit.target)
    const distance = currentScratch.move.length()
    currentScratch.move.normalize()
    currentScratch.ray.set(orbit.target, currentScratch.move)
    currentScratch.ray.far = distance + 0.25
    const obstruction = collision.current.firstHit(currentScratch.ray, CAMERA)
    if (obstruction) {
      camera.position.copy(orbit.target).addScaledVector(currentScratch.move, Math.max(0.15, obstruction.distance - 0.25))
      camera.lookAt(orbit.target)
    }
    cameraCorrection.current.subVectors(cameraDesired.current, camera.position)
  })

  return <group ref={player} name="Noe_Player" position={[-55, 5, 18]}>
    <mesh position={[0, 0.8, 0]}>
      <boxGeometry args={[0.55, 1.25, 0.4]} />
      <meshStandardMaterial color="#b98950" roughness={0.9} />
    </mesh>
    <mesh position={[0, 1.6, 0]}>
      <boxGeometry args={[0.36, 0.36, 0.36]} />
      <meshStandardMaterial color="#dbb68c" roughness={0.9} />
    </mesh>
    <mesh position={[0, 1.6, 0.19]}>
      <boxGeometry args={[0.2, 0.07, 0.04]} />
      <meshStandardMaterial color="#302419" />
    </mesh>
  </group>
}
