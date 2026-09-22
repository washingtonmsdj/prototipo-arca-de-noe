# Sistema de animação

O laboratório mantém dois motores lado a lado: o motor simplificado do Arca e os rigs originais do Pilgrimage portados para uma camada isolada.

## Animais — Arca

```text
velocidade
  -> distância
  -> fase da passada
  -> fase individual de cada pata
  -> alvo do pé
  -> IK de dois elos
  -> pose do corpo
  -> rig visual
```

A fase em movimento deriva da distância, reduzindo foot sliding quando a velocidade muda.

## Animais — Pilgrimage original

### Wildlife

- mamíferos procedurais;
- aves com asa + punho;
- galinhas com rig especializado;
- gaits por espécie;
- malha deformada pelo próprio rig;
- idle, graze, lie, burrow, fly e glide.

### Transporte

- cavalo comum e nobre;
- jumento;
- boi;
- pelagens;
- rig quadrúpede e pose original.

## Editor animal

`src/dev/AnimalRigEditorPanel.tsx` usa o contrato original de rig edits:

- 20 frames;
- junta selecionável;
- offset X/Y/Z;
- raio de influência;
- cadência;
- timing dos quatro contatos;
- limpar junta/frame;
- reset;
- import/export JSON.

O preview pode congelar exatamente no frame editado.

## Humanos — Pilgrimage original

`createBasePersonRig()` é executado diretamente. O laboratório expõe os 19 clips de `PERSON_CLIPS`, cada um com sua contagem original de frames.

`src/dev/HumanRigEditorPanel.tsx` usa o sistema original de `PoseEdits` e interpolação circular entre keyframes.

## Regra

O rig descreve geometria e pose. Navegação, comportamento, sincronização de deslocamento e LOD pertencem a camadas superiores.
