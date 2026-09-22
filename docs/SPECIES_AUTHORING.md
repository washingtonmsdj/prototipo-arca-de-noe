# Adicionando espécies

Uma espécie básica é declarada em `src/animals/species.ts`.

Parâmetros principais:

- `bodyLength`, `bodyHeight`, `bodyWidth`;
- `headSize`, `neckLength`, `muzzleLength`;
- `upperLeg`, `lowerLeg`;
- `foreZ`, `hindZ`, `legX`;
- `stride`, `lift`, `cadence`;
- `supportedGaits`.

A primeira regra é manter proporções coerentes antes de alterar a animação. Não compense anatomia ruim com offsets de pose.

Quando uma espécie exigir uma estrutura diferente do quadrúpede atual, crie uma família de rig nova em vez de adicionar condicionais sem fim ao componente genérico.
