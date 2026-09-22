# Sistema de geração

## Princípio

Animais, humanos e mundo seguem a regra **dados determinísticos → estrutura coerente → animação/renderização**.

## Animais

- Arca: `AnimalSpecies` + `animalMorphology()` + gait/IK próprios;
- Pilgrimage isolado: anatomia, profiles, gaits e rigs em `src/pilgrimage/wildlife/` e `src/pilgrimage/transport/`.

Novas espécies devem preferir dados quando compartilham família anatômica. Uma anatomia realmente diferente recebe rig próprio.

## Humanos

- Arca: `HumanDesign` e `generatedHuman(seed)`;
- Pilgrimage: `PERSON_PRESETS` → `personRecipe()` → `createBasePersonRig()`.

As implementações permanecem independentes para comparação.

## Mundo

```text
seed
  -> método de woodland
  -> água
  -> floresta/darkwood/clareiras
  -> adaptação para mundo 3D
```

O relevo atual é determinístico e integrado por `terrainHeight`. O próximo port deve trazer elevação/hidrologia completa de forma igualmente isolada.

## Separação upstream

`vendor/pilgrimage/` preserva referência. `src/pilgrimage/` contém somente o runtime técnico necessário.

## Arquitetura-alvo

```text
Definition
  -> deterministic generator
  -> morphology / skeleton
  -> procedural mesh
  -> rig
  -> locomotion / action
  -> runtime LOD
       |-> full 3D
       |-> simplified / instanced
       \-> baked sprite + depth atlas
```

A licença e a procedência do upstream devem permanecer preservadas.
