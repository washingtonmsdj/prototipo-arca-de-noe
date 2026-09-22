# Protótipo Arca de Noé

Laboratório técnico de **mundo + fauna + humanos + animação procedural**, combinando desenvolvimento próprio do Arca de Noé com uma importação autorizada do núcleo técnico do Pilgrimage.

O objetivo desta fase é dominar e evoluir geração, rig, animação e bake antes de adicionar gameplay completo e a arca propriamente dita.

## Estado atual

### Mundo procedural

O mundo ativo usa uma porta isolada dos sistemas de geração do Pilgrimage:

- woodland/darkwood/clareiras por seed;
- rios e lagos por seed;
- profundidade de água e direção de fluxo;
- elevação procedural;
- drenagem/hidrologia;
- superfícies de água por altura drenada;
- slopes e cliff masks;
- paredes 3D para desníveis de cliff;
- floresta instanciada;
- loops de caminhada validados contra água, floresta e cliffs;
- laboratório central colocado automaticamente em área seca e passável.

Não usamos mais o antigo rio senoidal nem trajetos ambientes cegos.

### Animais

Há dois motores comparáveis no laboratório.

**Pilgrimage original isolado**:

- wildlife: cervo, ovelha, cabra, coelho, javali, raposa, falcão, pardal, galinhas e galo;
- transporte: jumento, cavalo comum, cavalo nobre e boi;
- anatomia/malha procedural;
- gaits, IK e ações originais;
- editor de rig por frame/junta;
- pelagens dos animais de transporte;
- bake modular por clip com 8 direções, color/depth/shadow e metadata de juntas.

**Arca simplificado**:

- quadrúpede próprio para experimentação;
- morfologia por espécie;
- IK de duas articulações;
- passada sincronizada por distância.

### Humanos

**Pilgrimage original**:

- `createBasePersonRig()` executado diretamente;
- presets originais;
- 19 clips originais;
- editor visual de pose por frame/junta;
- bake por clip em 8 direções;
- saída de color atlas, depth atlas, shadow atlas e metadata com sockets.

**Arca simplificado**:

- perfis próprios e geração por seed;
- clips simples;
- caminhada sincronizada por distância.

### Desenvolvimento

O laboratório permite selecionar motor, espécie/preset, ação, gait, pelagem, velocidade, juntas e frame de edição. Os ajustes de rig/pose usam JSON importável/exportável.

Os bakers são ferramentas separadas do runtime: editar um rig não altera silenciosamente assets publicados.

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
  animals/                 # motor próprio + adaptadores dos animais originais
  humans/                  # motor próprio + adaptador humano original
  dev/                     # editores e painéis de bake
  pilgrimage/
    bake/                  # câmera, ink, depth, iluminação e bakers isolados
    wildlife/              # wildlife original isolado
    transport/             # equinos/bovino originais isolados
    world/                 # woodland, água, elevação e hidrologia isolados
  world/                   # integração/renderização do mundo

vendor/pilgrimage/         # snapshot upstream preservado
docs/                      # arquitetura e documentação técnica
```

## Regra arquitetural

```text
vendor/pilgrimage
        ↓ referência preservada
src/pilgrimage
        ↓ porta mínima do núcleo técnico
src/animals | src/humans | src/world | src/dev
        ↓
laboratório / futuro gameplay
```

População, economia, construções, cart systems e settlement gameplay não entram apenas para satisfazer imports.

Veja `docs/PILGRIMAGE_PORT_STATUS.md` para o inventário exato e `docs/BAKING_PIPELINE.md` para o pipeline de exportação.

## Próximas evoluções

- shoreline/beach e cliff-corner visual do upstream, sem importar gameplay;
- visualização animada de fluxo/cachoeiras usando a hidrologia já calculada;
- sockets/ferramentas no laboratório humano;
- CLI opcional sobre os bakers browser já ativos;
- LOD runtime entre 3D completo, rig simplificado e sprite/depth;
- navegação por rotas quando o gameplay começar.

## Pilgrimage upstream

Origem: `tomjohndesign/pilgrimage`  
Commit de referência: `c5e8c507a4ae4fe925f789793dd463b93821487d`

A licença original está em `vendor/pilgrimage/LICENSE` e a procedência em `vendor/pilgrimage/UPSTREAM.md`.

`vendor/` é referência. Adaptações ativas pertencem a `src/pilgrimage/` ou às camadas próprias do Arca.

Este trabalho é conduzido como projeto não comercial.
