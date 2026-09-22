import { BASE_PERSON } from "../../vendor/pilgrimage/lib/game/base-person/pose"

export type Animal = "donkey" | "horse" | "ox"
export const HORSE_VARIANTS = ["common", "noble"] as const
export type HorseVariant = typeof HORSE_VARIANTS[number]

export const TRANSPORT = {
  version: "v26",
  cellSize: 128,
  anchor: [64, 78] as const,
  viewSize: BASE_PERSON.camera.viewSize * 2,
  scale: 0.74 * 128 / 48,
  animalFrames: 20,
  grazeFrames: 12,
  lowerFrames: 6,
} as const

export const RIG_TO_WORLD = TRANSPORT.scale / TRANSPORT.viewSize

export const ANIMAL_PROFILES = {
  ox: { label: "Ox", cyclesPerSecond: 0.62, stride: 0.44, lift: 0.065, legHeight: 1.02, legSpread: 0.31, legZ: 0.55,
    sway: 0.018, bob: 0.008, pitch: 0.01, roll: 0.018, neckNod: 0.025, headNod: 0.022, walkNeckLean: 0.025, spineFlex: 0.01 },
  donkey: { label: "Donkey", cyclesPerSecond: 0.82, stride: 0.23, lift: 0.06, legHeight: 0.87, legSpread: 0.22, legZ: 0.62,
    sway: 0.020, bob: 0.013, pitch: 0.016, roll: 0.024, neckNod: 0.065, headNod: 0.06, walkNeckLean: 0.055, spineFlex: 0.018 },
  common: { label: "Common horse", cyclesPerSecond: 0.95, stride: 0.28, lift: 0.08, legHeight: 1.08, legSpread: 0.235, legZ: 0.75,
    sway: 0.025, bob: 0.016, pitch: 0.018, roll: 0.022, neckNod: 0.075, headNod: 0.06, walkNeckLean: 0.08, spineFlex: 0.022 },
  noble: { label: "Noble horse", cyclesPerSecond: 0.98, stride: 0.36, lift: 0.09, legHeight: 1.23, legSpread: 0.29, legZ: 0.78,
    sway: 0.025, bob: 0.018, pitch: 0.018, roll: 0.022, neckNod: 0.075, headNod: 0.06, walkNeckLean: 0.12, spineFlex: 0.025 },
} as const

export type QuadrupedProfile = {
  [K in Exclude<keyof typeof ANIMAL_PROFILES.donkey, "walkNeckLean" | "spineFlex">]:
    K extends "label" ? string : number
} & { twist?: number; walkNeckLean?: number; spineFlex?: number }

export function quadrupedBody(p: QuadrupedProfile) {
  return {
    ...BASE_PERSON.body,
    ankleHeight: 0.07,
    legOffset: p.legSpread,
    stride: p.stride,
    footLift: p.lift,
    footLength: 0.19,
  }
}

export function animalProfile(kind: Animal, variant: HorseVariant = "common") {
  return ANIMAL_PROFILES[kind === "horse" ? variant : kind]
}
