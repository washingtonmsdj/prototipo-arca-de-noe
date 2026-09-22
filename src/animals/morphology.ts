import type { AnimalSpecies } from "./types"

export interface AnimalMorphology {
  baseHipHeight: number
  bodyY: number
  headY: number
  headZ: number
  chestZ: number
  rumpZ: number
  neckBaseY: number
  neckBaseZ: number
  tailBaseY: number
  tailBaseZ: number
  boneRadius: number
  chestScale: [number, number, number]
  torsoScale: [number, number, number]
  rumpScale: [number, number, number]
}

export function animalMorphology(species: AnimalSpecies): AnimalMorphology {
  const baseHipHeight = species.upperLeg + species.lowerLeg - .08
  const bodyY = baseHipHeight + species.bodyHeight * .38
  const neckBaseY = bodyY + species.bodyHeight * .10
  const neckBaseZ = species.foreZ + species.bodyLength * .16
  const headY = neckBaseY + species.neckLength * .42 - Math.sin(species.neckPitch) * species.neckLength * .70
  const headZ = neckBaseZ + Math.cos(species.neckPitch) * species.neckLength
  const tailBaseY = bodyY + species.bodyHeight * .06
  const tailBaseZ = species.hindZ - species.bodyLength * .20

  return {
    baseHipHeight,
    bodyY,
    headY,
    headZ,
    chestZ: species.bodyLength * .18,
    rumpZ: -species.bodyLength * .22,
    neckBaseY,
    neckBaseZ,
    tailBaseY,
    tailBaseZ,
    boneRadius: Math.max(.032, species.legThickness),
    chestScale: [species.bodyWidth * .96, species.bodyHeight * .44, species.bodyLength * .34],
    torsoScale: [species.bodyWidth, species.bodyHeight * .40, species.bodyLength * .42],
    rumpScale: [species.bodyWidth * 1.02, species.bodyHeight * .42, species.bodyLength * .34],
  }
}
