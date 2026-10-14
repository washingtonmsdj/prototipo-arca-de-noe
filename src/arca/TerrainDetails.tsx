import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { useFrame, useLoader, useThree } from "@react-three/fiber"
import {
  BatchedMesh,
  BufferAttribute,
  BufferGeometry,
  Box3,
  Color,
  DoubleSide,
  Euler,
  InstancedMesh,
  Matrix3,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  TextureLoader,
  Vector3,
  type Intersection,
} from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { ARCA_ASSETS } from "./assets"
import { createPbrTerrainMaterial, prepareTerrainTexture, type TerrainPbrMaps } from "./ArcaEnvironment"

interface GroundSurface {
  height: number
  normal: [number, number, number]
}

interface GrassClump extends GroundSurface {
  x: number
  z: number
  scale: number
  rotation: number
  hue: number
}

interface Rock extends GroundSurface {
  x: number
  z: number
  scale: number
  rotation: number
  tilt: number
  hue: number
  shape: number
}

interface BoulderBatch {
  geometry: BufferGeometry
  matrices: Matrix4[]
  anchors: Array<{ x: number; z: number }>
}

interface TreeWindInstance {
  instanceId: number
  position: Vector3
  rotation: Quaternion
  scale: Vector3
  phase: number
}

interface TreeBatch {
  mesh: BatchedMesh
  material: MeshStandardMaterial
  wind: TreeWindInstance[]
}

function seeded(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

const FLAT_SURFACE: GroundSurface = { height: 0, normal: [0, 1, 0] }
const DIRT_PATCHES = [
  [-104, -32, 8.5], [-78, 38, 6.5], [-25, -42, 7],
  [28, 44, 9], [108, 25, 11], [142, -48, 8],
] as const

const ROCK_MESH_NAMES = [
  "Afloramento_01",
  "Bloco_Fendido_02",
  "Rocha_Estratificada_03",
  "Rocha_Alongada_04",
  "Matacao_Angular_05",
  "Fragmento_Rocha_01",
  "Fragmento_Rocha_02",
  "Cascalho_Angular_03",
] as const

function extractRockGeometries(scene: Object3D) {
  scene.updateMatrixWorld(true)
  const meshes = new Map<string, Mesh>()
  scene.traverse(object => {
    if (object instanceof Mesh) meshes.set(object.name, object)
  })

  return ROCK_MESH_NAMES.map(name => {
    const mesh = meshes.get(name)
    if (!mesh) throw new Error(`Malha de rocha ausente no kit Blender: ${name}`)
    const geometry = mesh.geometry.clone()
    geometry.applyMatrix4(mesh.matrixWorld)
    geometry.computeBoundingBox()
    const center = geometry.boundingBox?.getCenter(new Vector3()) ?? new Vector3()
    geometry.translate(-center.x, -center.y, -center.z)
    geometry.computeVertexNormals()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    return geometry
  })
}

function createGroundSampler(meshes: Mesh[]) {
  const raycaster = new Raycaster()
  const origin = new Vector3()
  const down = new Vector3(0, -1, 0)
  const normalMatrix = new Matrix3()
  const hits: Intersection[] = []
  return (x: number, z: number): GroundSurface => {
    origin.set(x, 300, z)
    raycaster.set(origin, down)
    raycaster.far = 1000
    hits.length = 0
    raycaster.intersectObjects(meshes, false, hits)
    const hit = hits[0]
    if (!hit) return FLAT_SURFACE
    const normal = hit.face?.normal.clone() ?? new Vector3(0, 1, 0)
    normal.applyMatrix3(normalMatrix.getNormalMatrix(hit.object.matrixWorld)).normalize()
    if (normal.y < 0) normal.negate()
    return { height: hit.point.y, normal: [normal.x, normal.y, normal.z] }
  }
}

function isClearOfWorksite(x: number, z: number, margin = 0) {
  const hullAndYard = x > -96 - margin && x < 84 + margin && z > -24 - margin && z < 26 + margin
  const accessTrack = x > -115 - margin && x < -42 + margin && Math.abs(z - 11.55) < 11 + margin
  return !hullAndYard && !accessTrack
}

function makeGrass(sampleGround: (x: number, z: number) => GroundSurface) {
  const items: GrassClump[] = []
  for (let index = 0; index < 5400; index++) {
    const x = -205 + seeded(index + 3) * 390
    const z = -145 + seeded(index + 71) * 290
    if (!isClearOfWorksite(x, z, 0)) continue
    items.push({
      x,
      z,
      ...sampleGround(x, z),
      scale: .68 + seeded(index + 101) * .72,
      rotation: seeded(index + 211) * Math.PI * 2,
      hue: seeded(index + 307),
    })
  }
  return items
}

function createGrassClump() {
  const positions: number[] = []
  for (let blade = 0; blade < 5; blade++) {
    const angle = blade * Math.PI / 5
    const height = .32 + (blade % 3) * .075
    const lean = .07 + (blade % 2) * .045
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const point = (x: number, z: number) => [x * cos - z * sin, 0, x * sin + z * cos]
    const left = point(-.035, 0)
    const right = point(.035, 0)
    const tip = point(lean, 0)
    positions.push(
      left[0], left[1], left[2],
      right[0], right[1], right[2],
      tip[0], height, tip[2],
    )
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3))
  geometry.computeVertexNormals()
  return geometry
}

