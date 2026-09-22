# Sistema de animação

O laboratório mantém o motor simplificado do Arca e os rigs originais do Pilgrimage lado a lado.

## Animais — Pilgrimage original

### Wildlife

- mamíferos procedurais;
- aves com asa e punho;
- galinhas especializadas;
- gaits por espécie;
- deformação da malha pelo rig;
- idle, graze, lie, burrow, fly e glide quando aplicável.

### Transporte

- cavalo comum/nobre;
- jumento;
- boi;
- pelagens;
- rig quadrúpede original.

### Editor

`src/dev/AnimalRigEditorPanel.tsx` usa `AnimalRigEdits`: frame, junta, offsets X/Y/Z, raio de influência, cadência e timing dos quatro contatos.

## Humanos — Pilgrimage original

`createBasePersonRig()` é executado diretamente. O laboratório expõe todos os 19 clips de `PERSON_CLIPS` com sua contagem própria de frames.

`src/dev/HumanRigEditorPanel.tsx` usa `PoseEdits`, `setPoseKey`, `clearFrameKeys` e a interpolação circular original.

## Motor Arca

O motor próprio continua separado. Em movimento, a fase é derivada da distância percorrida para reduzir foot sliding.

## Baker

Os mesmos rigs podem ser convertidos para atlas sem manter uma segunda animação desenhada à mão.

- humanos: frames originais do clip × 8 direções;
- animais: 20 frames × 8 direções;
- color atlas;
- depth atlas RG16;
- shadow atlas;
- metadata de sockets humanos ou juntas animais.

Detalhes em `docs/BAKING_PIPELINE.md`.
