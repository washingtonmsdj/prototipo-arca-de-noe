# Entrada elevada — revisão conceitual V6

Arquivo atual: `arca-exterior-beta-v6-porta-elevada.blend`. Substitui a decisão de soleira baixa da V4. A referência é naval conceitual para jogo, não cálculo estrutural, certificação ou identificação histórica.

Entrada transferida do piso inferior (Z=0,65 m) ao intermediário (Z=4,85 m). Porta de aproximadamente 6 × 3,8 m, animação e trava preservadas. Abertura antiga revestida com tábuas. Patamar liga a entrada ao piso intermediário, antes das baias. Rampa temporária de 40 m de percurso horizontal sobe 5,2 m desde o terreno: aproximadamente 7,41 graus. Rampa e apoios precisam ser retirados/ocultados na etapa de navegação. Acesso dos animais grandes às rampas internas ainda requer conferência dos modelos e trajetórias.

Fundamento: a pressão hidrostática diferencial depende da profundidade abaixo da superfície, p=rho*g*h. Em água doce, 1 m de profundidade equivale a aproximadamente 9,81 kPa. A força deve ser integrada sobre a área submersa, não calculada multiplicando a pressão no fundo pela área inteira. Exemplo hipotético: água em Z=4m, interior seco, porta antiga com largura 6m e soleira Z=.65m: F=0.5*1000*9.81*6*(4-.65)^2 ≈330 kN. Não é o calado real da arca. Elevar a soleira reduz exposição para uma mesma superfície; não garante proteção contra ondas, adernamento ou maior calado.

Formato: retangular compatível com tábuas, montantes e verga; o tamanho foi preservado por causa da circulação e ainda deve ser reduzido se o catálogo permitir. Não se adotou porta circular nem arco ornamental: geometria arredondada isoladamente não assegura resistência. Folha abre para fora e fecha contra apoio interior; reforços e batentes são representação de um caminho de carga, não dimensionamento comprovado. Juntas, dobradiças e trava do modelo não comprovam estanqueidade.

Próximas análises necessárias antes de alegar viabilidade naval:
- Massa de madeira, animais, água e alimentos; centro de gravidade e distribuição longitudinal.
- Volume submerso, calado, borda livre e margem das aberturas sob inclinação e ondas.
- Estabilidade transversal e longitudinal; efeito de água livre nos reservatórios.
- Resistência longitudinal do casco de 135m, ligações das peças e reforços ao redor da grande abertura.
- Compartimentação, drenagem e circulação de ar sem aberturas baixas desprotegidas.
- Capacidade de fechamento e vedação, cargas de ondas e sequência de remoção dos equipamentos do canteiro.

Não foram adicionadas divisórias estanques ou lastro arbitrário: ambos mudariam peso, circulação e capacidade e precisam de cálculo prévio. Arquivos modulares/GLB anteriores ainda têm a entrada antiga e precisam de sincronização quando esta beta for aprovada como referência.

Fontes de princípios físicos/naval modernos, não de equipamento bíblico:
- https://oceanservice.noaa.gov/facts/pressure.html
- https://www.imo.org/en/ourwork/safety/pages/shipdesignandstability-default.aspx
- https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.19%2858%29.pdf