function createMudPatchGeometry(geometry: BufferGeometry, tileMeters: number, scaleX = 1, scaleY = 1) {
  const positions = geometry.getAttribute("position")
  const uv = new Float32Array(positions.count * 2)
  for (let index = 0; index < positions.count; index++) {
    uv[index * 2] = positions.getX(index) * scaleX / tileMeters
    uv[index * 2 + 1] = positions.getY(index) * scaleY / tileMeters
  }
  const attribute = new BufferAttribute(uv, 2)
  geometry.setAttribute("uv", attribute)
  geometry.setAttribute("uv2", attribute.clone())
  return geometry
}

function collectBoulders(scene: Object3D): BoulderBatch[] {
  scene.updateMatrixWorld(true)
  const batches = new Map<string, BoulderBatch>()
  const position = new Vector3()
  scene.traverse(object => {
    if (!(object instanceof Mesh) || !/^Rocha_Boulder_/i.test(object.name)) return
    let batch = batches.get(object.geometry.uuid)
    if (!batch) {
      object.geometry.computeBoundingBox()
      batch = { geometry: object.geometry, matrices: [], anchors: [] }
      batches.set(object.geometry.uuid, batch)
    }
    object.getWorldPosition(position)
    batch.anchors.push({ x: position.x, z: position.z })
    batch.matrices.push(object.matrixWorld.clone())
  })
  return [...batches.values()]
}

function createTreeBatches(scene: Object3D): TreeBatch[] {
  scene.updateMatrixWorld(true)
  const sources = { crown: [] as Mesh[], trunk: [] as Mesh[] }
  scene.traverse(object => {
    if (!(object instanceof Mesh) || !/^TREE_/i.test(object.name)) return
    if (/Copa/i.test(object.name)) sources.crown.push(object)
    else if (/Tronco/i.test(object.name)) sources.trunk.push(object)
  })

  const palettes = {
    crown: ["#486942", "#557447", "#3f603d"],
    trunk: ["#614832", "#6e5036", "#57402e"],
  }
  const batches: TreeBatch[] = []
  for (const category of ["trunk", "crown"] as const) {
    const objects = sources[category]
    if (objects.length === 0) continue
    const firstGeometry = objects[0].geometry
    const vertexCount = objects.reduce((sum, object) => sum + object.geometry.getAttribute("position").count, 0)
    const indexCount = objects.reduce((sum, object) => sum + (object.geometry.getIndex()?.count ?? 0), 0)
    const material = new MeshStandardMaterial({
      name: `Vegetacao_${category}_Batch_Runtime`,
      color: "#ffffff",
      roughness: 1,
      side: DoubleSide,
      vertexColors: Boolean(firstGeometry.getAttribute("color")),
    })
    const mesh = new BatchedMesh(objects.length, vertexCount, indexCount, material)
    mesh.name = category === "crown" ? "Arvores_Copas_Batched" : "Arvores_Troncos_Batched"
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.sortObjects = false
    const wind: TreeWindInstance[] = []
    const collisionBounds: Box3[] = []
    const color = new Color()
    const position = new Vector3()
    const rotation = new Quaternion()
    const scale = new Vector3()

    objects.forEach((object, phase) => {
      const geometry = object.geometry
      geometry.computeBoundingBox()
      const geometryId = mesh.addGeometry(geometry)
      const instanceId = mesh.addInstance(geometryId)
      mesh.setMatrixAt(instanceId, object.matrixWorld)
      const treeIndex = Number(object.name.match(/TREE_(\d+)/i)?.[1] ?? 0)
      color.set(palettes[category][treeIndex % palettes[category].length])
      mesh.setColorAt(instanceId, color)

      if (geometry.boundingBox) collisionBounds.push(geometry.boundingBox.clone().applyMatrix4(object.matrixWorld).expandByScalar(.12))
      if (category === "crown") {
        object.matrixWorld.decompose(position, rotation, scale)
        wind.push({
          instanceId,
          position: position.clone(),
          rotation: rotation.clone(),
          scale: scale.clone(),
          phase: phase * .73,
        })
      }
    })

    mesh.computeBoundingBox()
    mesh.boundingBox?.expandByScalar(.16)
    mesh.computeBoundingSphere()
    mesh.userData.colliderBoxes = true
    mesh.userData.collisionBounds = collisionBounds
    batches.push({ mesh, material, wind })
  }
  return batches
}

