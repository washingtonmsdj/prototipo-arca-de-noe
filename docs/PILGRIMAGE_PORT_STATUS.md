# Status do port Pilgrimage → Arca

Referência upstream: `tomjohndesign/pilgrimage@c5e8c507a4ae4fe925f789793dd463b93821487d`.

## Ativo no runtime/laboratório

| Sistema | Estado | Local ativo |
| --- | --- | --- |
| Base person rig | Ativo | `src/humans/UpstreamHuman.tsx` + `vendor/.../base-person` |
| 19 clips humanos | Ativo | `PERSON_CLIPS` |
| Editor humano | Ativo | `src/dev/HumanRigEditorPanel.tsx` |
| Human color/depth/shadow bake | Ativo | `src/pilgrimage/bake/human-bake.ts` |
| Wildlife procedural | Ativo | `src/pilgrimage/wildlife/` |
| Bird/chicken rigs | Ativo | `src/pilgrimage/wildlife/` |
| Horse/donkey/ox rigs | Ativo | `src/pilgrimage/transport/` |
| Editor animal | Ativo | `src/dev/AnimalRigEditorPanel.tsx` |
| Animal color/depth/shadow bake | Ativo | `src/pilgrimage/bake/animal-bake.ts` |
| Woodland | Ativo | `src/pilgrimage/world/woodland.ts` |
| Rivers/lakes/depth | Ativo | `src/pilgrimage/world/water.ts` |
| Elevation | Ativo | `src/pilgrimage/world/elevation-core.ts` |
| Hydrology | Ativo | `src/pilgrimage/world/hydrology.ts` |
| Cliff masks/walls | Ativo | world core + Arca renderer |
| Beaches + diagonal shoreline | Ativo | `src/pilgrimage/world/beaches.ts`, `shoreline.ts` |
| Waterfall turbulence/motion | Ativo | hydrology + `src/world/WaterMotion.tsx` |
| Human sockets + attachments | Ativo | `src/humans/attachments.ts` + lab/baker |
| Human world locomotion + foot lock | Ativo | `src/humans/upstream-motion.ts` |
| Human geometry-aware clip blend | Ativo | `src/humans/pose-transition.ts` |
| Animal world locomotion | Ativo | `src/animals/upstream-motion.ts` |
| Single-support quadruped foot lock | Ativo | `src/animals/upstream-motion.ts` + original components |
| Perspective sprite/depth runtime | Ativo | `src/pilgrimage/runtime/DepthAtlasSprite.tsx` |
| Shared-state rig/sprite LOD | Ativo | `OriginalHumanActor.tsx`, `OriginalAnimalActor.tsx` |
| Automatic LOD hysteresis | Ativo | `src/pilgrimage/runtime/lod.ts` |
| Safe roaming/lab placement | Ativo | `src/world/terrain.ts` |

## Preservado como snapshot, mas não executado diretamente

- componentes React originais de labs/editors;
- scripts Playwright originais de exportação;
- documentação upstream;
- `base-person/bake.ts` completo como referência;
- `transport/bake.ts` completo como referência.

Esses arquivos ficam em `vendor/pilgrimage/` para comparação/procedência. O Arca usa implementações isoladas em `src/pilgrimage/`.

## Deliberadamente fora do port atual

- população/travelers;
- economia;
- construções;
- settlement simulation;
- festas/passengers/merchants;
- carroças e lojas;
- gameplay de estradas e cidades.

Esses módulos não são necessários para gerar/animar animais, pessoas ou o terreno técnico.

## Próximos ports úteis

1. manifest/cache persistente para atlases baked usados fora da sessão do laboratório;
2. profiling de muitos atores com troca automática de LOD;
3. biblioteca real de props/equipamentos;
4. CLI de bake quando houver pipeline persistente de assets para alimentar;
5. pontes/fords quando o gameplay exigir travessia;
6. navegação/rotas apenas quando o gameplay exigir.
