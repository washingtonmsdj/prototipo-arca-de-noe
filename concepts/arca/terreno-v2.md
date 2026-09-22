# Terreno e canteiro — V2

- `arca-terreno-v2.blend`: cena completa com a arca e o cenário revisado; versões anteriores preservadas.
- `terreno-canteiro-v2.glb`: apenas terreno, vegetação, riacho e canteiro; sem a arca. Unidades em metros, conversão glTF para Y vertical feita pelo exportador.
- Área total: 420 × 320 m; 16 setores de 105 × 80 m com limites coincidentes e normais contínuas. Malha base: 43.008 triângulos.
- Clareira preserva arca, oficinas, estoque, abrigos e circulação. Relevo periférico com colinas, depressão de riacho e lâmina de água geométrica.
- 190 árvores, com raízes de objeto identificadas e malhas compartilhadas entre troncos/copas. A conversão para InstancedMesh é futura; compartilhar malha no Blender não implementa instanciamento de desenho automaticamente no Three.js.
- Caminhos de 6 m para transporte, 4 m para serviço e 3 m até a água. Rochas marginais e tocos indicam área desmatada.
- Sem texturas, materiais finais, água simulada, colisões, corte de árvores ou streaming implementados. Cores cinza da viewport são auxiliares e não foram exportadas como materiais.
- Cenário e árvores são escolhas artísticas, não reconstrução comprovada do local ou da flora do relato bíblico.
