# Sistema procedural de humanos

## Dois motores

### Arca simplificado

`src/humans/` contém perfis de viajante, pastor, construtor, agricultor e sacerdote, além de `generatedHuman(seed)`, IK de pernas e caminhada por distância.

Clips próprios: `idle`, `walk`, `carry`, `pray`, `build` e `gather`.

### Pilgrimage original

`src/humans/UpstreamHuman.tsx` monta diretamente `createBasePersonRig()` a partir do snapshot upstream.

O laboratório expõe todos os **19 clips originais**:

- `idle`, `walk`, `wearyWalk`;
- `sleeping`, `sitting`;
- `seatedMeal`, `seatedDrink`, `seatedPrayer`;
- `praying`, `drinking`, `drinkingLow`, `preaching`;
- `treeFelling`, `woodcutting`, `building`, `gathering`;
- `carrying`, `hoisting`, `procession`.

Cada clip conserva sua própria quantidade de frames.

## Editor de pose

`src/dev/HumanRigEditorPanel.tsx` permite escolher frame/junta, editar offset X/Y/Z e raio de influência, limpar chaves, resetar e importar/exportar JSON.

As edições usam diretamente `PoseEdits`, `setPoseKey`, `clearFrameKeys` e `validatePoseEdits` do sistema original.

## Juntas editáveis

Cabeça, peito, pelve, ombros, cotovelos, mãos, quadris, joelhos, pés e ponta do cajado são expostos como pontos editáveis.

## Sockets e objetos

Os seis sockets originais (`head`, `back`, `leftHip`, `rightHip`, `leftHand`, `rightHand`) já são visíveis no laboratório.

Attachments de desenvolvimento usam `src/humans/attachments.ts`, compartilhado por:

- preview 3D;
- seleção de socket no laboratório;
- bake color/depth/shadow;
- metadata exportado.

O mesmo objeto e o mesmo socket são usados no runtime e no baker, evitando divergência entre preview e atlas.

## Locomoção original em mundo

O rig original não depende mais apenas de playback temporal no laboratório.

Para os clips locomotores `walk`, `wearyWalk`, `carrying` e `procession`:

- a passada em mundo deriva da distância percorrida;
- a velocidade deriva de stride × cadência;
- o pé de suporte usa o mesmo contato original do Pilgrimage;
- `plantFoot()` mantém o apoio em coordenadas de mundo durante a curva;
- altura e inclinação usam `terrainHeight()` e `terrainSlope()`;
- editar uma pose congela o deslocamento para não misturar ferramentas de edição e simulação.

O laboratório expõe **Mover no mundo** para validar esse caminho sem criar gameplay artificial.

## Transição entre clips

A troca de clip usa um snapshot do estado exibido e um blend curto.

O sistema interpola:

- posição;
- quaternion;
- escala;
- geometria deformável da roupa/robe e cordas.

Props de ação mudam visibilidade de forma discreta no meio da transição. Isso é necessário porque o rig original deforma vértices de roupa dentro de `pose()`; um blend apenas de transforms seria incorreto.

## Próximas evoluções

- roupas/cabelo apropriados ao cenário;
- biblioteca real de ferramentas/objetos além do attachment de teste;
- navegação real quando o gameplay exigir deslocamento entre destinos.
