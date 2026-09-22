import * as THREE from "three"

interface ObjectPose {
  object: THREE.Object3D
  position: THREE.Vector3
  quaternion: THREE.Quaternion
  scale: THREE.Vector3
  visible: boolean
}

interface GeometryPose {
  geometry: THREE.BufferGeometry
  positions: Float32Array
}

export interface HumanPoseSnapshot {
  objects: ObjectPose[]
  geometries: GeometryPose[]
}

const targetQuaternion = new THREE.Quaternion()

function poseDeformedGeometry(object: THREE.Object3D) {
  if (!(object instanceof THREE.Mesh)) return null
  if (
    object.name === "shirt"
    || object.name === "robe"
    || object.name === "sleeveless-dress"
    || object.name.startsWith("rope-tail-")
  ) {
    return object.geometry
  }
  return null
}

/**
 * Capture the actual displayed rig state, including procedural garment drape.
 * The snapshot references the same rig objects but owns all source values.
 */
export function captureHumanPose(root: THREE.Object3D): HumanPoseSnapshot {
  const objects: ObjectPose[] = []
  const geometries = new Map<THREE.BufferGeometry, GeometryPose>()

  root.traverse((object) => {
    objects.push({
      object,
      position: object.position.clone(),
      quaternion: object.quaternion.clone(),
      scale: object.scale.clone(),
      visible: object.visible,
    })

    const geometry = poseDeformedGeometry(object)
    if (!geometry || geometries.has(geometry)) return
    const position = geometry.getAttribute("position")
    if (!(position instanceof THREE.BufferAttribute)) return

    geometries.set(geometry, {
      geometry,
      positions: Float32Array.from(position.array as ArrayLike<number>),
    })
  })

  return { objects, geometries: [...geometries.values()] }
}

const smoothstep = (t: number) => t * t * (3 - 2 * t)

/**
 * Blend a previously captured pose into the rig's current target pose.
 * Call rig.pose(target) immediately before this function on every frame.
 */
export function blendHumanPose(
  snapshot: HumanPoseSnapshot,
  progress: number,
) {
  const t = smoothstep(THREE.MathUtils.clamp(progress, 0, 1))

  for (const source of snapshot.objects) {
    const object = source.object
    const px = object.position.x
    const py = object.position.y
    const pz = object.position.z
    const sx = object.scale.x
    const sy = object.scale.y
    const sz = object.scale.z
    const targetVisible = object.visible
    targetQuaternion.copy(object.quaternion)

    object.position.set(
      THREE.MathUtils.lerp(source.position.x, px, t),
      THREE.MathUtils.lerp(source.position.y, py, t),
      THREE.MathUtils.lerp(source.position.z, pz, t),
    )
    object.scale.set(
      THREE.MathUtils.lerp(source.scale.x, sx, t),
      THREE.MathUtils.lerp(source.scale.y, sy, t),
      THREE.MathUtils.lerp(source.scale.z, sz, t),
    )
    object.quaternion.copy(source.quaternion).slerp(targetQuaternion, t)
    object.visible = t < .5 ? source.visible : targetVisible
  }

  for (const source of snapshot.geometries) {
    const position = source.geometry.getAttribute("position")
    if (!(position instanceof THREE.BufferAttribute)) continue
    const values = position.array as Float32Array

    for (let i = 0; i < values.length; i++) {
      values[i] = THREE.MathUtils.lerp(source.positions[i], values[i], t)
    }

    position.needsUpdate = true
    source.geometry.computeVertexNormals()
  }

  snapshot.objects[0]?.object.updateMatrixWorld(true)
}

export function humanTransitionProgress(elapsed: number, duration: number) {
  return duration <= 0 ? 1 : THREE.MathUtils.clamp(elapsed / duration, 0, 1)
}
