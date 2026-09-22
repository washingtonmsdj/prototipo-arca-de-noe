# Arca — mapa e critérios da versão 3

Arquivo principal: [arca-recintos-v3.blend](arca-recintos-v3.blend). Catálogo: [catalogo-recintos-v3.json](catalogo-recintos-v3.json). Substitui a V2 como referência de distribuição; versões anteriores preservadas.

## O que mudou

- Mantidos 135 × 22,5 × 13,5 m, três pisos, 128 grupos editoriais e 952 animais previstos. Não há animais modelados: há recintos e volumes de referência ocultos.
- Viveiros de águias, abutres, cegonhas, garças, pelicanos, cormorões, grous e flamingos ampliados para 8 × 6 m cada. Outros viveiros superiores: 2,5 × 6 m. Estas medidas são propostas espaciais, não comprovação de voo ou convivência adequada para 14 aves.
- Pequenos mamíferos, répteis e anfíbios superiores reorganizados em módulos de 1,6 × 2 m, duas fileiras por lado. Corredor secundário de 2 m entre as fileiras; acesso transversal entre X=22 e X=24. Alojamentos a partir de X=40 preservados.
- Essa compactação só serve aos envelopes pequenos propostos abaixo. Crocodilianos, varanos, castores e outros animais que cresçam além desses envelopes precisarão de recinto maior ou remanejamento; não presumir permanência indefinida nesse módulo.
- Novas paredes e tampas nos pequenos recintos, folhas sólidas independentes nos acessos, poleiros e volumes de bacias nos habitats úmidos. Bacias não contêm água simulada. Vedação fina, ventilação e condições ambientais ainda não estão resolvidas.
- Predadores e alguns primatas receberam divisória central, faixa interna de manejo de 1 m e dois portões internos. A separação é uma proposta de recinto; não é garantia de compatibilidade.
- Redistribuídas as baias inferiores de bombordo, liberando reservas para manejo/isolamento (7 × 4 m), alimentos (9 × 4 m) e água (7 × 4 m). Não são novas vagas. Não foram calculados consumo, autonomia, peso ou capacidade de água.
- Pontos de destino, chave do grupo, quantidades de machos e fêmeas e portões permanecem identificados. Isso prepara os dados; não implementa a lógica do jogo.

## Critérios e limites

Os envelopes da tabela são escolhas dimensionais para os futuros assets juvenis do jogo, não tamanhos zoológicos pesquisados. Cada recinto tem uma malha de caixas correspondente à quantidade prevista, na coleção **V3_Envelopes_Animais**, oculta por padrão. As caixas não demonstram folga para movimento, asas abertas, crescimento, alimentação ou manejo; podem ocupar regiões que depois precisarão ser liberadas para equipamentos. Não usar a tabela como recomendação para animais reais.

Não há idade definida nem curva de crescimento. Se um modelo ultrapassar seu envelope, ajustar o recinto ou a alocação antes de inseri-lo; não reduzir arbitrariamente o animal para fazê-lo caber. O limite de altura mais sensível é o das girafas juvenis, proposto como 3 m. Adultos não estão contemplados por esse envelope.

Rampas mantidas: 4 m de largura nominal, 35 m de percurso e 4,2 m de subida (aproximadamente 6,84 graus). Os desvios laterais ao redor das rampas são estreitos para os maiores animais; trajetória, curvas e altura livre precisam ser confirmadas com o asset final. Pequenos animais devem chegar em caixas de transporte pelo corredor correspondente. Largura nominal de portões: 3,2 m no inferior; 1,8 m no intermediário; até 1,4 m no superior. Espessuras e ferragens reduzem a passagem efetiva.

A soma de 952 é a quantidade atribuída no catálogo, não a capacidade validada. O número de animais adicionais que cabem permanece indeterminado. Não preencher as reservas de serviço com mais recintos antes de calcular suprimentos e circulação.

Os 128 nomes são grupos editoriais heterogêneos, não espécies padronizadas ou tipos bíblicos identificados. Não foram catalogados todos os invertebrados, animais extintos ou espécies modernas. Não há base para quantificar quantos tipos bíblicos ficaram de fora.

