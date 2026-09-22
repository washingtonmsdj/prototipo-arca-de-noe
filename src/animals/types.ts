export type GaitName = "walk" | "trot" | "canter" | "gallop" | "hop"

export type LimbIndex = 0 | 1 | 2 | 3
export type AnimalFamily = "ovine" | "caprine" | "bovine" | "equine" | "cervid" | "boar" | "feline"
export type HornStyle = "none" | "horns" | "antlers"

export interface AnimalSpecies {
  id: string
  label: string
  family: AnimalFamily
  color: string
  accent: string
  bodyLength: number
  bodyHeight: number
  bodyWidth: number
  headSize: number
  neckLength: number
  neckPitch: number
  muzzleLength: number
  upperLeg: number
  lowerLeg: number
  foreZ: number
  hindZ: number
  legX: number
  legThickness: number
  earLength: number
  earWidth: number
  tailLength: number
  hornStyle: HornStyle
  mane: boolean
  stride: number
  lift: number
  cadence: number
  scale: number
  supportedGaits: readonly GaitName[]
}

export interface GaitDefinition {
  name: GaitName
  stance: number
  contacts: readonly [number, number, number, number]
  reach: number
  lift: number
  cadence: number
  bounce: number
  pitch: number
}

export interface FootSample {
  z: number
  y: number
  planted: boolean
}

export interface Point2 {
  y: number
  z: number
}
