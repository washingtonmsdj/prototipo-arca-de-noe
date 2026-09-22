# Sistema de animação animal

## Estado atual

O núcleo usa quadrúpedes procedurais. Cada animal compartilha o mesmo contrato, mas possui proporções próprias.

A ordem do cálculo é:

```
velocidade
  -> distância
  -> fase da passada
  -> fase individual de cada pata
  -> alvo do pé
  -> IK de dois elos
  -> pose do corpo
  -> rig visual
```

## Contatos

Cada gait define quatro instantes de contato: dianteira esquerda, dianteira direita, traseira esquerda e traseira direita.

Durante a fase de apoio a pata fica em Y=0 no espaço local do animal. Durante o balanço, uma curva suave leva a pata da parte traseira da passada de volta para a frente e aplica elevação vertical.

## IK

`solveTwoBoneLeg()` recebe quadril, alvo do pé e comprimentos dos dois segmentos. O alvo é limitado ao alcance físico e o joelho é resolvido geometricamente. O comprimento dos ossos não muda.

## Movimento do corpo

`bodyMotion()` deriva bounce, pitch, roll e sway da mesma fase usada pelas patas. Dessa forma o tronco e as pernas permanecem acoplados.

## Próximas extensões

- foot locking em coordenadas globais durante curvas fechadas;
- cadeia de três segmentos para equinos;
- pescoço procedural com dois ou três elos;
- cauda secundária com spring;
- aves com asa, punho e penas;
- répteis;
- blend de idle/graze/lie;
- LOD de animação;
- baker de sprite atlas a partir do mesmo rig.
