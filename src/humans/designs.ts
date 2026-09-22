import type { HumanDesign } from "./types"

export const HUMAN_DESIGNS: readonly HumanDesign[] = [
  {
    id: "traveler", label: "Viajante", skin: "#b98262", hair: "#3d2b21", tunic: "#66725b", trousers: "#51483d", accent: "#9f8359",
    height: 1, shoulderWidth: .38, hipWidth: .28, torsoLength: .58,
    upperArm: .34, lowerArm: .31, upperLeg: .45, lowerLeg: .46, stride: .58, cadence: 1.08, headScale: 1,
  },
  {
    id: "shepherd", label: "Pastor", skin: "#9c684d", hair: "#2b211c", tunic: "#8b7657", trousers: "#4a4339", accent: "#6c5037",
    height: 1.03, shoulderWidth: .40, hipWidth: .29, torsoLength: .60,
    upperArm: .35, lowerArm: .32, upperLeg: .47, lowerLeg: .47, stride: .60, cadence: 1.02, headScale: 1.02,
  },
  {
    id: "builder", label: "Construtor", skin: "#c18c6a", hair: "#49362b", tunic: "#7c6652", trousers: "#423b35", accent: "#b3915d",
    height: 1.06, shoulderWidth: .43, hipWidth: .30, torsoLength: .61,
    upperArm: .36, lowerArm: .33, upperLeg: .48, lowerLeg: .48, stride: .62, cadence: 1.0, headScale: .98,
  },
  {
    id: "farmer", label: "Agricultor", skin: "#ad7558", hair: "#5c4230", tunic: "#6d7b4d", trousers: "#544b39", accent: "#c1a066",
    height: .98, shoulderWidth: .39, hipWidth: .31, torsoLength: .57,
    upperArm: .33, lowerArm: .31, upperLeg: .44, lowerLeg: .45, stride: .56, cadence: 1.04, headScale: 1.03,
  },
  {
    id: "priest", label: "Sacerdote", skin: "#b77e5d", hair: "#4a3528", tunic: "#d0c3a5", trousers: "#6b6254", accent: "#8f7450",
    height: 1.02, shoulderWidth: .37, hipWidth: .29, torsoLength: .62,
    upperArm: .35, lowerArm: .32, upperLeg: .46, lowerLeg: .46, stride: .57, cadence: .96, headScale: 1,
  },
]

export const humanById = (id: string) => HUMAN_DESIGNS.find((design) => design.id === id) ?? HUMAN_DESIGNS[0]

export function generatedHuman(seed: number): HumanDesign {
  const base = HUMAN_DESIGNS[Math.abs(seed) % HUMAN_DESIGNS.length]
  const n = (salt: number) => {
    const x = Math.sin((seed + 1) * (salt + 11) * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }
  return {
    ...base,
    id: `generated-${seed}`,
    label: `Gerado ${seed}`,
    height: base.height * (.94 + n(1) * .12),
    shoulderWidth: base.shoulderWidth * (.92 + n(2) * .16),
    hipWidth: base.hipWidth * (.92 + n(3) * .16),
    stride: base.stride * (.94 + n(4) * .12),
    cadence: base.cadence * (.94 + n(5) * .12),
    headScale: base.headScale * (.94 + n(6) * .12),
  }
}
