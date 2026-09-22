# Sistema de mundo

## Estado atual

O mundo visível é procedural, determinístico e compartilha a mesma seed entre cobertura, água, elevação e hidrologia.

## Pipeline ativo

```text
WORLD_SEED
   ↓
sampleWoodland()
   ├── grass / forest / darkwood / clearings
   └── water mask
           ↓
generateWater()
   ├── kind
   ├── depth
   ├── river flow headings
   └── point bars
           ↓
generateElevation()
   ├── hills
   ├── ridges
   ├── bank shaping
   └── base heights
           ↓
drainWater()
   ├── surface
   ├── downstream
   ├── drop
   ├── flow
   └── motion: still / flow / waterfall
           ↓
finishElevation()
   ├── shared corners
   ├── slopes
   └── cliff masks
           ↓
Arca 3D
   ├── terrain triangles
   ├── water depth colors
   ├── cliff walls
   ├── forest instances
   ├── safe roaming loops
   └── safe lab site
```

## Camada isolada

- `src/pilgrimage/world/terrain.ts`;
- `src/pilgrimage/world/water.ts`;
- `src/pilgrimage/world/woodland.ts`;
- `src/pilgrimage/world/woodland-details.ts`;
- `src/pilgrimage/world/elevation-core.ts`;
- `src/pilgrimage/world/hydrology.ts`;
- `src/pilgrimage/world/grid-utils.ts`;
- `src/pilgrimage/world/depth-field-core.ts`.

## Integração Arca

- `src/world/terrain.ts`: monta o campo final e expõe amostragem/meshes;
- `src/world/GeneratedEnvironment.tsx`: água e floresta;
- `src/world/World.tsx`: terrain, cliffs, agentes e laboratório.

Configuração atual do laboratório:

- seed `717`;
- região-base `192 × 192`;
- recorte ativo `128 × 128`;
- área 3D `44 × 44` unidades;
- escala vertical separada por `HEIGHT_SCALE`.

## Contato e travessia

`terrainHeight(x,z)` amostra os corners finalizados em terra seca e a superfície drenada em água. `terrainSlope(x,z)` deriva o declive local.

`isWalkable()` rejeita água, cobertura não passável, tiles com cliff e inclinação excessiva. `findWalkableLoop()` escolhe loops determinísticos e reduz o raio quando necessário. `LAB_SITE` procura uma área seca/passável grande o bastante para o laboratório central.

## Ainda não portado

- shoreline diagonal/corner clipping;
- classificação final de praia e refinamentos completos de margens;
- geometria específica de cachoeira/espuma;
- pontes, fords e estradas;
- sistema de rotas e navegação do gameplay.

Esses itens devem entrar como módulos independentes; construções, população e economia não são dependências aceitáveis do gerador físico.
