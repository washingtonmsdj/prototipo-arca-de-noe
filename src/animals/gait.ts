import type { AnimalSpecies, FootSample, GaitDefinition, GaitName, LimbIndex } from "./types"

export const GAITS: Record<GaitName, GaitDefinition> = {
  walk: {
    name: "walk", stance: .68, contacts: [.25, .75, 0, .5],
    reach: 1, lift: 1, cadence: 1, bounce: .025, pitch: .025,
  },
  trot: {
    name: "trot", stance: .52, contacts: [0, .5, .5, 0],
    reach: 1.2, lift: 1.25, cadence: 1.32, bounce: .045, pitch: .018,
  },
  canter: {
    name: "canter", stance: .39, contacts: [.46, .23, .23, 0],
    reach: 1.28, lift: 1.62, cadence: 1.22, bounce: .075, pitch: .05,
  },
  gallop: {
    name: "gallop", stance: .30, contacts: [.49, .61, 0, .13],
    reach: 1.45, lift: 2.05, cadence: 1.62, bounce: .11, pitch: .085,
  },
  hop: {
    name: "hop", stance: .28, contacts: [.45, .49, 0, .02],
    reach: 1.55, lift: 2.2, cadence: 1.45, bounce: .13, pitch: .07,
  },
}

export const wrap01 = (value: number) => ((value % 1) + 1) % 1
const smooth = (t: number) => t * t * (3 - 2 * t)

export function gaitStride(species: AnimalSpecies, gaitName: GaitName) {
  const gait = GAITS[gaitName]
  return species.stride * gait.reach * species.scale
}

export function gaitSpeed(species: AnimalSpecies, gaitName: GaitName, speedScale = 1) {
  const gait = GAITS[gaitName]
  return gaitStride(species, gaitName) * species.cadence * gait.cadence * speedScale
}

export function sampleFoot(species: AnimalSpecies, gaitName: GaitName, phase: number, limb: LimbIndex): FootSample {
  const gait = GAITS[gaitName]
  const p = wrap01(phase - gait.contacts[limb])
  const reach = species.stride * gait.reach * .5
  const lift = species.lift * gait.lift

  if (p < gait.stance) {
    const t = p / gait.stance
    return { z: reach * (1 - 2 * t), y: 0, planted: true }
  }

  const t = (p - gait.stance) / (1 - gait.stance)
  const eased = smooth(t)
  return {
    z: -reach + reach * 2 * eased,
    y: Math.sin(Math.PI * t) ** 2 * lift,
    planted: false,
  }
}

export function bodyMotion(gaitName: GaitName, phase: number) {
  const gait = GAITS[gaitName]
  const cycle = phase * Math.PI * 2
  return {
    y: Math.sin(cycle * 2) * gait.bounce,
    pitch: Math.sin(cycle) * gait.pitch,
    roll: Math.sin(cycle + Math.PI * .5) * gait.pitch * .35,
    sway: Math.sin(cycle) * gait.pitch * .3,
  }
}
