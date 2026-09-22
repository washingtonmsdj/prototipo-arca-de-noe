export type HumanClip = "idle" | "walk" | "carry" | "pray" | "build" | "gather"

export interface HumanDesign {
  id: string
  label: string
  skin: string
  hair: string
  tunic: string
  trousers: string
  accent: string
  height: number
  shoulderWidth: number
  hipWidth: number
  torsoLength: number
  upperArm: number
  lowerArm: number
  upperLeg: number
  lowerLeg: number
  stride: number
  cadence: number
  headScale: number
}

export interface HumanFootSample {
  z: number
  y: number
  planted: boolean
}

export interface HumanPose {
  bodyY: number
  bodyPitch: number
  bodyRoll: number
  leftArm: [number, number]
  rightArm: [number, number]
  headPitch: number
}
