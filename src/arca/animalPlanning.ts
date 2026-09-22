export type HousingClass =
  | "large_mammal"
  | "herd_mammal"
  | "medium_mammal"
  | "large_bird"
  | "small_bird"
  | "small_mammal"
  | "terrarium"
  | "insectarium"

export interface HousingRule {
  pairOccupancy: number
  groupOccupancy: number
  minPairArea: number
  minGroupArea: number
  minSide: number
  maxPairAspect: number
  maxGroupAspect: number
  wallHeight: number
  label: string
}

const groups: Record<HousingClass, readonly string[]> = {
  large_mammal: `elefantes rinocerontes hipopotamos tapires cavalos asnos zebras camelos bovinos bufalos bisoes iaques girafas alces renas cervos`.split(" "),
  herd_mammal: `ovelhas cabras ibex gazelas orix impala kudu gnus`.split(" "),
  medium_mammal: `gorilas chimpanzes leoes tigres leopardos jaguares pumas guepardos ursos_pardos ursos_negros lobos raposas hienas chacais porcos javalis cangurus vombates capivaras tamanduas babuinos pandas ocapis porcos-formigueiros`.split(" "),
  large_bird: `avestruzes emas aguias cegonhas pelicanos grous abutres garcas cormoroes flamingos pavoes perus gansos pinguins casuares cisnes`.split(" "),
  small_bird: `pombos corvos galinhas perdizes patos marrecos araras cacatuas pica_paus poupas andorinhoes pardais canarios cucos corujas_pequenas rolinhas gralhas codornas faisoes papagaios periquitos tucanos martins_pescadores andorinhas cotovias tentilhoes pintassilgos beija_flores falcoes_pequenos kiwis turacos`.split(" "),
  small_mammal: `coelhos hiraxes marmotas porcos_espinhos porquinhos_da_india gerbos ratos toupeiras texugos mangustos lebres esquilos castores chinchilas hamsters camundongos musaranhos ouricos furoes morcegos macacos preguicas tatus coalas lemures lontras suricatos pangolins`.split(" "),
  terrarium: `jabutis iguanas teius camaleoes escincos pitons viboras crocodilianos sapos salamandras tartarugas_semiaquaticas varanos agamas lagartixas jiboias cobras_nao_peconhentas najas ras pererecas cecilias`.split(" "),
  insectarium: `formigas abelhas vespas cupins besouros borboletas mariposas gafanhotos grilos louva-a-deus bichos-pau baratas aranhas escorpioes centopeias piolhos-de-cobra caracois-terrestres lesmas minhocas`.split(" "),
}

const byAnimal = new Map<string, HousingClass>()
for (const [housingClass, ids] of Object.entries(groups) as [HousingClass, readonly string[]][]) {
  for (const id of ids) {
    if (byAnimal.has(id)) throw new Error(`Classe de alojamento duplicada: ${id}`)
    byAnimal.set(id, housingClass)
  }
}

export const HOUSING_RULES: Record<HousingClass, HousingRule> = {
  large_mammal: {
    pairOccupancy: .34, groupOccupancy: .56,
    minPairArea: 12, minGroupArea: 32, minSide: 1.8,
    maxPairAspect: 3, maxGroupAspect: 4.6,
    wallHeight: 1.75, label: "baia grande",
  },
  herd_mammal: {
    pairOccupancy: .34, groupOccupancy: .47,
    minPairArea: 8, minGroupArea: 22, minSide: 1.6,
    maxPairAspect: 3, maxGroupAspect: 3.5,
    wallHeight: 1.55, label: "baia de rebanho",
  },
  medium_mammal: {
    pairOccupancy: .34, groupOccupancy: .46,
    minPairArea: 4, minGroupArea: 18, minSide: 1.2,
    maxPairAspect: 3, maxGroupAspect: 3.5,
    wallHeight: 1.45, label: "baia média",
  },
  large_bird: {
    pairOccupancy: .26, groupOccupancy: .38,
    minPairArea: 4, minGroupArea: 12, minSide: 1.2,
    maxPairAspect: 3.5, maxGroupAspect: 3.8,
    wallHeight: 2.35, label: "viveiro grande",
  },
  small_bird: {
    pairOccupancy: .16, groupOccupancy: .20,
    minPairArea: 2, minGroupArea: 3.2, minSide: .9,
    maxPairAspect: 3.5, maxGroupAspect: 4,
    wallHeight: 2.2, label: "viveiro compacto",
  },
  small_mammal: {
    pairOccupancy: .30, groupOccupancy: .38,
    minPairArea: 1.2, minGroupArea: 5, minSide: .7,
    maxPairAspect: 3, maxGroupAspect: 3,
    wallHeight: 1.05, label: "recinto pequeno",
  },
  terrarium: {
    pairOccupancy: .32, groupOccupancy: .36,
    minPairArea: .8, minGroupArea: 4, minSide: .6,
    maxPairAspect: 3, maxGroupAspect: 3,
    wallHeight: 1.15, label: "terrário",
  },
  insectarium: {
    pairOccupancy: 1, groupOccupancy: 1,
    minPairArea: .16, minGroupArea: .5, minSide: .35,
    maxPairAspect: 2.5, maxGroupAspect: 2.5,
    wallHeight: .7, label: "insetário",
  },
}

export function housingClassFor(animalId: string): HousingClass {
  const result = byAnimal.get(animalId)
  if (!result) throw new Error(`Animal sem classe de alojamento: ${animalId}`)
  return result
}

export function housingRuleFor(animalId: string) {
  return HOUSING_RULES[housingClassFor(animalId)]
}

export function housingCoverage() {
  return new Set(byAnimal.keys())
}
