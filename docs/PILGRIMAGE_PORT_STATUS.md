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

1. shoreline/beach/corner terrain visual;
2. waterfalls/foam usando `WaterInfo.motion` e `drop` já calculados;
3. sockets e props humanos no laboratório;
4. CLI fino sobre os bakers browser;
5. LOD sprite/depth em runtime;
6. navegação/rotas apenas quando o gameplay exigir.
