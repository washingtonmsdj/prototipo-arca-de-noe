# Sistema de mundo

O mundo atual é inteiramente procedural e determinístico.

## Terreno

`terrainHeight(x, z)` combina ondas amplas, detalhe de frequência média e um vale central. A mesma função é usada pelo mesh visual e pelos animais, evitando duas fontes de verdade.

`terrainSlope(x, z)` estima a derivada local e permite inclinar o rig sobre o solo.

## Ambiente

O protótipo inclui:

- relevo;
- corredor de rio;
- vegetação determinística por seed;
- pares das espécies registradas;
- área central de laboratório.

Nenhum asset externo é necessário.

## Evolução planejada

A geração deve migrar para chunks determinísticos. Biomas, água, navegação e distribuição de fauna deverão consumir a mesma seed e os mesmos contratos de terreno. Não introduzir posições mágicas específicas de um mapa como dependência do sistema de fauna.
