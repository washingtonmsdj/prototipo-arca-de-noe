# Cadastro das baias físicas — revisão 2

**162 baias físicas, 162 ocupadas, 0 disponíveis.** Todos os **1.080 indivíduos de referência** dos 162 grupos estão dentro da arca.

O arquivo executável é `catalogo-baias-fisicas-v1.json` (`version=2`). Placas, caixas dos animais, divisórias e colisões usam os mesmos `bounds_m`; não existem posições alternativas escondidas fora da arca.

## Compactação

Foram adicionadas **20 divisões internas de runtime**, sempre dentro de volumes de baia já existentes:

- `MED-BE-07` foi dividido em A/B: porcos em `MED-BE-07-A` e casuares em `MED-BE-07-B`;
- quatro baias médias antes vazias receberam pinguins, cisnes, kiwis e turacos;
- dezenove recintos compactos do piso superior foram divididos longitudinalmente para receber os dezenove grupos pequenos/invertebrados que antes estavam na galeria externa.

Módulos com divisão runtime: `MED-BE-07`, `SUP-BB-21`, `SUP-BB-22`, `SUP-BB-23`, `SUP-BB-24`, `SUP-BB-25`, `SUP-BB-26`, `SUP-BB-27`, `SUP-BB-28`, `SUP-BB-29`, `SUP-BB-30`, `SUP-BE-21`, `SUP-BE-22`, `SUP-BE-23`, `SUP-BE-24`, `SUP-BE-25`, `SUP-BE-26`, `SUP-BE-27`, `SUP-BE-28`, `SUP-BE-29`.

As novas divisórias são renderizadas em `EnclosurePartitions.tsx`. O catálogo só é considerado válido quando todos os blocos de cada grupo cabem geometricamente nos limites úteis da respectiva baia.

Dimensões úteis abaixo: **comprimento X × profundidade Z × altura Y**, em metros.

