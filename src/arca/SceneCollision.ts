import { Box3, InstancedMesh, Matrix4, Mesh, Object3D, Raycaster, Vector3, type Intersection } from "three"

type Entry = { mesh: Mesh; bounds: Box3; mask: number; instanceId?: number }
export const WALKABLE = 1
export const SOLID = 2
export const CAMERA = 4
const CELL = 12

// Static broad-phase grid. Only the animated entrance door needs fresh bounds.
export class SceneCollision {
  private cells = new Map<string, Entry[]>()
  private dynamic: Entry[] = []
  private candidates = new Set<Entry>()
  private point = new Vector3()
  private end = new Vector3()
  private hits: Intersection[] = []
  private expanded = new Box3()

  constructor(scene: Object3D, player: Object3D) {
    scene.updateMatrixWorld(true)
    scene.traverse(object => {
      if (!(object instanceof Mesh) || object.userData.noCollision) return
      let moving = false
      for (let owner: Object3D | null = object; owner; owner = owner.parent) {
        if (owner === player || owner.userData.noCollision) return
        if (owner.name === "PORTA_ARCA_DOBRADICA_ANIMADA") moving = true
      }
      const walk = object.userData.walkable || /Terrain_|Tabua_Rampa_Elevada|Rampa_Animal_4m_Largura|Piso|Pavimento|Patamar|Soleira/i.test(object.name)
      const mask = (walk ? WALKABLE : /Arvore|Copa|Rocha|Grama/i.test(object.name) ? 0 : SOLID)
        | (object.userData.colliderOnly ? 0 : CAMERA)
      if (object instanceof InstancedMesh && (object.userData.individuals || object.userData.colliderBoxes)) {
        // Animal references are boxes: intersect their individual bounds directly.
        object.geometry.computeBoundingBox()
        const matrix = new Matrix4()
        for (let i = 0; i < object.count; i++) {
          object.getMatrixAt(i, matrix)
          matrix.premultiply(object.matrixWorld)
          this.add({ mesh: object, mask, instanceId: i, bounds: object.geometry.boundingBox!.clone().applyMatrix4(matrix) })
        }
      } else {
        const entry = { mesh: object, mask, bounds: new Box3().setFromObject(object) }
        if (moving) this.dynamic.push(entry)
        else this.add(entry)
      }
    })
  }

  private add(entry: Entry) {
    const b = entry.bounds
    if (b.isEmpty()) return
    for (let x = Math.floor(b.min.x / CELL); x <= Math.floor(b.max.x / CELL); x++) {
      for (let z = Math.floor(b.min.z / CELL); z <= Math.floor(b.max.z / CELL); z++) {
        const key = `${x}:${z}`
        const cell = this.cells.get(key)
        if (cell) cell.push(entry)
        else this.cells.set(key, [entry])
      }
    }
  }

  refreshDoor() {
    for (const entry of this.dynamic) {
      entry.mesh.updateWorldMatrix(true, false)
      entry.bounds.setFromObject(entry.mesh)
    }
  }

  firstHit(raycaster: Raycaster, mask: number, bodyRadius = 0): Intersection | undefined {
    const { ray, far } = raycaster
    ray.at(far, this.end)
    this.candidates.clear()
    for (let x = Math.floor((Math.min(ray.origin.x, this.end.x) - bodyRadius) / CELL); x <= Math.floor((Math.max(ray.origin.x, this.end.x) + bodyRadius) / CELL); x++) {
      for (let z = Math.floor((Math.min(ray.origin.z, this.end.z) - bodyRadius) / CELL); z <= Math.floor((Math.max(ray.origin.z, this.end.z) + bodyRadius) / CELL); z++) {
        for (const entry of this.cells.get(`${x}:${z}`) ?? []) this.candidates.add(entry)
      }
    }
    for (const entry of this.dynamic) this.candidates.add(entry)
    this.hits.length = 0
    for (const entry of this.candidates) {
      if (!(entry.mask & mask)) continue
      const bounds = this.expanded.copy(entry.bounds)
      if (entry.instanceId !== undefined && bodyRadius > 0) {
        bounds.min.x -= bodyRadius; bounds.max.x += bodyRadius
        bounds.min.z -= bodyRadius; bounds.max.z += bodyRadius
      }
      const hit = bounds.containsPoint(ray.origin) && entry.instanceId !== undefined
        ? this.point.copy(ray.origin) : ray.intersectBox(bounds, this.point)
      if (!hit || (!bounds.containsPoint(ray.origin) && hit.distanceTo(ray.origin) > far)) continue
      if (entry.instanceId !== undefined) {
        const distance = hit.distanceTo(ray.origin)
        if (distance >= raycaster.near && distance <= far) this.hits.push({ distance, point: hit.clone(), object: entry.mesh, instanceId: entry.instanceId })
      } else entry.mesh.raycast(raycaster, this.hits)
    }
    let closest: Intersection | undefined
    for (const hit of this.hits) if (!closest || hit.distance < closest.distance) closest = hit
    return closest
  }
}
