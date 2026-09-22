# Protótipo Arca de Noé

Laboratório técnico de **mundo + fauna + humanos + animação procedural**, combinando desenvolvimento próprio do Arca de Noé com uma importação autorizada do núcleo técnico do Pilgrimage.

O objetivo desta fase é construir um sistema próprio capaz de gerar criaturas e pessoas coerentes, animá-las proceduralmente e testá-las no mesmo mundo antes de adicionar gameplay completo e a arca propriamente dita.

## O que já existe

### Mundo

- terreno 3D procedural;
- rio;
- vegetação determinística;
- distribuição ambiental por seed;
- ajuste de personagens ao declive do terreno.

### Animais

- ovelha, cabra, bovino, cavalo, jumento, cervo, javali e leão;
- anatomia paramétrica por espécie;
- camada separada de morfologia;
- peito, tronco, garupa, pescoço, cabeça, focinho e cauda;
- orelhas parametrizadas;
- chifres, galhadas e juba por perfil;
- walk, trot, canter e gallop conforme capacidade;
- fase derivada da distância percorrida;
- contatos independentes das quatro patas;
- IK de duas articulações;
- bounce, pitch, roll e sway do corpo.

### Humanos

- viajante, pastor, construtor, agricultor e sacerdote;
- gerador determinístico de variações por seed;
- altura, ombros, quadril, passada, cadência e cabeça parametrizados;
- rig procedural de torso, cabeça, braços, mãos, pernas e pés;
- IK nas pernas;
- caminhada sincronizada pela distância;
- clips `idle`, `walk`, `carry`, `pray`, `build` e `gather`;
- pessoas geradas e perfis-base distribuídos no mundo.

### Desenvolvimento

- laboratório central para alternar entre animal e humano;
- seleção de espécie/perfil;
- geração humana por seed;
- seleção de gait/clip;
- velocidade;
- pause/resume;
- visualização de juntas;
- testes automatizados;
- GitHub Actions;
- documentação de arquitetura, animação, mundo, humanos e geração.

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

```
src/
  animals/
    Animal.tsx
    gait.ts
    ik.ts
    morphology.ts
    species.ts
    types.ts

  humans/
    Human.tsx
    designs.ts
    gait.ts
    pose.ts
    types.ts

  world/
    terrain.ts
    World.tsx

docs/
  ARCHITECTURE.md
  ANIMATION_SYSTEM.md
  HUMAN_SYSTEM.md
  GENERATION_SYSTEM.md
  WORLD_SYSTEM.md
  DEVELOPMENT.md
  SPECIES_AUTHORING.md
```

## Arquitetura-alvo

```
Definition
   ↓
deterministic generator
   ↓
morphology / skeleton
   ↓
procedural geometry
   ↓
rig
   ↓
locomotion / actions
   ↓
runtime
   ├── full 3D
   ├── simplified LOD
   └── baked sprite/depth atlas
```

A próxima evolução importante é adicionar **foot locking global, rigs especializados por família, aves, répteis, idle/graze/lie, sockets, ferramentas seguindo as mãos, editor de poses e baker automático de sprites/LOD**.

## Pilgrimage upstream

O repositório contém um snapshot autorizado de partes do Pilgrimage em `vendor/pilgrimage/`.

Origem: `tomjohndesign/pilgrimage`  
Commit de referência: `c5e8c507a4ae4fe925f789793dd463b93821487d`

A licença original está preservada em `vendor/pilgrimage/LICENSE` e a procedência em `vendor/pilgrimage/UPSTREAM.md`.

O diretório `vendor/` preserva a fonte upstream; adaptações usadas pelo runtime ficam separadas. O Arca já reutiliza diretamente a curva de passada `walkFoot()` do upstream nos sistemas humano e animal.

Este trabalho é conduzido como projeto não comercial e, conforme informado pelo responsável pelo repositório Arca de Noé, existe autorização do autor para reutilizar, modificar e desenvolver esse código neste projeto.
