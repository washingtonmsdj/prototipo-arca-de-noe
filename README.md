# Protótipo Arca de Noé

Laboratório técnico de **mundo + fauna + humanos + animação procedural**, criado do zero para este repositório.

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

## Origem e licença de terceiros

Este repositório **não contém código, assets, geradores ou receitas copiados de Pilgrimage**. A licença atual daquele projeto permite cópia e modificação somente para fins não comerciais e inclui explicitamente código, assets e geradores procedurais como material coberto.

Por isso, este projeto reimplementa de forma independente apenas conceitos gerais de computação gráfica, como inverse kinematics, gait procedural, geração paramétrica, animação baseada em distância, LOD e baking.
