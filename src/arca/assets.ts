export const ARCA_ASSETS = {
  interior: "/assets/arca/arca-interior-runtime-v1.glb",
  arca: "/assets/arca/arca-exterior-runtime-v1.glb",
  terrain: "/assets/arca/terreno-canteiro-v3-rochas.glb",
  terrainRocks: "/assets/arca/kit-rochas-blender-v1.glb",
  terrainTextures: {
    grassAlbedo: "/assets/arca/textures/terrain-pbr/grass-albedo-2k.jpg",
    grassNormal: "/assets/arca/textures/terrain-pbr/grass-normal-gl-1k.jpg",
    grassArm: "/assets/arca/textures/terrain-pbr/grass-arm-1k.jpg",
    mudAlbedo: "/assets/arca/textures/terrain-pbr/mud-albedo-2k.jpg",
    mudNormal: "/assets/arca/textures/terrain-pbr/mud-normal-gl-1k.jpg",
    mudArm: "/assets/arca/textures/terrain-pbr/mud-arm-1k.jpg",
  },
} as const

export const ARCA_SCALE = {
  unit: "metre",
  length: 135,
  width: 22.5,
  height: 13.5,
} as const
