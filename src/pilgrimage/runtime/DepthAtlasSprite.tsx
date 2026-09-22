import { useEffect, useMemo } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import * as THREE from "three"
import {
  anchorInCell,
  atlasCell,
  spriteRow,
  type DepthSpriteMetadata,
} from "./depth-atlas"

interface DepthAtlasSpriteProps {
  color: string
  depth: string
  metadata: DepthSpriteMetadata
  phase: number | { current: number }
  heading?: number
  position: readonly [number, number, number]
  scale?: number
  groundNormal?: readonly [number, number, number]
}

const vertexShader = /* glsl */ `
  varying vec2 vSpriteUv;
  varying vec3 vBillboardView;
  varying float vAnchorViewZ;
  varying float vWorldSize;
  varying vec4 vGroundPlane;

  uniform vec2 spriteAnchor;
  uniform float spriteWorldSize;
  uniform vec3 spriteGroundPoint;
  uniform vec3 spriteGroundNormal;

  void main() {
    vSpriteUv = uv;

    vec4 anchorView = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec2 local = position.xy - spriteAnchor;
    vec3 billboardView = anchorView.xyz;
    billboardView.xy += local * spriteWorldSize;

    vec3 viewNormal = normalize(mat3(viewMatrix) * spriteGroundNormal);
    vec3 viewGround = (viewMatrix * vec4(spriteGroundPoint, 1.0)).xyz;

    vBillboardView = billboardView;
    vAnchorViewZ = anchorView.z;
    vWorldSize = spriteWorldSize;
    vGroundPlane = vec4(viewNormal, -dot(viewNormal, viewGround));

    gl_Position = projectionMatrix * vec4(billboardView, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  varying vec2 vSpriteUv;
  varying vec3 vBillboardView;
  varying float vAnchorViewZ;
  varying float vWorldSize;
  varying vec4 vGroundPlane;

  uniform sampler2D spriteColor;
  uniform sampler2D spriteDepth;
  uniform vec2 atlasScale;
  uniform vec2 atlasOffset;

  float projectedDepth(float viewZ) {
    vec4 clip = projectionMatrix * vec4(0.0, 0.0, viewZ, 1.0);
    return clip.z / clip.w * 0.5 + 0.5;
  }

  void main() {
    vec2 atlasUv = atlasOffset + vSpriteUv * atlasScale;
    vec4 color = texture2D(spriteColor, atlasUv);
    if (color.a < 0.5) discard;

    vec3 packed = texture2D(spriteDepth, atlasUv).rgb;
    if (packed.b < 0.5) discard;

    float encoded = (packed.r * 65280.0 + packed.g * 255.0) / 65535.0;
    float offset = (encoded - 0.5) * 2.0;
    float poseViewZ = vAnchorViewZ + offset * vWorldSize;
    float poseDepth = projectedDepth(poseViewZ);

    vec3 ray = normalize(vBillboardView);
    float denominator = dot(vGroundPlane.xyz, ray);
    if (abs(denominator) > 1.0e-5) {
      float distance = -vGroundPlane.w / denominator;
      if (distance > 0.0) {
        float groundViewZ = (ray * distance).z;
        float groundDepth = projectedDepth(groundViewZ);
        poseDepth = min(poseDepth, groundDepth - 1.0e-6);
      }
    }

    gl_FragDepth = clamp(poseDepth, 0.0, 1.0);
    gl_FragColor = color;
  }
`

export function DepthAtlasSprite({
  color,
  depth,
  metadata,
  phase,
  heading = 0,
  position,
  scale = 1,
  groundNormal = [0, 1, 0],
}: DepthAtlasSpriteProps) {
  const [colorTexture, depthTexture] = useLoader(
    THREE.TextureLoader,
    [color, depth],
  )

  useEffect(() => {
    colorTexture.colorSpace = THREE.SRGBColorSpace
    colorTexture.minFilter = colorTexture.magFilter = THREE.NearestFilter
    colorTexture.generateMipmaps = false
    colorTexture.needsUpdate = true

    depthTexture.colorSpace = THREE.NoColorSpace
    depthTexture.minFilter = depthTexture.magFilter = THREE.NearestFilter
    depthTexture.generateMipmaps = false
    depthTexture.needsUpdate = true
  }, [colorTexture, depthTexture])

  const material = useMemo(() => {
    const anchor = anchorInCell(metadata.anchor, metadata.cellSize)
    const value = new THREE.ShaderMaterial({
      uniforms: {
        spriteColor: { value: colorTexture },
        spriteDepth: { value: depthTexture },
        spriteAnchor: { value: new THREE.Vector2(...anchor) },
        spriteWorldSize: { value: metadata.viewSize * scale },
        spriteGroundPoint: { value: new THREE.Vector3(...position) },
        spriteGroundNormal: { value: new THREE.Vector3(...groundNormal).normalize() },
        atlasScale: { value: new THREE.Vector2(1 / metadata.frames, 1 / metadata.directions.length) },
        atlasOffset: { value: new THREE.Vector2() },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: true,
      transparent: false,
      toneMapped: false,
    })
    return value
  }, [
    colorTexture,
    depthTexture,
    metadata.anchor,
    metadata.cellSize,
    metadata.frames,
    metadata.directions.length,
    metadata.viewSize,
    scale,
  ])

  useEffect(() => () => material.dispose(), [material])

  useFrame(({ camera }) => {
    const matrix = camera.matrixWorld.elements
    const cameraYaw = Math.atan2(matrix[8], matrix[10])
    const row = spriteRow(heading, cameraYaw, metadata.directions.length)
    const currentPhase = typeof phase === "number" ? phase : phase.current
    const frame = Math.floor(((currentPhase % 1 + 1) % 1) * metadata.frames)
    const cell = atlasCell(
      frame,
      row,
      metadata.frames,
      metadata.directions.length,
    )

    material.uniforms.spriteWorldSize.value = metadata.viewSize * scale
    material.uniforms.spriteGroundPoint.value.set(...position)
    material.uniforms.spriteGroundNormal.value.set(...groundNormal).normalize()
    material.uniforms.atlasScale.value.set(...cell.scale)
    material.uniforms.atlasOffset.value.set(...cell.offset)
  })

  return (
    <mesh
      position={position as [number, number, number]}
      material={material}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1]} />
    </mesh>
  )
}
