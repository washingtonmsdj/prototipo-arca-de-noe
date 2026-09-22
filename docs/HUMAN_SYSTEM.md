# Sistema procedural de humanos

## Objetivo

Humanos usam a mesma filosofia da fauna: primeiro existe um corpo coerente e parametrizado; a animação é derivada desse corpo. O sistema não depende de uma sprite sheet desenhada previamente.

## Pipeline

```
HumanDesign
  -> proporções corporais
  -> rig visual
  -> fase locomotora
  -> alvos dos pés
  -> IK das pernas
  -> pose dos braços/cabeça
  -> ajuste ao terreno
  -> render runtime
```

## Perfis

`src/humans/designs.ts` contém perfis-base como viajante, pastor, construtor, agricultor e sacerdote.

`generatedHuman(seed)` cria variações determinísticas sobre esses perfis. A mesma seed sempre produz as mesmas proporções.

Atualmente variamos:

- altura;
- largura dos ombros;
- largura do quadril;
- passada;
- cadência;
- escala da cabeça.

A evolução deve incluir roupas, cabelos, idade visual, acessórios e paletas sem quebrar o contrato do rig.

## Locomoção

A caminhada usa a distância percorrida como fonte de fase. Cada perna recebe meio ciclo de diferença. O pé alterna entre:

- apoio no chão;
- balanço de retorno.

O alvo é resolvido por IK de dois elos com comprimento fixo.

## Clips

O núcleo atual possui:

- `idle`;
- `walk`;
- `carry`;
- `pray`;
- `build`;
- `gather`.

Clips não devem conter geometria. Eles retornam parâmetros de pose e podem ser substituídos futuramente por um sistema de canais/keyframes sem alterar o renderer.

## Próximos passos

- IK também nos braços;
- sockets de mão, cabeça, cintura e costas;
- ferramenta/objeto seguindo sockets;
- foot locking em mundo;
- editor visual de pose;
- transição/blend entre clips;
- baker de sprites e depth atlas;
- LOD compartilhado com a fauna.
