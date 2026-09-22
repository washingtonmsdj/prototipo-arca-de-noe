# Arca modular — versão 1

Arquivos: `arca-construcao-modular-v1.blend`, `arca-modular-v1.glb` e `modulos-construcao-v1.json`.

379 módulos identificados. Seções longitudinais de até 5 m para base, pisos, laterais e cobertura; armações por estação; 128 recintos individuais; acessos e alojamentos agrupados. Os berços temporários são separados do casco. Dimensões gerais de referência: 135 × 22,5 × 13,5 m.

No seletor de cenas do Blender, abrir:

1. `CONSTRUCAO_01_Terreno_Bercos`
2. `CONSTRUCAO_02_Base_Casco`
3. `CONSTRUCAO_03_Armacoes_Piso_Inferior`
4. `CONSTRUCAO_04_Tres_Pavimentos`
5. `CONSTRUCAO_05_Casco_Cobertura`
6. `CONSTRUCAO_06_Interior_Completo`

São cenas cumulativas com geometrias compartilhadas, não seis cópias completas. `KIT_Modular_Arca` contém apenas os módulos, sem terreno, e foi usada para exportar o GLB. Os arquivos anteriores foram preservados.

Cada raiz de módulo possui `module_id`, `stage`, `kind`, `requires`, `construction_state` e `progress`. No GLB, os extras ficam acessíveis como userData; `requires` está serializado como texto JSON. O manifesto externo contém dependências como listas. As âncoras do manifesto usam Z vertical do Blender; no Three.js usar as transformações dos nós GLB convertidas pelo exportador para Y vertical.

Fluxo previsto: verificar dependências, receber materiais, atualizar progresso e exibir geometria concluída. O sistema de jogo ainda não foi implementado. Receitas e tempos não foram inventados: `materials` permanece nulo e `recipe_status` indica que falta balanceamento. O progresso atual é metadado; não gera sozinho animação de montagem.

Pisos preservam os recortes das rampas da blocagem V3. Portões mantêm objetos separados. Recintos conservam destinos no Blender; marcadores e placas não são exportados como objetos jogáveis. Este kit não contém colisores, otimização final, texturas, cálculo estrutural ou validação de capacidade animal. Os recintos continuam sujeitos às limitações do mapa V3. Etapas e dependências são uma proposta de construção para o jogo, não relato documentado da sequência usada por Noé.
