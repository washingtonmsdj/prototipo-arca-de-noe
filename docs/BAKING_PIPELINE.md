# Pipeline de bake

## Objetivo

Transformar o mesmo rig procedural usado no laboratório em assets 2D reproduzíveis, sem redesenhar animações frame a frame.

## Primitivos portados

`src/pilgrimage/bake/` contém:

- `camera.ts`: câmera ortográfica registrada;
- `iso.ts`: matemática de projeção/luz;
- `lighting.ts`: iluminação de superfície;
- `ink.ts`: pixel ink de humanos/animais;
- `shadow.ts`: sombra projetada;
- `depth.ts`: depth atlas RG16;
- `human-bake.ts`: baker por clip humano;
- `animal-bake.ts`: baker modular por clip animal.

## Humano

Entrada:

- preset/design;
- clip original;
- `PoseEdits` atuais;
- attachment/socket opcional selecionado no laboratório.

Saída:

- `<stem>-color.png`;
- `<stem>-depth.png`;
- `<stem>-shadow.png`;
- `<stem>.json`.

O JSON registra clip, frames, direções, cell size, anchor, padding seguro, depth encoding, design, attachment/socket escolhido e sockets por frame/direção. O attachment entra nos atlases de cor, depth e sombra usando o mesmo factory do preview 3D.

A contagem de frames vem diretamente de `PERSON_CLIPS`; não é forçada para 20.

## Animal

Entrada:

- família `wildlife` ou `transport`;
- espécie/variante/pelagem;
- clip;
- `AnimalRigEdits` atuais.

Saída:

- color PNG;
- depth PNG;
- shadow PNG;
- metadata JSON com juntas projetadas.

O formato Arca é deliberadamente **um atlas por clip**. Não copiamos o grande sheet combinado do `transport/bake.ts`, porque ele inclui carroças, passageiros e outros sistemas fora do escopo atual.

## Depth

`SPRITE_DEPTH_ENCODING = view-offset-rg16-v1`.

Os dois canais armazenam depth relativo à origem do rig. O canal B marca geometria válida. O mesmo crescimento de pixels criado pelo ink recebe o depth do pixel-fonte vizinho.

## Segurança de frame

O baker mede padding em todos os pixels sólidos e rejeita um resultado que ultrapasse a margem mínima de 4 px.

## Estado atual

O bake é acionado pelo laboratório no browser. O CLI/Playwright original permanece apenas como referência em `vendor/pilgrimage/scripts/` e pode ser reimplementado depois como uma camada fina sobre estes bakers, sem duplicar lógica.