function makeRubble(anchors: Array<{ x: number; z: number }>, sampleGround: (x: number, z: number) => GroundSurface) {
  const rocks: Rock[] = []
  anchors.forEach((anchor, cluster) => {
    const fragmentCount = 2 + Math.floor(seeded(cluster + 2203) * 3)
    for (let fragment = 0; fragment < fragmentCount; fragment++) {
      const seed = cluster * 7 + fragment
      const angle = seeded(seed + 2309) * Math.PI * 2
      const distance = .72 + seeded(seed + 2411) * 1.75
      const x = anchor.x + Math.cos(angle) * distance
      const z = anchor.z + Math.sin(angle) * distance
      if (!isClearOfWorksite(x, z, 0)) continue
      const surface = sampleGround(x, z)
      rocks.push({
        x,
        z,
        ...surface,
        scale: .22 + seeded(seed + 2503) * .5,
        rotation: seeded(seed + 2609) * Math.PI * 2,
        tilt: (seeded(seed + 2707) - .5) * .3,
        hue: seeded(seed + 2801),
        shape: Math.floor(seeded(seed + 2903) * 3),
      })
    }
  })
  return rocks
}

function useSurfaceTransform() {
  return useMemo(() => ({
    object: new Object3D(),
    up: new Vector3(0, 1, 0),
    normal: new Vector3(),
    align: new Quaternion(),
    spin: new Quaternion(),
    lean: new Quaternion(),
    axis: new Vector3(),
  }), [])
}

