import type { AnimalSpecies } from "./types"

const walk = ["walk"] as const
const herd = ["walk", "trot"] as const
const runner = ["walk", "trot", "canter", "gallop"] as const

export const SPECIES: readonly AnimalSpecies[] = [
  {
    id: "sheep", label: "Ovelha", family: "ovine", color: "#d8d1bb", accent: "#453d34",
    bodyLength: 1.45, bodyHeight: 1.05, bodyWidth: .68, headSize: .34, neckLength: .30, neckPitch: .28, muzzleLength: .24,
    upperLeg: .48, lowerLeg: .50, foreZ: .48, hindZ: -.48, legX: .25, legThickness: .075,
    earLength: .18, earWidth: .075, tailLength: .24, hornStyle: "none", mane: false,
    stride: .72, lift: .16, cadence: 1.0, scale: .85, supportedGaits: herd,
  },
  {
    id: "goat", label: "Cabra", family: "caprine", color: "#aa9477", accent: "#3b3128",
    bodyLength: 1.35, bodyHeight: 1.10, bodyWidth: .58, headSize: .31, neckLength: .38, neckPitch: .18, muzzleLength: .25,
    upperLeg: .52, lowerLeg: .54, foreZ: .45, hindZ: -.45, legX: .22, legThickness: .068,
    earLength: .20, earWidth: .065, tailLength: .21, hornStyle: "horns", mane: false,
    stride: .78, lift: .20, cadence: 1.1, scale: .82, supportedGaits: runner,
  },
  {
    id: "cattle", label: "Bovino", family: "bovine", color: "#7a563f", accent: "#2f241f",
    bodyLength: 1.85, bodyHeight: 1.28, bodyWidth: .82, headSize: .40, neckLength: .42, neckPitch: .10, muzzleLength: .30,
    upperLeg: .58, lowerLeg: .60, foreZ: .62, hindZ: -.62, legX: .31, legThickness: .095,
    earLength: .24, earWidth: .09, tailLength: .56, hornStyle: "horns", mane: false,
    stride: .82, lift: .15, cadence: .78, scale: 1.05, supportedGaits: walk,
  },
  {
    id: "horse", label: "Cavalo", family: "equine", color: "#7a4f31", accent: "#211b18",
    bodyLength: 1.75, bodyHeight: 1.42, bodyWidth: .64, headSize: .34, neckLength: .60, neckPitch: -.10, muzzleLength: .34,
    upperLeg: .70, lowerLeg: .73, foreZ: .58, hindZ: -.58, legX: .24, legThickness: .070,
    earLength: .23, earWidth: .055, tailLength: .65, hornStyle: "none", mane: false,
    stride: 1.05, lift: .24, cadence: 1.05, scale: 1, supportedGaits: runner,
  },
  {
    id: "donkey", label: "Jumento", family: "equine", color: "#746d62", accent: "#262320",
    bodyLength: 1.48, bodyHeight: 1.22, bodyWidth: .60, headSize: .35, neckLength: .46, neckPitch: -.02, muzzleLength: .34,
    upperLeg: .59, lowerLeg: .61, foreZ: .49, hindZ: -.49, legX: .23, legThickness: .072,
    earLength: .36, earWidth: .07, tailLength: .45, hornStyle: "none", mane: false,
    stride: .82, lift: .19, cadence: .92, scale: .92, supportedGaits: herd,
  },
  {
    id: "deer", label: "Cervo", family: "cervid", color: "#8a6747", accent: "#2d241d",
    bodyLength: 1.46, bodyHeight: 1.30, bodyWidth: .50, headSize: .29, neckLength: .55, neckPitch: -.12, muzzleLength: .28,
    upperLeg: .67, lowerLeg: .67, foreZ: .48, hindZ: -.48, legX: .19, legThickness: .058,
    earLength: .26, earWidth: .085, tailLength: .28, hornStyle: "antlers", mane: false,
    stride: .98, lift: .25, cadence: 1.18, scale: .88, supportedGaits: runner,
  },
  {
    id: "boar", label: "Javali", family: "boar", color: "#4e4035", accent: "#1f1b18",
    bodyLength: 1.40, bodyHeight: .88, bodyWidth: .70, headSize: .37, neckLength: .22, neckPitch: .34, muzzleLength: .38,
    upperLeg: .38, lowerLeg: .40, foreZ: .46, hindZ: -.46, legX: .27, legThickness: .085,
    earLength: .16, earWidth: .075, tailLength: .19, hornStyle: "none", mane: false,
    stride: .66, lift: .13, cadence: 1.15, scale: .88, supportedGaits: herd,
  },
  {
    id: "lion", label: "Leão", family: "feline", color: "#b88b4f", accent: "#4a3425",
    bodyLength: 1.62, bodyHeight: 1.10, bodyWidth: .62, headSize: .39, neckLength: .34, neckPitch: .04, muzzleLength: .27,
    upperLeg: .53, lowerLeg: .56, foreZ: .53, hindZ: -.53, legX: .23, legThickness: .080,
    earLength: .13, earWidth: .075, tailLength: .78, hornStyle: "none", mane: true,
    stride: .92, lift: .22, cadence: 1.05, scale: .95, supportedGaits: runner,
  },
]

export const speciesById = (id: string) => SPECIES.find((species) => species.id === id) ?? SPECIES[0]
