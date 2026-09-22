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

### Locomoção em mundo

Wildlife e animais de transporte agora podem sair do preview estacionário sem mudar de rig:

- a fase deriva da distância percorrida;
- cada gait wildlife usa a cadência real de `gaitRecipe()`;
- equinos/bovino usam stride e cadência do perfil original;
- uma única pata/hoof de suporte é escolhida por proximidade ao centro da fase de stance;
- `plantFoot()` mantém esse contato em coordenadas de mundo durante curvas;
- não tentamos travar quatro patas simultaneamente, evitando super-restringir o root;
- voo, idle, graze, lie e burrow continuam como ações, não locomoção terrestre do laboratório.

### Editor

`src/dev/AnimalRigEditorPanel.tsx` usa `AnimalRigEdits`: frame, junta, offsets X/Y/Z, raio de influência, cadência e timing dos quatro contatos.

## Humanos — Pilgrimage original

`createBasePersonRig()` é executado diretamente. O laboratório expõe todos os 19 clips de `PERSON_CLIPS` com sua contagem própria de frames.

`src/dev/HumanRigEditorPanel.tsx` usa `PoseEdits`, `setPoseKey`, `clearFrameKeys` e a interpolação circular original.

Os clips locomotores humanos usam fase por distância + foot locking. Mudanças de clip passam por um blend que interpola transforms e a geometria deformável da roupa/cordas; ações com props trocam visibilidade de forma discreta.

## Motor Arca

O motor próprio continua separado. Em movimento, a fase é derivada da distância percorrida para reduzir foot sliding.


## LOD rig 3D ↔ sprite/depth

O laboratório possui três modos de representação para os rigs originais:

- `Rig 3D`;
- `Sprite + depth`;
- `Auto por distância`.

O estado locomotor pertence ao ator, não à representação. Fase, posição, heading, inclinação do terreno e foot/support lock sobrevivem à troca de LOD. O rig e o sprite não ficam montados ao mesmo tempo: o modo sprite desmonta o rig caro em vez de mantê-lo atualizado invisivelmente.

O modo automático usa histerese em torno da distância de troca para impedir alternância quadro a quadro perto do limite.

### Depth em câmera perspectiva

O bake continua ortográfico, mas o runtime Arca usa câmera perspectiva. `DepthAtlasSprite` reconstrói o offset RG16 em espaço de câmera, converte-o novamente para depth usando a matriz de projeção runtime e limita os pixels pelo plano local do terreno.

Isso preserva oclusão com terreno e objetos que usam o depth buffer sem copiar o shader ortográfico do upstream de forma incorreta.

Os atlases de sombra continuam exportados. Assim como no runtime atual do Pilgrimage, eles não são desenhados no mapa; a aparência principal usa surface lighting baked.

## Baker

Os mesmos rigs podem ser convertidos para atlas sem manter uma segunda animação desenhada à mão.

- humanos: frames originais do clip × 8 direções;
- animais: 20 frames × 8 direções;
- color atlas;
- depth atlas RG16;
- shadow atlas;
- metadata de sockets humanos ou juntas animais.

Detalhes em `docs/BAKING_PIPELINE.md`.