| Baia | Ocupação | Indivíduos | Dimensões úteis (m) | Divisão runtime |
|---|---|---:|---|---|
| INF-BB-01 | Elefantes | 2 | 13.780 × 3.880 × 3.350 | não |
| INF-BB-02 | Rinocerontes | 2 | 11.780 × 3.880 × 3.350 | não |
| INF-BB-03 | Hipopotamos | 2 | 11.780 × 3.880 × 3.350 | não |
| INF-BB-04 | Tapires | 2 | 7.780 × 3.880 × 3.350 | não |
| INF-BB-05 | Cavalos | 2 | 7.780 × 3.880 × 3.350 | não |
| INF-BB-06 | Asnos | 2 | 7.780 × 3.880 × 3.350 | não |
| INF-BB-07 | Zebras | 2 | 7.780 × 3.880 × 3.350 | não |
| INF-BB-08 | Camelos | 2 | 9.780 × 3.880 × 3.350 | não |
| INF-BE-01 | Bovinos | 14 | 15.484 × 3.880 × 3.350 | não |
| INF-BE-02 | Bufalos | 14 | 15.484 × 3.880 × 3.350 | não |
| INF-BE-03 | Bisoes | 14 | 13.521 × 3.880 × 3.350 | não |
| INF-BE-04 | Iaques | 14 | 11.558 × 3.880 × 3.350 | não |
| INF-BE-05 | Girafas | 14 | 15.484 × 3.880 × 3.350 | não |
| INF-BE-06 | Alces | 14 | 11.558 × 3.880 × 3.350 | não |
| INF-BE-07 | Renas | 14 | 9.595 × 3.880 × 3.350 | não |
| INF-BE-08 | Cervos | 14 | 11.558 × 3.880 × 3.350 | não |
| MED-BB-01 | Ovelhas | 14 | 6.392 × 5.880 × 3.350 | não |
| MED-BB-02 | Cabras | 14 | 6.392 × 5.880 × 3.350 | não |
| MED-BB-03 | Ibex | 14 | 6.392 × 5.880 × 3.350 | não |
| MED-BB-04 | Gazelas | 14 | 6.392 × 5.880 × 3.350 | não |
| MED-BB-05 | Orix | 14 | 7.218 × 5.880 × 3.350 | não |
| MED-BB-06 | Impala | 14 | 6.392 × 5.880 × 3.350 | não |
| MED-BB-07 | Kudu | 14 | 8.044 × 5.880 × 3.350 | não |
| MED-BB-08 | Gnus | 14 | 8.044 × 5.880 × 3.350 | não |
| MED-BB-09-A | Gorilas | 2 | 3.987 × 4.900 × 2.475 | não |
| MED-BB-09-B | Pinguins | 14 | 3.987 × 4.900 × 2.475 | não |
| MED-BB-10-A | Chimpanzes | 2 | 3.161 × 4.900 × 2.475 | não |
| MED-BB-10-B | Cisnes | 14 | 3.161 × 4.900 × 2.475 | não |
| MED-BB-11-A | Leoes | 2 | 2.748 × 4.900 × 2.475 | não |
| MED-BB-11-B | Lontras | 2 | 2.748 × 4.900 × 2.475 | não |
| MED-BB-12-A | Tigres | 2 | 2.748 × 4.900 × 2.475 | não |
| MED-BB-12-B | Suricatos | 2 | 2.748 × 4.900 × 2.475 | não |
| MED-BB-13-A | Leopardos | 2 | 1.921 × 4.900 × 2.475 | não |
| MED-BB-13-B | Preguiças | 2 | 1.921 × 4.900 × 2.475 | não |
| MED-BB-14-A | Jaguares | 2 | 1.921 × 4.900 × 2.475 | não |
| MED-BB-14-B | Tatus | 2 | 1.921 × 4.900 × 2.475 | não |
| MED-BB-15-A | Pumas | 2 | 1.921 × 4.900 × 2.475 | não |
| MED-BB-15-B | Kiwis | 14 | 1.921 × 4.900 × 2.475 | não |
| MED-BB-16-A | Guepardos | 2 | 1.921 × 4.900 × 3.350 | não |
| MED-BB-16-B | Coalas | 2 | 1.921 × 4.900 × 3.350 | não |
| MED-BE-01-A | Ursos-pardos | 2 | 4.709 × 4.900 × 2.475 | não |
| MED-BE-01-B | Pandas | 2 | 4.709 × 4.900 × 2.475 | não |
| MED-BE-02-A | Ursos-negros | 2 | 3.739 × 4.900 × 2.475 | não |
| MED-BE-02-B | Turacos | 14 | 3.739 × 4.900 × 2.475 | não |
| MED-BE-03-A | Lobos | 2 | 2.768 × 4.900 × 2.475 | não |
| MED-BE-03-B | Ocapis | 2 | 2.768 × 4.900 × 2.475 | não |
| MED-BE-04 | Raposas | 2 | 3.663 × 5.880 × 3.350 | não |
| MED-BE-05-A | Hienas | 2 | 2.768 × 4.900 × 3.350 | não |
| MED-BE-05-B | Pangolins | 2 | 2.768 × 4.900 × 3.350 | não |
| MED-BE-06 | Chacais | 2 | 4.634 × 5.880 × 3.350 | não |
| MED-BE-07-A | Porcos | 2 | 2.257 × 5.880 × 3.350 | sim |
| MED-BE-07-B | Casuares | 14 | 2.257 × 5.880 × 3.350 | sim |
| MED-BE-08 | Javalis | 2 | 4.634 × 5.880 × 3.350 | não |
| MED-BE-09 | Cangurus | 2 | 6.576 × 5.880 × 3.350 | não |
| MED-BE-10 | Vombates | 2 | 3.663 × 5.880 × 3.350 | não |
| MED-BE-11 | Capivaras | 2 | 4.634 × 5.880 × 3.350 | não |
| MED-BE-12 | Tamanduas | 2 | 4.634 × 5.880 × 3.350 | não |
| MED-BE-13 | Avestruzes | 14 | 11.431 × 5.880 × 2.475 | não |
| MED-BE-14 | Emas | 14 | 9.489 × 5.880 × 2.475 | não |
| MED-BE-15-A | Babuinos | 2 | 2.768 × 4.900 × 2.475 | não |
| MED-BE-15-B | Porcos-formigueiros | 2 | 2.768 × 4.900 × 2.475 | não |
| MED-BE-16-A | Macacos | 2 | 2.282 × 4.900 × 2.475 | não |
| MED-BE-16-B | Lêmures | 2 | 2.282 × 4.900 × 2.475 | não |
| SUP-BB-01 | Pombos | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-02 | Corvos | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-03 | Galinhas | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-04 | Perdizes | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-05 | Pavoes | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-06 | Patos | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-07 | Marrecos | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-08 | Araras | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-09 | Cacatuas | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-10 | Pica-paus | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-11 | Poupas | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-12 | Andorinhoes | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-13 | Pardais | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-14 | Canarios | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-15 | Aguias | 14 | 7.780 × 5.880 × 2.625 | não |
| SUP-BB-16 | Cegonhas | 14 | 7.780 × 5.880 × 2.625 | não |
| SUP-BB-17 | Pelicanos | 14 | 7.780 × 5.880 × 2.625 | não |
| SUP-BB-18 | Grous | 14 | 7.780 × 5.880 × 2.625 | não |
| SUP-BB-19 | Cucos | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-20 | Corujas-pequenas | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BB-21-A | Coelhos | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-21-B | Formigas | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-22-A | Hiraxes | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-22-B | Abelhas | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-23-A | Marmotas | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-23-B | Vespas | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-24-A | Porcos-espinhos | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-24-B | Cupins | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-25-A | Porquinhos-da-india | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-25-B | Besouros | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-26-A | Gerbos | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-26-B | Borboletas | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-27-A | Ratos | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-27-B | Mariposas | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-28-A | Toupeiras | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-28-B | Gafanhotos | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-29-A | Texugos | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-29-B | Grilos | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-30-A | Mangustos | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-30-B | Louva-a-deus | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BB-31 | Jabutis | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BB-32 | Iguanas | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BB-33 | Teius | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BB-34 | Camaleoes | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BB-35 | Escincos | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BB-36 | Pitons | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BB-37 | Viboras | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BB-38 | Crocodilianos | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BB-39 | Sapos | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BB-40 | Salamandras | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BE-01 | Rolinhas | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-02 | Gralhas | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-03 | Codornas | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-04 | Faisoes | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-05 | Perus | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-06 | Gansos | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-07 | Papagaios | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-08 | Periquitos | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-09 | Tucanos | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-10 | Martins-pescadores | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-11 | Andorinhas | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-12 | Cotovias | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-13 | Tentilhoes | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-14 | Pintassilgos | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-15 | Abutres | 14 | 7.780 × 5.880 × 2.625 | não |
| SUP-BE-16 | Garcas | 14 | 7.780 × 5.880 × 2.625 | não |
| SUP-BE-17 | Cormoroes | 14 | 7.780 × 5.880 × 2.625 | não |
| SUP-BE-18 | Flamingos | 14 | 7.780 × 5.880 × 2.625 | não |
| SUP-BE-19 | Beija-flores | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-20 | Falcoes-pequenos | 14 | 2.280 × 5.880 × 2.625 | não |
| SUP-BE-21-A | Lebres | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-21-B | Bichos-pau | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-22-A | Esquilos | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-22-B | Baratas | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-23-A | Castores | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-23-B | Aranhas | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-24-A | Chinchilas | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-24-B | Escorpiões | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-25-A | Hamsters | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-25-B | Centopeias | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-26-A | Camundongos | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-26-B | Piolhos-de-cobra | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-27-A | Musaranhos | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-27-B | Caracóis terrestres | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-28-A | Ouricos | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-28-B | Lesmas | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-29-A | Furoes | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-29-B | Minhocas | 2 | 0.650 × 1.880 × 2.650 | sim |
| SUP-BE-30 | Morcegos | 2 | 1.380 × 1.880 × 2.625 | não |
| SUP-BE-31 | Tartarugas-semiaquaticas | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BE-32 | Varanos | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BE-33 | Agamas | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BE-34 | Lagartixas | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BE-35 | Jiboias | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BE-36 | Cobras-nao-peconhentas | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BE-37 | Najas | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BE-38 | Ras | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BE-39 | Pererecas | 2 | 1.380 × 1.880 × 2.650 | não |
| SUP-BE-40 | Cecilias | 2 | 1.380 × 1.880 × 2.650 | não |

Estas dimensões descrevem espaço geométrico disponível no protótipo. Não são uma declaração de adequação biológica, ventilação, manejo, alimento, água ou bem-estar.
