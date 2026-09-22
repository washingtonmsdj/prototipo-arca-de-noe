# Protótipo Arca de Noé

Laboratório técnico de **mundo + fauna + animação procedural**, criado do zero para este repositório.

O objetivo desta fase é dominar o sistema que gera, movimenta e testa animais antes de adicionar gameplay, pessoas ou a arca propriamente dita.

## O que já existe

- mundo 3D procedural com relevo;
- rio e vegetação determinística;
- pares de animais distribuídos pelo mundo;
- ovelha, cabra, bovino, cavalo, jumento, cervo, javali e leão;
- anatomia paramétrica por espécie;
- walk, trot, canter e gallop conforme capacidade da espécie;
- fase da animação derivada da distância percorrida;
- contatos independentes das quatro patas;
- IK de duas articulações;
- bounce, pitch, roll e sway do corpo;
- ajuste ao declive do terreno;
- laboratório central para trocar espécie, gait, velocidade, pausa e visualização das juntas;
- testes automatizados;
- GitHub Actions;
- documentação de arquitetura e desenvolvimento.

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
    Animal.tsx       rig visual e atualização runtime
    gait.ts          passada, contatos e cadência
    ik.ts            solução geométrica das pernas
    species.ts       anatomia e capacidades por espécie
    types.ts         contratos do domínio
  world/
    terrain.ts       fonte de verdade do relevo
    World.tsx        composição do ambiente e fauna

docs/
  ARCHITECTURE.md
  ANIMATION_SYSTEM.md
  WORLD_SYSTEM.md
  DEVELOPMENT.md
  SPECIES_AUTHORING.md
```

## Direção técnica

O projeto não deve depender de animações desenhadas quadro a quadro para sua fundação. Primeiro existe um animal coerente, com anatomia, contatos e movimento; depois poderemos derivar LODs, atlas ou outros formatos do mesmo rig.

A próxima evolução natural é adicionar **foot locking global, rigs especializados para equinos, aves, répteis, idle/graze/lie e um baker de sprites/LOD**.

## Origem e licença de terceiros

Este repositório **não contém código nem assets copiados de Pilgrimage**. A implementação é clean-room e usa apenas conceitos gerais de animação procedural, inverse kinematics, locomoção e geração de mundo. Isso evita incorporar ao projeto código sujeito às restrições de licença daquele repositório.
