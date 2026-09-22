# Sistema de geração

## Princípio

Animais e humanos compartilham uma regra: **dados geram anatomia; anatomia recebe animação**.

Não misture identidade da criatura com lógica de renderização ou comportamento.

## Animais

`AnimalSpecies` contém anatomia, aparência, capacidades locomotoras e características morfológicas.

`animalMorphology()` transforma o perfil em medidas derivadas usadas pelo renderer:

- altura do quadril;
- posição do tronco;
- peito e garupa;
- origem do pescoço;
- posição da cabeça;
- origem da cauda;
- espessura dos membros.

O renderer acrescenta características declarativas:

- tamanho das orelhas;
- comprimento de cauda;
- chifres;
- galhadas;
- juba;
- espessura das pernas.

Gait e IK não conhecem essas características visuais.

## Humanos

`HumanDesign` define o corpo-base.

`generatedHuman(seed)` cria uma variação determinística. O gerador não usa estado global nem aleatoriedade não reproduzível.

## Mundo

O mundo também é determinístico. Terreno e distribuição ambiental devem continuar dirigidos por seed e funções puras sempre que possível.

## Evolução prevista

O objetivo arquitetural é chegar a:

```
Definition
  -> deterministic generator
  -> morphology/skeleton
  -> procedural mesh
  -> rig
  -> locomotion/action
  -> runtime LOD
       |-> full 3D
       |-> simplified instanced rig
       \-> baked sprite/depth atlas
```

## Regra de licenciamento

Este sistema é uma implementação própria. Não importar código, assets, receitas, geradores ou outputs protegidos por licenças incompatíveis. Conceitos gerais de computação gráfica podem ser reimplementados independentemente.
