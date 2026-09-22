# Sistema de mundo

## Estado atual

O mundo é procedural e determinístico. A cobertura visível deriva do gerador isolado do Pilgrimage em vez do antigo rio senoidal e de árvores posicionadas manualmente.

## Pipeline

```text
WORLD_SEED
   ↓
seedingMethodForSeed()
   ↓
sampleWoodland()
   ├── woodland / darkwood / clearings
   └── generateWater()
          ├── rios
          └── lagos
   ↓
adaptação 3D do Arca
   ├── terrainHeight(x,z)
   ├── terrainSlope(x,z)
   ├── mesh de terreno
   ├── mesh de água
   └── instâncias de árvores
```

## Fonte dos dados

- `src/pilgrimage/world/woodland.ts`;
- `src/pilgrimage/world/water.ts`;
- `src/pilgrimage/world/terrain.ts`;
- `src/pilgrimage/world/woodland-details.ts`;
- `src/pilgrimage/world/grid-utils.ts`;
- `src/pilgrimage/world/depth-field-core.ts`.

A integração 3D fica em `src/world/terrain.ts`, `src/world/GeneratedEnvironment.tsx` e `src/world/World.tsx`.

## Escala atual do laboratório

- seed: `717`;
- amostra: `128 × 128` tiles;
- área renderizada: `44 × 44` unidades.

Esses valores são configuração do laboratório, não limite arquitetural.

## Altura e contato

`terrainHeight(x, z)` é a fonte comum para a malha visual e para posicionamento dos rigs. `terrainSlope(x, z)` estima o declive local.

A floresta e a água já vêm do gerador upstream. A elevação atual ainda é uma adaptação determinística isolada; **o pipeline completo de elevation/hydrology/cliffs do Pilgrimage ainda não foi portado**.

## Próxima etapa

Portar de forma independente:

1. `generateElevation`;
2. `finishElevation`;
3. drenagem/hidrologia;
4. margens/profundidade de água;
5. cliffs;
6. rotas somente se forem necessárias.

Construções, economia, população e settlement gameplay não devem entrar como dependência dessa etapa.