export function TerrainDetails({ paused = false }: { paused?: boolean }) {
  const { gl } = useThree()
  const gltf = useLoader(GLTFLoader, ARCA_ASSETS.terrain)
  const rockGltf = useLoader(GLTFLoader, ARCA_ASSETS.terrainRocks)
  const mudTextureUrls = useMemo(() => [
    ARCA_ASSETS.terrainTextures.mudAlbedo,
    ARCA_ASSETS.terrainTextures.mudNormal,
    ARCA_ASSETS.terrainTextures.mudArm,
  ], [])
  const mudTextures = useLoader(TextureLoader, mudTextureUrls)
  const grassRef = useRef<InstancedMesh>(null)
  const grassTime = useMemo(() => ({ value: 0 }), [])
  const boulderRefs = useRef<Array<InstancedMesh | null>>([])
  const rubbleRefs = useRef<Array<InstancedMesh | null>>([])
  const windScratch = useMemo(() => ({
    euler: new Euler(),
    sway: new Quaternion(),
    rotation: new Quaternion(),
    matrix: new Matrix4(),
  }), [])
  const terrainMeshes = useMemo(() => {
    gltf.scene.updateMatrixWorld(true)
    const meshes: Mesh[] = []
    gltf.scene.traverse(object => {
      if (object instanceof Mesh && /^Terrain_/i.test(object.name)) meshes.push(object)
    })
    return meshes
  }, [gltf.scene])
  const surfaceAt = useMemo(() => createGroundSampler(terrainMeshes), [terrainMeshes])
  const grass = useMemo(() => makeGrass(surfaceAt), [surfaceAt])
  const boulderBatches = useMemo(() => collectBoulders(gltf.scene), [gltf.scene])
  const boulderAnchors = useMemo(() => boulderBatches.flatMap(batch => batch.anchors), [boulderBatches])
  const rubble = useMemo(() => makeRubble(boulderAnchors, surfaceAt), [boulderAnchors, surfaceAt])
  const treeBatches = useMemo(() => createTreeBatches(gltf.scene), [gltf.scene])
  const rockGeometries = useMemo(() => extractRockGeometries(rockGltf.scene), [rockGltf.scene])
  const grassGeometry = useMemo(createGrassClump, [])
  const grassMaterial = useMemo(() => {
    const material = new MeshStandardMaterial({
      name: "Grama_Instanciada_Vento_Runtime",
      roughness: .96,
      vertexColors: true,
      side: DoubleSide,
    })
    material.onBeforeCompile = shader => {
      shader.uniforms.terrainWindTime = grassTime
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float terrainWindTime;")
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          float grassFlex = clamp(position.y * 2.0, 0.0, 1.0);
          float grassPhase = position.x * 7.0 + position.z * 9.0;
#ifdef USE_INSTANCING
          grassPhase += dot(instanceMatrix[3].xz, vec2(.17, .23));
#endif
          float grassSway = sin(terrainWindTime * 1.15 + grassPhase) * .10
            + sin(terrainWindTime * .63 + grassPhase * 1.7) * .04;
          transformed.x += grassSway * grassFlex;
          transformed.z += cos(terrainWindTime * .78 + grassPhase) * .055 * grassFlex;`,
        )
    }
    material.customProgramCacheKey = () => "grass-wind-v1"
    return material
  }, [grassTime])
  const dirtMaps = useMemo(() => {
    const anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 8)
    mudTextures.forEach((texture, index) => prepareTerrainTexture(texture, index === 0, anisotropy))
    return { albedo: mudTextures[0], normal: mudTextures[1], arm: mudTextures[2] } satisfies TerrainPbrMaps
  }, [gl, mudTextures])
  const dirtMaterial = useMemo(() => createPbrTerrainMaterial("Terra_Detalhe_PBR_Runtime", dirtMaps), [dirtMaps])
  const dirtGeometries = useMemo(() => DIRT_PATCHES.map(([, , radius]) =>
    createMudPatchGeometry(new CircleGeometry(radius, 28), 1.3, 1.5, .5),
  ), [])
  const workPathGeometry = useMemo(() =>
    createMudPatchGeometry(new PlaneGeometry(48, 7, 1, 1), 1.3, 1, .72),
  [])
  const transform = useSurfaceTransform()

  useEffect(() => () => {
    grassGeometry.dispose()
    grassMaterial.dispose()
    rockGeometries.forEach(geometry => geometry.dispose())
    dirtMaterial.dispose()
    dirtGeometries.forEach(geometry => geometry.dispose())
    workPathGeometry.dispose()
    treeBatches.forEach(({ mesh, material }) => {
      mesh.dispose()
      material.dispose()
    })
  }, [dirtGeometries, dirtMaterial, grassGeometry, grassMaterial, rockGeometries, treeBatches, workPathGeometry])

  useFrame((_, delta) => {
    if (paused) return
    grassTime.value += Math.min(delta, .05)
    const time = grassTime.value
    const { euler, sway, rotation, matrix } = windScratch
    treeBatches.forEach(batch => batch.wind.forEach(instance => {
      const gust = Math.sin(time * .42 + instance.phase) * .012
      euler.set(gust * .55, 0, gust)
      sway.setFromEuler(euler)
      rotation.copy(instance.rotation).multiply(sway)
      matrix.compose(instance.position, rotation, instance.scale)
      batch.mesh.setMatrixAt(instance.instanceId, matrix)
    }))
  })

  useLayoutEffect(() => {
    if (!grassRef.current) return
    const { object, up, normal, align, spin } = transform
    const color = new Color()
    grass.forEach((clump, index) => {
      normal.set(...clump.normal).normalize()
      align.setFromUnitVectors(up, normal)
      spin.setFromAxisAngle(normal, clump.rotation)
      object.position.set(clump.x, clump.height, clump.z).addScaledVector(normal, .006)
      object.quaternion.copy(align).multiply(spin)
      object.scale.setScalar(clump.scale)
      object.updateMatrix()
      grassRef.current!.setMatrixAt(index, object.matrix)
      color.setHSL(.24 + clump.hue * .06, .28 + clump.hue * .16, .22 + clump.hue * .12)
      grassRef.current!.setColorAt(index, color)
    })
    grassRef.current.instanceMatrix.needsUpdate = true
    if (grassRef.current.instanceColor) grassRef.current.instanceColor.needsUpdate = true
  }, [grass, transform])

  useLayoutEffect(() => {
    const { object, up, normal, align, spin, lean, axis } = transform
    const color = new Color()
    boulderBatches.forEach((batch, index) => {
      const mesh = boulderRefs.current[index]
      if (!mesh) return
      batch.matrices.forEach((matrix, instance) => {
        mesh.setMatrixAt(instance, matrix)
        color.setHSL(.105 + (instance % 4) * .006, .055, .86 + (instance % 3) * .025)
        mesh.setColorAt(instance, color)
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    })
    for (let shape = 0; shape < 3; shape++) {
      const mesh = rubbleRefs.current[shape]
      if (!mesh) continue
      rubble.filter(rock => rock.shape === shape).forEach((rock, index) => {
        normal.set(...rock.normal).normalize()
        align.setFromUnitVectors(up, normal)
        spin.setFromAxisAngle(normal, rock.rotation)
        axis.set(1, 0, 0)
        lean.setFromAxisAngle(axis, rock.tilt)
        object.position.set(rock.x, rock.height, rock.z).addScaledVector(normal, rock.scale * .12)
        object.quaternion.copy(align).multiply(spin).multiply(lean)
        object.scale.setScalar(rock.scale)
        object.updateMatrix()
        mesh.setMatrixAt(index, object.matrix)
        color.setHSL(.075 + rock.hue * .035, .055 + rock.hue * .045, .82 + rock.hue * .12)
        mesh.setColorAt(index, color)
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
  }, [boulderBatches, rubble, transform])

  return <group name="Detalhes_Terreno_Runtime">
    {treeBatches.map(({ mesh }) => <primitive key={mesh.uuid} object={mesh} dispose={null} />)}
    <instancedMesh
      ref={grassRef}
      args={[grassGeometry, undefined, grass.length]}
      receiveShadow
      name="Tufos_Grama_Instanciados"
      userData={{ noCollision: true }}
    >
      <primitive object={grassMaterial} attach="material" />
    </instancedMesh>
    {boulderBatches.map((batch, index) => <instancedMesh
      key={`blender-boulder-${index}`}
      ref={mesh => { boulderRefs.current[index] = mesh }}
      args={[batch.geometry, undefined, batch.matrices.length]}
      castShadow
      receiveShadow
      name={`Rocha_Boulder_Blender_${index + 1}`}
      userData={{ colliderBoxes: true, solidCollider: true }}
    >
      <meshStandardMaterial roughness={.97} vertexColors flatShading color="#ffffff" />
    </instancedMesh>)}
    {rockGeometries.slice(5).map((geometry, shape) => {
      const rubbleCount = rubble.filter(rock => rock.shape === shape).length
      return rubbleCount > 0 && <instancedMesh
          key={`debris-${shape}`}
          ref={mesh => { rubbleRefs.current[shape] = mesh }}
          args={[geometry, undefined, rubbleCount]}
          castShadow
          receiveShadow
          name={`Rocha_Fragmento_Blender_${shape + 1}`}
          userData={{ noCollision: true }}
        >
          <meshStandardMaterial roughness={.98} vertexColors flatShading />
        </instancedMesh>
    })}
    <group userData={{ noCollision: true }}>
      {DIRT_PATCHES.map(([x, z], index) => <mesh
        key={index}
        position={[x, .035, z]}
        rotation={[-Math.PI / 2, 0, seeded(index + 421) * Math.PI]}
        scale={[1.5, 1, .5]}
        geometry={dirtGeometries[index]}
        material={dirtMaterial}
      />)}
      <mesh
        position={[-82, .04, 11.55]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1, .72, 1]}
        geometry={workPathGeometry}
        material={dirtMaterial}
      />
    </group>
  </group>
}
