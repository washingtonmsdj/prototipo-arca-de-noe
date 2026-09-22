import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Group, PerspectiveCamera, Raycaster, Vector3 } from "three"
import { SceneCollision, WALKABLE, SOLID, CAMERA } from "./SceneCollision"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

const WALK_SPEED = 3
const RUN_SPEED = 6

export function NoePlayer({ paused, onInteract, onNearDoor, gallery = false, birds = false }: {
  gallery?: boolean
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
    next: new Vector3(), old: new Vector3(), origin: new Vector3(),
    down: new Vector3(0, -1, 0), up: new Vector3(0, 1, 0), ray: new Raycaster(),
  })

  useEffect(() => {
    const orbit = new OrbitControls(camera, gl.domElement)
    controls.current = orbit
    orbit.enablePan = false
    orbit.minDistance = 2.5
    orbit.maxDistance = 18
    orbit.maxPolarAngle = Math.PI / 2 - 0.08
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
    body.position.set(...(gallery ? [115, 6.03, 19] as const : [-55, 5, 18] as const))
    if (birds) body.position.set(-50, 9.08, 0)
    orbit.target.copy(body.position).add(new Vector3(0, 1.25, 0))
    camera.position.copy(body.position).add(new Vector3(0, 4, 8))
    cameraCorrection.current.set(0, 0, 0)
    cameraDesired.current = null
    keys.current.clear()
    orbit.update()
  }, [gallery, birds, camera])

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
    s.old.copy(body.position)
    const k = keys.current
    const x = Number(k.has("KeyD") || k.has("ArrowRight")) - Number(k.has("KeyA") || k.has("ArrowLeft"))
    const z = Number(k.has("KeyW") || k.has("ArrowUp")) - Number(k.has("KeyS") || k.has("ArrowDown"))
    camera.getWorldDirection(s.forward)
    s.forward.y = 0
    s.forward.normalize()
    s.right.crossVectors(s.forward, s.up).normalize()
    s.move.copy(s.forward).multiplyScalar(z).addScaledVector(s.right, x).normalize()
    s.next.copy(body.position)
    const dt = Math.min(delta, 0.05)
    if (!paused && s.move.lengthSq() > 0) {
      const step = dt * (k.has("ShiftLeft") || k.has("ShiftRight") ? RUN_SPEED : WALK_SPEED)
      s.origin.copy(body.position); s.origin.y += 1
      s.ray.set(s.origin, s.move)
      s.ray.far = step + 0.32
      if (!collision.current.firstHit(s.ray, SOLID, 0.28)) s.next.addScaledVector(s.move, step)
      body.rotation.y = Math.atan2(s.move.x, s.move.z)
    }
    s.origin.copy(s.next); s.origin.y += 0.55
    s.ray.set(s.origin, s.down)
    s.ray.far = 30
    const ground = collision.current.firstHit(s.ray, WALKABLE)
    if (ground) {
      s.next.y = Math.max(ground.point.y + 0.03, body.position.y - 9.8 * dt)
      body.position.copy(s.next)
    }
    // Door centre in metres, exported from Blender to Y-up.
    const close = Math.hypot(body.position.x + 55, body.position.z - 11.55) < 4
      && Math.abs(body.position.y - 4.85) < 1.5
    if (near.current !== close) { near.current = close; onNearDoor(close) }
    s.move.subVectors(body.position, s.old)
    camera.position.add(s.move)
    orbit.target.copy(body.position); orbit.target.y += 1.25
    orbit.update()
    if (!cameraDesired.current) cameraDesired.current = new Vector3()
    cameraDesired.current.copy(camera.position)
    s.move.subVectors(camera.position, orbit.target)
    const distance = s.move.length()
    s.move.normalize()
    s.ray.set(orbit.target, s.move)
    s.ray.far = distance + 0.25
    const obstruction = collision.current.firstHit(s.ray, CAMERA)
    if (obstruction) {
      camera.position.copy(orbit.target).addScaledVector(s.move, Math.max(0.15, obstruction.distance - 0.25))
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
