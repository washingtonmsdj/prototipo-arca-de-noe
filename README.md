# Protótipo Arca de Noé

Laboratório técnico de **mundo + fauna + humanos + animação procedural**, combinando desenvolvimento próprio do Arca de Noé com uma importação autorizada do núcleo técnico do Pilgrimage.

O objetivo desta fase é dominar e evoluir os sistemas de geração, rig e animação antes de adicionar gameplay completo e a arca propriamente dita.

## Estado atual

### Mundo

O mundo visível já não usa o rio senoidal e a floresta espalhada manualmente da primeira versão.

Hoje o runtime usa uma camada isolada do gerador do Pilgrimage:

- `src/pilgrimage/world/woodland.ts`: floresta, darkwood, clareiras e saplings;
- `src/pilgrimage/world/water.ts`: rios e lagos por seed;
- `src/pilgrimage/world/terrain.ts`: vocabulário de terreno;
- `src/world/terrain.ts`: adaptação Arca para coordenadas 3D, relevo, altura e slope;
- `src/world/GeneratedEnvironment.tsx`: água e floresta instanciada a partir dos dados gerados.

A mesma API `terrainHeight(x, z)` é consumida pelos rigs para contato com o terreno.

### Animais

O laboratório possui **dois motores selecionáveis**.

**Pilgrimage original, isolado:**

- wildlife: cervo, ovelha, cabra, coelho, javali, raposa, falcão, pardal, galinhas e galo;
- transporte: jumento, cavalo comum, cavalo nobre e boi;
- anatomia/malha procedural;
- IK e gaits por espécie;
- walk, trot, canter, gallop, hop e leap quando aplicável;
- idle, graze, lie, burrow, fly e glide;
- pelagens originais para equinos/bovino;
- visualização de juntas;
- editor de rig por frame/junta, com offsets, influência, cadência e timing de contato;
- import/export JSON.

**Arca simplificado:**

- quadrúpede próprio para experimentação;
- morfologia por espécie;
- fase locomotora sincronizada pela distância;
- IK de dois elos;
- comparação direta com o motor original.

### Humanos

Também existem dois motores independentes.

**Pilgrimage original:**

- rig paramétrico original;
- presets originais;
- **19 clips originais**, com sua contagem própria de frames;
- editor visual de pose por frame/junta;
- offsets X/Y/Z com interpolação local;
- import/export JSON;
- juntas visíveis no laboratório.

**Arca simplificado:**

- viajante, pastor, construtor, agricultor e sacerdote;
- variações determinísticas por seed;
- clips `idle`, `walk`, `carry`, `pray`, `build` e `gather`;
- caminhada sincronizada pela distância.

### Desenvolvimento

O laboratório permite alternar entre humano/animal e entre **Pilgrimage original** e **Arca simplificado**, selecionar espécie/preset/gait/clip/pelagem, pausar, controlar velocidade, visualizar juntas, congelar frames e editar rigs/poses.

A CI executa typecheck, testes e build.

## Executar

```bash
npm install
npm run dev
```

Validação completa:

```bash
npm run typecheck
npm test
npm run build
```

## Organização

```text
src/
  animals/                 # motor animal próprio + previews
  humans/                  # motor humano próprio + adaptador original
  dev/                     # editores de rig/pose
  pilgrimage/
    wildlife/              # fauna original isolada
    transport/             # cavalo/jumento/boi originais
    world/                 # woodland/água/terreno isolados
  world/                   # integração e renderização do mundo

vendor/pilgrimage/         # snapshot upstream preservado
docs/                      # arquitetura e sistemas
```

## Regra arquitetural

```text
vendor/pilgrimage
        ↓ referência preservada
src/pilgrimage
        ↓ porta mínima do runtime técnico
src/animals | src/humans | src/world | src/dev
        ↓
laboratório / futuro gameplay
```

Não importamos população, economia, construções ou simulação do Pilgrimage apenas para fazer um rig ou o mundo funcionar. Dependências acidentais são cortadas em `src/pilgrimage/`.

## Próximas evoluções

- portar a elevação/hidrologia completa sem trazer gameplay;
- foot locking global para o runtime original em deslocamento;
- ferramentas e objetos seguindo sockets humanos;
- baker automático de sprites + depth atlas;
- LOD compartilhado entre 3D completo, rig simplificado e sprite;
- perfis adicionais apropriados ao cenário da Arca.

## Pilgrimage upstream

O snapshot utilizado fica em `vendor/pilgrimage/`.

Origem: `tomjohndesign/pilgrimage`  
Commit de referência: `c5e8c507a4ae4fe925f789793dd463b93821487d`

A licença original está preservada em `vendor/pilgrimage/LICENSE` e a procedência em `vendor/pilgrimage/UPSTREAM.md`.

`vendor/` é referência upstream. Adaptações ativas pertencem a `src/pilgrimage/` ou às camadas próprias do Arca.

Este trabalho é conduzido como projeto não comercial.
