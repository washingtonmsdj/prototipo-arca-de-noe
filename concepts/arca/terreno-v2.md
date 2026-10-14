# Terreno e canteiro — V2

- `arca-exterior-beta-v9-terreno-rochas-v1.blend`: revisão de trabalho baseada na arca exterior v9, com os 44 pontos de rocha substituídos por cinco formas compartilhadas; o original permanece preservado.
- `terreno-canteiro-v3-rochas.glb`: terreno, vegetação, riacho, canteiro e rochas do Blender; sem a arca/rampa. Unidades em metros, conversão glTF para Y vertical feita pelo exportador.
- Área total: 420 × 320 m; 16 setores de 105 × 80 m com limites coincidentes e normais contínuas. Malha base: 43.008 triângulos.
- Clareira preserva arca, oficinas, estoque, abrigos e circulação. Relevo periférico com colinas, depressão de riacho e lâmina de água geométrica.
- 190 árvores. No runtime, os 190 troncos e as 190 copas viram dois `BatchedMesh`; cada copa mantém balanço sutil e seus limites individuais são preservados para colisão da câmera.
- Caminhos de 6 m para transporte, 4 m para serviço e 3 m até a água. Rochas marginais e tocos indicam área desmatada.
- Sem texturas, materiais finais, água simulada, colisões, corte de árvores ou streaming implementados. Cores cinza da viewport são auxiliares e não foram exportadas como materiais.
- O terreno v3 preserva 44 posições autoradas no Blender usando cinco geometrias reutilizadas; o runtime agrupa os blocos grandes em lotes com colisão e gera cascalho leve ao redor sem colisão.
- A rampa de acesso continua no asset da arca (`arca-exterior-runtime-v1.glb`), não no GLB do terreno: esse modelo contém as tábuas e guarda-corpos da rampa e a porta animada.
- `kit-rochas-blender-v1.blend` / `public/assets/arca/kit-rochas-blender-v1.glb`: kit separado com cinco afloramentos e três fragmentos/cascalhos, sem texturas de imagem; usado como biblioteca de formas para o terreno.
- Cenário e árvores são escolhas artísticas, não reconstrução comprovada do local ou da flora do relato bíblico.
