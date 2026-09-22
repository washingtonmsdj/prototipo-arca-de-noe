export type GaitName = "walk" | "trot" | "canter" | "gallop" | "hop"

export type LimbIndex = 0 | 1 | 2 | 3

export interface AnimalSpecies {
  id: string
  label: string
  color: string
  accent: string
  bodyLength: number
  bodyHeight: number
  bodyWidth: number
  headSize: number
  neckLength: number
  muzzleLength: number
  upperLeg: number
  lowerLeg: number
  foreZ: number
  hindZ: number
  legX: number
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