## Base textual

[Gênesis 7:2–3](https://www.biblegateway.com/passage/?search=Genesis+7%3A2-3&version=NIV): leitura adotada de sete pares dos puros, um casal dos impuros e sete pares das aves. [Levítico 11](https://www.biblegateway.com/passage/?search=Leviticus+11&version=NIV) é usado como referência posterior de classificação, não como lista de passageiros. A classificação dos grupos modernos é proposta de interpretação. Morcegos foram mantidos como mamíferos com um casal; sua presença entre os voadores em Levítico torna essa escolha revisável.

## Mapa dos recintos

INF/MED/SUP = piso; BB/BE = lado. Dimensões do recinto são externas. Os envelopes indicam comprimento × largura × altura por indivíduo em metros. Coordenadas e dados completos estão no JSON.

| ID | Grupo | Qtd. | Recinto C × P (m) | Envelope por animal (m) |
|---|---|---:|---:|---:|
| INF-BB-01 | Elefantes | 2 | 14.00 × 4.00 | 3 × 1.3 × 2.8 |
| INF-BB-02 | Rinocerontes | 2 | 12.00 × 4.00 | 2.5 × 1.2 × 2.4 |
| INF-BB-03 | Hipopotamos | 2 | 12.00 × 4.00 | 2.5 × 1.2 × 2.4 |
| INF-BB-04 | Tapires | 2 | 8.00 × 4.00 | 2.5 × 1.2 × 2.4 |
| INF-BB-05 | Cavalos | 2 | 8.00 × 4.00 | 2.5 × 1.2 × 2.4 |
| INF-BB-06 | Asnos | 2 | 8.00 × 4.00 | 2.5 × 1.2 × 2.4 |
| INF-BB-07 | Zebras | 2 | 8.00 × 4.00 | 2.5 × 1.2 × 2.4 |
| INF-BB-08 | Camelos | 2 | 10.00 × 4.00 | 2.5 × 1.2 × 2.4 |
| INF-BE-01 | Bovinos | 14 | 15.70 × 4.00 | 1.4 × 0.7 × 1.8 |
| INF-BE-02 | Bufalos | 14 | 15.70 × 4.00 | 1.4 × 0.7 × 1.8 |
| INF-BE-03 | Bisoes | 14 | 13.74 × 4.00 | 1.4 × 0.7 × 1.8 |
| INF-BE-04 | Iaques | 14 | 11.78 × 4.00 | 1.4 × 0.7 × 1.8 |
| INF-BE-05 | Girafas | 14 | 15.70 × 4.00 | 1.9 × 0.9 × 3 |
| INF-BE-06 | Alces | 14 | 11.78 × 4.00 | 1.4 × 0.7 × 1.8 |
| INF-BE-07 | Renas | 14 | 9.81 × 4.00 | 1.4 × 0.7 × 1.8 |
| INF-BE-08 | Cervos | 14 | 11.78 × 4.00 | 1.4 × 0.7 × 1.8 |
| MED-BB-01 | Ovelhas | 14 | 6.61 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-02 | Cabras | 14 | 6.61 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-03 | Ibex | 14 | 6.61 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-04 | Gazelas | 14 | 6.61 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-05 | Orix | 14 | 7.44 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-06 | Impala | 14 | 6.61 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-07 | Kudu | 14 | 8.26 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-08 | Gnus | 14 | 8.26 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-09 | Gorilas | 2 | 8.26 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-10 | Chimpanzes | 2 | 6.61 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-11 | Leoes | 2 | 5.79 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-12 | Tigres | 2 | 5.79 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-13 | Leopardos | 2 | 4.13 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-14 | Jaguares | 2 | 4.13 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-15 | Pumas | 2 | 4.13 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BB-16 | Guepardos | 2 | 4.13 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-01 | Ursos-pardos | 2 | 9.71 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-02 | Ursos-negros | 2 | 7.77 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-03 | Lobos | 2 | 5.83 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-04 | Raposas | 2 | 3.88 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-05 | Hienas | 2 | 5.83 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-06 | Chacais | 2 | 4.85 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-07 | Porcos | 2 | 4.85 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-08 | Javalis | 2 | 4.85 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-09 | Cangurus | 2 | 6.80 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-10 | Vombates | 2 | 3.88 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-11 | Capivaras | 2 | 4.85 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-12 | Tamanduas | 2 | 4.85 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-13 | Avestruzes | 14 | 11.65 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-14 | Emas | 14 | 9.71 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-15 | Babuinos | 2 | 5.83 × 6.00 | 1.1 × 0.55 × 1.7 |
| MED-BE-16 | Macacos | 2 | 4.85 × 6.00 | 1.1 × 0.55 × 1.7 |
| SUP-BB-01 | Pombos | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-02 | Corvos | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-03 | Galinhas | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-04 | Perdizes | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-05 | Pavoes | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-06 | Patos | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-07 | Marrecos | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-08 | Araras | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-09 | Cacatuas | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-10 | Pica-paus | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-11 | Poupas | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-12 | Andorinhoes | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-13 | Pardais | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-14 | Canarios | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-15 | Aguias | 14 | 8.00 × 6.00 | 1.2 × 0.7 × 1.5 |
| SUP-BB-16 | Cegonhas | 14 | 8.00 × 6.00 | 1.2 × 0.7 × 1.5 |
| SUP-BB-17 | Pelicanos | 14 | 8.00 × 6.00 | 1.2 × 0.7 × 1.5 |
| SUP-BB-18 | Grous | 14 | 8.00 × 6.00 | 1.2 × 0.7 × 1.5 |
| SUP-BB-19 | Cucos | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-20 | Corujas-pequenas | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BB-21 | Coelhos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-22 | Hiraxes | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-23 | Marmotas | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-24 | Porcos-espinhos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-25 | Porquinhos-da-india | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-26 | Gerbos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-27 | Ratos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-28 | Toupeiras | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-29 | Texugos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-30 | Mangustos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-31 | Jabutis | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-32 | Iguanas | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-33 | Teius | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-34 | Camaleoes | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-35 | Escincos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-36 | Pitons | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-37 | Viboras | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-38 | Crocodilianos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-39 | Sapos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BB-40 | Salamandras | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-01 | Rolinhas | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-02 | Gralhas | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-03 | Codornas | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-04 | Faisoes | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-05 | Perus | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-06 | Gansos | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-07 | Papagaios | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-08 | Periquitos | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-09 | Tucanos | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-10 | Martins-pescadores | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-11 | Andorinhas | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-12 | Cotovias | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-13 | Tentilhoes | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-14 | Pintassilgos | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-15 | Abutres | 14 | 8.00 × 6.00 | 1.2 × 0.7 × 1.5 |
| SUP-BE-16 | Garcas | 14 | 8.00 × 6.00 | 1.2 × 0.7 × 1.5 |
| SUP-BE-17 | Cormoroes | 14 | 8.00 × 6.00 | 1.2 × 0.7 × 1.5 |
| SUP-BE-18 | Flamingos | 14 | 8.00 × 6.00 | 1.2 × 0.7 × 1.5 |
| SUP-BE-19 | Beija-flores | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-20 | Falcoes-pequenos | 14 | 2.50 × 6.00 | 0.55 × 0.3 × 0.75 |
| SUP-BE-21 | Lebres | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-22 | Esquilos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-23 | Castores | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-24 | Chinchilas | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-25 | Hamsters | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-26 | Camundongos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-27 | Musaranhos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-28 | Ouricos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-29 | Furoes | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-30 | Morcegos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-31 | Tartarugas-semiaquaticas | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-32 | Varanos | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-33 | Agamas | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-34 | Lagartixas | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-35 | Jiboias | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-36 | Cobras-nao-peconhentas | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-37 | Najas | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-38 | Ras | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-39 | Pererecas | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
| SUP-BE-40 | Cecilias | 2 | 1.60 × 2.00 | 0.55 × 0.65 × 0.65 |
