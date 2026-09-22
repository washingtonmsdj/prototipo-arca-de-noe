# Dimensões e destinos dos animais — revisão 4

**162 grupos, 1.080 indivíduos, todos alocados dentro da arca.** Não existe mais galeria externa de grupos pendentes.

O cadastro executável é `dimensoes-animais-jogo-v1.json` (`version=4`). Cada grupo aponta para exatamente uma baia física em `catalogo-baias-fisicas-v1.json`.

## Regra de escala

As dimensões representam o **envelope corporal na postura normal indicada**, e não a maior altura que o animal poderia atingir erguido. Isso evita, por exemplo, tratar tamanduá como um animal de 1,7 m de altura só porque seu comprimento total é grande.

- Blender: `comprimento × largura × altura`.
- Three.js: `BoxGeometry(comprimento, altura, largura)`.
- Unidade: metro.
- Centro vertical do bloco = piso + altura/2 + 0,02 m.
- `posture` registra a postura usada para o envelope.
- `dimension_basis=adulto_representativo` indica referência de adulto em postura normal.
- `jovem_independente_proporcional` é explícito para grupos grandes cuja altura adulta não é compatível com a altura útil dos pavimentos. Não é redução oculta do runtime.

Esses valores são **envelopes de blocagem calibrados**, adequados para proporção visual, layout e colisão preliminar. Não constituem certificação zoológica, de bem-estar ou de capacidade de transporte.

## Exemplos da correção

- Tamanduás: `2,00 × 0,55 × 0,75 m`, quadrúpedes; o comprimento inclui a cauda no envelope.
- Ursos-pardos: `2,20 × 0,90 × 1,20 m`, quadrúpedes.
- Porcos: `1,50 × 0,65 × 0,80 m`, quadrúpedes.
- Vombates: `1,00 × 0,45 × 0,40 m`, quadrúpedes.
- Avestruzes: `1,05 × 0,55 × 2,20 m`, postura ereta.

## Catálogo

| Animal | Baia física | Quantidade | Comprimento | Largura | Altura | Postura | Base dimensional |
|---|---|---:|---:|---:|---:|---|---|
| Elefantes | INF-BB-01 | 2 (1/1) | 3 | 1.4 | 2.6 | quadrupede | jovem_independente_proporcional |
| Rinocerontes | INF-BB-02 | 2 (1/1) | 3 | 1.3 | 1.7 | quadrupede | jovem_independente_proporcional |
| Hipopotamos | INF-BB-03 | 2 (1/1) | 3 | 1.4 | 1.5 | quadrupede | jovem_independente_proporcional |
| Tapires | INF-BB-04 | 2 (1/1) | 2 | 0.8 | 1.1 | quadrupede | adulto_representativo |
| Cavalos | INF-BB-05 | 2 (1/1) | 2.4 | 0.8 | 1.6 | quadrupede | adulto_representativo |
| Asnos | INF-BB-06 | 2 (1/1) | 2 | 0.7 | 1.3 | quadrupede | adulto_representativo |
| Zebras | INF-BB-07 | 2 (1/1) | 2.3 | 0.8 | 1.5 | quadrupede | adulto_representativo |
| Camelos | INF-BB-08 | 2 (1/1) | 2.8 | 0.9 | 2 | quadrupede | adulto_representativo |
| Bovinos | INF-BE-01 | 14 (7/7) | 2.1 | 0.85 | 1.5 | quadrupede | jovem_independente_proporcional |
| Bufalos | INF-BE-02 | 14 (7/7) | 2.4 | 0.9 | 1.6 | quadrupede | jovem_independente_proporcional |
| Bisoes | INF-BE-03 | 14 (7/7) | 2.6 | 0.9 | 1.55 | quadrupede | jovem_independente_proporcional |
| Iaques | INF-BE-04 | 14 (7/7) | 2.2 | 0.85 | 1.5 | quadrupede | jovem_independente_proporcional |
| Girafas | INF-BE-05 | 14 (7/7) | 2 | 0.75 | 2.9 | quadrupede | jovem_independente_proporcional |
| Alces | INF-BE-06 | 14 (7/7) | 2.1 | 0.8 | 1.6 | quadrupede | jovem_independente_proporcional |
| Renas | INF-BE-07 | 14 (7/7) | 1.8 | 0.7 | 1.3 | quadrupede | jovem_independente_proporcional |
| Cervos | INF-BE-08 | 14 (7/7) | 1.6 | 0.65 | 1.2 | quadrupede | jovem_independente_proporcional |
| Ovelhas | MED-BB-01 | 14 (7/7) | 1.3 | 0.5 | 0.9 | quadrupede | adulto_representativo |
| Cabras | MED-BB-02 | 14 (7/7) | 1.2 | 0.5 | 0.9 | quadrupede | adulto_representativo |
| Ibex | MED-BB-03 | 14 (7/7) | 1.4 | 0.5 | 1 | quadrupede | adulto_representativo |
| Gazelas | MED-BB-04 | 14 (7/7) | 1.2 | 0.45 | 0.9 | quadrupede | adulto_representativo |
| Orix | MED-BB-05 | 14 (7/7) | 1.6 | 0.55 | 1.2 | quadrupede | adulto_representativo |
| Impala | MED-BB-06 | 14 (7/7) | 1.3 | 0.45 | 0.95 | quadrupede | adulto_representativo |
| Kudu | MED-BB-07 | 14 (7/7) | 1.7 | 0.55 | 1.3 | quadrupede | adulto_representativo |
| Gnus | MED-BB-08 | 14 (7/7) | 1.8 | 0.65 | 1.3 | quadrupede | adulto_representativo |
| Gorilas | MED-BB-09-A | 2 (1/1) | 1.3 | 0.7 | 1.1 | apoio_quadrupede | adulto_representativo |
| Chimpanzes | MED-BB-10-A | 2 (1/1) | 1 | 0.55 | 0.9 | apoio_quadrupede | adulto_representativo |
| Leoes | MED-BB-11-A | 2 (1/1) | 2 | 0.7 | 1 | quadrupede | adulto_representativo |
| Tigres | MED-BB-12-A | 2 (1/1) | 2.2 | 0.75 | 1.05 | quadrupede | adulto_representativo |
| Leopardos | MED-BB-13-A | 2 (1/1) | 1.6 | 0.55 | 0.8 | quadrupede | adulto_representativo |
| Jaguares | MED-BB-14-A | 2 (1/1) | 1.7 | 0.6 | 0.85 | quadrupede | adulto_representativo |
| Pumas | MED-BB-15-A | 2 (1/1) | 1.6 | 0.55 | 0.8 | quadrupede | adulto_representativo |
| Guepardos | MED-BB-16-A | 2 (1/1) | 1.5 | 0.5 | 0.8 | quadrupede | adulto_representativo |
| Ursos-pardos | MED-BE-01-A | 2 (1/1) | 2.2 | 0.9 | 1.2 | quadrupede | adulto_representativo |
| Ursos-negros | MED-BE-02-A | 2 (1/1) | 1.7 | 0.7 | 0.9 | quadrupede | adulto_representativo |
| Lobos | MED-BE-03-A | 2 (1/1) | 1.4 | 0.5 | 0.8 | quadrupede | adulto_representativo |
| Raposas | MED-BE-04 | 2 (1/1) | 0.9 | 0.35 | 0.45 | quadrupede | adulto_representativo |
| Hienas | MED-BE-05-A | 2 (1/1) | 1.5 | 0.5 | 0.85 | quadrupede | adulto_representativo |
| Chacais | MED-BE-06 | 2 (1/1) | 0.95 | 0.35 | 0.5 | quadrupede | adulto_representativo |
| Porcos | MED-BE-07-A | 2 (1/1) | 1.5 | 0.65 | 0.8 | quadrupede | adulto_representativo |
| Javalis | MED-BE-08 | 2 (1/1) | 1.5 | 0.65 | 0.85 | quadrupede | adulto_representativo |
| Cangurus | MED-BE-09 | 2 (1/1) | 1.4 | 0.6 | 1.6 | ereto_relaxado | adulto_representativo |
| Vombates | MED-BE-10 | 2 (1/1) | 1 | 0.45 | 0.4 | quadrupede | adulto_representativo |
| Capivaras | MED-BE-11 | 2 (1/1) | 1.2 | 0.5 | 0.6 | quadrupede | adulto_representativo |
| Tamanduas | MED-BE-12 | 2 (1/1) | 2 | 0.55 | 0.75 | quadrupede | adulto_representativo_cauda_incluida |
| Avestruzes | MED-BE-13 | 14 (7/7) | 1.05 | 0.55 | 2.2 | ereto | adulto_representativo |
| Emas | MED-BE-14 | 14 (7/7) | 1 | 0.5 | 1.75 | ereto | adulto_representativo |
| Babuinos | MED-BE-15-A | 2 (1/1) | 1 | 0.45 | 0.8 | quadrupede | adulto_representativo |
| Macacos | MED-BE-16-A | 2 (1/1) | 0.8 | 0.4 | 0.7 | quadrupede | adulto_representativo |
| Pombos | SUP-BB-01 | 14 (7/7) | 0.35 | 0.18 | 0.28 | ereto_pousado | adulto_representativo |
| Corvos | SUP-BB-02 | 14 (7/7) | 0.5 | 0.22 | 0.35 | ereto_pousado | adulto_representativo |
| Galinhas | SUP-BB-03 | 14 (7/7) | 0.5 | 0.25 | 0.45 | ereto_pousado | adulto_representativo |
| Perdizes | SUP-BB-04 | 14 (7/7) | 0.35 | 0.18 | 0.3 | ereto_pousado | adulto_representativo |
| Pavoes | SUP-BB-05 | 14 (7/7) | 1.1 | 0.35 | 1 | ereto_pousado | adulto_representativo |
| Patos | SUP-BB-06 | 14 (7/7) | 0.55 | 0.25 | 0.4 | ereto_pousado | adulto_representativo |
| Marrecos | SUP-BB-07 | 14 (7/7) | 0.4 | 0.2 | 0.3 | ereto_pousado | adulto_representativo |
| Araras | SUP-BB-08 | 14 (7/7) | 0.8 | 0.25 | 0.5 | ereto_pousado | adulto_representativo |
| Cacatuas | SUP-BB-09 | 14 (7/7) | 0.5 | 0.22 | 0.45 | ereto_pousado | adulto_representativo |
| Pica-paus | SUP-BB-10 | 14 (7/7) | 0.3 | 0.15 | 0.25 | ereto_pousado | adulto_representativo |
| Poupas | SUP-BB-11 | 14 (7/7) | 0.3 | 0.14 | 0.25 | ereto_pousado | adulto_representativo |
| Andorinhoes | SUP-BB-12 | 14 (7/7) | 0.2 | 0.12 | 0.14 | ereto_pousado | adulto_representativo |
| Pardais | SUP-BB-13 | 14 (7/7) | 0.16 | 0.08 | 0.12 | ereto_pousado | adulto_representativo |
| Canarios | SUP-BB-14 | 14 (7/7) | 0.14 | 0.07 | 0.11 | ereto_pousado | adulto_representativo |
| Aguias | SUP-BB-15 | 14 (7/7) | 0.9 | 0.4 | 0.8 | ereto_pousado | adulto_representativo |
| Cegonhas | SUP-BB-16 | 14 (7/7) | 1 | 0.4 | 1.2 | ereto_pousado | adulto_representativo |
| Pelicanos | SUP-BB-17 | 14 (7/7) | 1.4 | 0.5 | 1.15 | ereto_pousado | adulto_representativo |
| Grous | SUP-BB-18 | 14 (7/7) | 1.2 | 0.45 | 1.35 | ereto_pousado | adulto_representativo |
| Cucos | SUP-BB-19 | 14 (7/7) | 0.35 | 0.18 | 0.3 | ereto_pousado | adulto_representativo |
| Corujas-pequenas | SUP-BB-20 | 14 (7/7) | 0.3 | 0.2 | 0.25 | ereto_pousado | adulto_representativo |
| Coelhos | SUP-BB-21-A | 2 (1/1) | 0.5 | 0.3 | 0.35 | quadrupede | adulto_representativo |
| Hiraxes | SUP-BB-22-A | 2 (1/1) | 0.5 | 0.3 | 0.3 | quadrupede | adulto_representativo |
| Marmotas | SUP-BB-23-A | 2 (1/1) | 0.6 | 0.3 | 0.35 | quadrupede | adulto_representativo |
| Porcos-espinhos | SUP-BB-24-A | 2 (1/1) | 0.7 | 0.4 | 0.45 | quadrupede | adulto_representativo |
| Porquinhos-da-india | SUP-BB-25-A | 2 (1/1) | 0.3 | 0.18 | 0.15 | quadrupede | adulto_representativo |
| Gerbos | SUP-BB-26-A | 2 (1/1) | 0.15 | 0.07 | 0.08 | quadrupede | adulto_representativo |
| Ratos | SUP-BB-27-A | 2 (1/1) | 0.25 | 0.12 | 0.12 | quadrupede | adulto_representativo |
| Toupeiras | SUP-BB-28-A | 2 (1/1) | 0.16 | 0.08 | 0.08 | quadrupede | adulto_representativo |
| Texugos | SUP-BB-29-A | 2 (1/1) | 0.85 | 0.4 | 0.35 | quadrupede | adulto_representativo |
| Mangustos | SUP-BB-30-A | 2 (1/1) | 0.55 | 0.2 | 0.25 | quadrupede | adulto_representativo |
| Jabutis | SUP-BB-31 | 2 (1/1) | 0.5 | 0.35 | 0.25 | quadrupede | adulto_representativo |
| Iguanas | SUP-BB-32 | 2 (1/1) | 1.2 | 0.35 | 0.35 | quadrupede | adulto_representativo |
| Teius | SUP-BB-33 | 2 (1/1) | 1.2 | 0.3 | 0.3 | quadrupede | adulto_representativo |
| Camaleoes | SUP-BB-34 | 2 (1/1) | 0.4 | 0.15 | 0.18 | quadrupede | adulto_representativo |
| Escincos | SUP-BB-35 | 2 (1/1) | 0.3 | 0.1 | 0.1 | quadrupede | adulto_representativo |
| Pitons | SUP-BB-36 | 2 (1/1) | 0.9 | 0.6 | 0.25 | enrodado_relaxado | adulto_representativo |
| Viboras | SUP-BB-37 | 2 (1/1) | 0.6 | 0.3 | 0.2 | enrodado_relaxado | adulto_representativo |
| Crocodilianos | SUP-BB-38 | 2 (1/1) | 1.8 | 0.6 | 0.4 | quadrupede | jovem_independente_proporcional |
| Sapos | SUP-BB-39 | 2 (1/1) | 0.15 | 0.12 | 0.1 | repouso | adulto_representativo |
| Salamandras | SUP-BB-40 | 2 (1/1) | 0.2 | 0.08 | 0.05 | repouso | adulto_representativo |
| Rolinhas | SUP-BE-01 | 14 (7/7) | 0.3 | 0.16 | 0.25 | ereto_pousado | adulto_representativo |
| Gralhas | SUP-BE-02 | 14 (7/7) | 0.42 | 0.2 | 0.32 | ereto_pousado | adulto_representativo |
| Codornas | SUP-BE-03 | 14 (7/7) | 0.25 | 0.14 | 0.22 | ereto_pousado | adulto_representativo |
| Faisoes | SUP-BE-04 | 14 (7/7) | 0.8 | 0.3 | 0.5 | ereto_pousado | adulto_representativo |
| Perus | SUP-BE-05 | 14 (7/7) | 1 | 0.5 | 0.9 | ereto_pousado | adulto_representativo |
| Gansos | SUP-BE-06 | 14 (7/7) | 0.8 | 0.4 | 0.7 | ereto_pousado | adulto_representativo |
| Papagaios | SUP-BE-07 | 14 (7/7) | 0.4 | 0.2 | 0.35 | ereto_pousado | adulto_representativo |
| Periquitos | SUP-BE-08 | 14 (7/7) | 0.25 | 0.12 | 0.18 | ereto_pousado | adulto_representativo |
| Tucanos | SUP-BE-09 | 14 (7/7) | 0.6 | 0.25 | 0.4 | ereto_pousado | adulto_representativo |
| Martins-pescadores | SUP-BE-10 | 14 (7/7) | 0.25 | 0.12 | 0.18 | ereto_pousado | adulto_representativo |
| Andorinhas | SUP-BE-11 | 14 (7/7) | 0.18 | 0.1 | 0.12 | ereto_pousado | adulto_representativo |
| Cotovias | SUP-BE-12 | 14 (7/7) | 0.18 | 0.1 | 0.14 | ereto_pousado | adulto_representativo |
| Tentilhoes | SUP-BE-13 | 14 (7/7) | 0.15 | 0.08 | 0.12 | ereto_pousado | adulto_representativo |
| Pintassilgos | SUP-BE-14 | 14 (7/7) | 0.13 | 0.07 | 0.11 | ereto_pousado | adulto_representativo |
| Abutres | SUP-BE-15 | 14 (7/7) | 1 | 0.45 | 0.8 | ereto_pousado | adulto_representativo |
| Garcas | SUP-BE-16 | 14 (7/7) | 1 | 0.4 | 1 | ereto_pousado | adulto_representativo |
| Cormoroes | SUP-BE-17 | 14 (7/7) | 0.9 | 0.35 | 0.7 | ereto_pousado | adulto_representativo |
| Flamingos | SUP-BE-18 | 14 (7/7) | 1 | 0.4 | 1.4 | ereto_pousado | adulto_representativo |
| Beija-flores | SUP-BE-19 | 14 (7/7) | 0.1 | 0.05 | 0.08 | ereto_pousado | adulto_representativo |
| Falcoes-pequenos | SUP-BE-20 | 14 (7/7) | 0.5 | 0.25 | 0.4 | ereto_pousado | adulto_representativo |
| Lebres | SUP-BE-21-A | 2 (1/1) | 0.6 | 0.3 | 0.4 | quadrupede | adulto_representativo |
| Esquilos | SUP-BE-22-A | 2 (1/1) | 0.35 | 0.18 | 0.25 | quadrupede | adulto_representativo |
| Castores | SUP-BE-23-A | 2 (1/1) | 0.85 | 0.4 | 0.4 | quadrupede | adulto_representativo |
| Chinchilas | SUP-BE-24-A | 2 (1/1) | 0.3 | 0.18 | 0.2 | quadrupede | adulto_representativo |
| Hamsters | SUP-BE-25-A | 2 (1/1) | 0.18 | 0.1 | 0.1 | quadrupede | adulto_representativo |
| Camundongos | SUP-BE-26-A | 2 (1/1) | 0.12 | 0.06 | 0.07 | quadrupede | adulto_representativo |
| Musaranhos | SUP-BE-27-A | 2 (1/1) | 0.1 | 0.05 | 0.05 | quadrupede | adulto_representativo |
| Ouricos | SUP-BE-28-A | 2 (1/1) | 0.25 | 0.15 | 0.15 | quadrupede | adulto_representativo |
| Furoes | SUP-BE-29-A | 2 (1/1) | 0.5 | 0.15 | 0.18 | quadrupede | adulto_representativo |
| Morcegos | SUP-BE-30 | 2 (1/1) | 0.2 | 0.1 | 0.12 | pousado | adulto_representativo |
| Tartarugas-semiaquaticas | SUP-BE-31 | 2 (1/1) | 0.4 | 0.3 | 0.2 | repouso | adulto_representativo |
| Varanos | SUP-BE-32 | 2 (1/1) | 1.2 | 0.35 | 0.3 | quadrupede | adulto_representativo |
| Agamas | SUP-BE-33 | 2 (1/1) | 0.3 | 0.12 | 0.12 | quadrupede | adulto_representativo |
| Lagartixas | SUP-BE-34 | 2 (1/1) | 0.2 | 0.1 | 0.08 | quadrupede | adulto_representativo |
| Jiboias | SUP-BE-35 | 2 (1/1) | 0.8 | 0.6 | 0.25 | enrodado_relaxado | adulto_representativo |
| Cobras-nao-peconhentas | SUP-BE-36 | 2 (1/1) | 0.6 | 0.3 | 0.15 | enrodado_relaxado | adulto_representativo |
| Najas | SUP-BE-37 | 2 (1/1) | 0.6 | 0.4 | 0.25 | enrodado_relaxado | adulto_representativo |
| Ras | SUP-BE-38 | 2 (1/1) | 0.12 | 0.1 | 0.08 | repouso | adulto_representativo |
| Pererecas | SUP-BE-39 | 2 (1/1) | 0.08 | 0.07 | 0.06 | repouso | adulto_representativo |
| Cecilias | SUP-BE-40 | 2 (1/1) | 0.4 | 0.08 | 0.08 | repouso | adulto_representativo |
| Preguiças | MED-BB-13-B | 2 (1/1) | 0.7 | 0.45 | 0.55 | quadrupede_suspenso_referencia | adulto_representativo |
| Tatus | MED-BB-14-B | 2 (1/1) | 0.8 | 0.35 | 0.35 | quadrupede | adulto_representativo |
| Pandas | MED-BE-01-B | 2 (1/1) | 1.5 | 0.75 | 0.85 | quadrupede | adulto_representativo |
| Coalas | MED-BB-16-B | 2 (1/1) | 0.7 | 0.4 | 0.6 | quadrupede | adulto_representativo |
| Lêmures | MED-BE-16-B | 2 (1/1) | 0.8 | 0.3 | 0.45 | quadrupede | adulto_representativo |
| Lontras | MED-BB-11-B | 2 (1/1) | 1 | 0.3 | 0.3 | quadrupede | adulto_representativo |
| Suricatos | MED-BB-12-B | 2 (1/1) | 0.4 | 0.15 | 0.3 | quadrupede | adulto_representativo |
| Ocapis | MED-BE-03-B | 2 (1/1) | 2.1 | 0.75 | 1.7 | quadrupede | adulto_representativo |
| Pangolins | MED-BE-05-B | 2 (1/1) | 1 | 0.3 | 0.35 | quadrupede | adulto_representativo |
| Porcos-formigueiros | MED-BE-15-B | 2 (1/1) | 1.3 | 0.45 | 0.65 | quadrupede | adulto_representativo |
| Pinguins | MED-BB-09-B | 14 (7/7) | 0.5 | 0.35 | 0.8 | ereto_pousado | adulto_representativo |
| Kiwis | MED-BB-15-B | 14 (7/7) | 0.45 | 0.25 | 0.4 | ereto_pousado | adulto_representativo |
| Casuares | MED-BE-07-B | 14 (7/7) | 0.95 | 0.45 | 1.65 | ereto_pousado | adulto_representativo |
| Cisnes | MED-BB-10-B | 14 (7/7) | 1.2 | 0.5 | 0.8 | ereto_pousado | adulto_representativo |
| Turacos | MED-BE-02-B | 14 (7/7) | 0.45 | 0.2 | 0.3 | ereto_pousado | adulto_representativo |
| Formigas | SUP-BB-21-B | 2 (1/1) | 0.012 | 0.004 | 0.006 | repouso | adulto_representativo |
| Abelhas | SUP-BB-22-B | 2 (1/1) | 0.02 | 0.01 | 0.012 | repouso | adulto_representativo |
| Vespas | SUP-BB-23-B | 2 (1/1) | 0.025 | 0.012 | 0.015 | repouso | adulto_representativo |
| Cupins | SUP-BB-24-B | 2 (1/1) | 0.008 | 0.003 | 0.004 | repouso | adulto_representativo |
| Besouros | SUP-BB-25-B | 2 (1/1) | 0.06 | 0.03 | 0.025 | repouso | adulto_representativo |
| Borboletas | SUP-BB-26-B | 2 (1/1) | 0.06 | 0.12 | 0.03 | repouso | adulto_representativo |
| Mariposas | SUP-BB-27-B | 2 (1/1) | 0.06 | 0.1 | 0.03 | repouso | adulto_representativo |
| Gafanhotos | SUP-BB-28-B | 2 (1/1) | 0.08 | 0.03 | 0.04 | repouso | adulto_representativo |
| Grilos | SUP-BB-29-B | 2 (1/1) | 0.04 | 0.02 | 0.025 | repouso | adulto_representativo |
| Louva-a-deus | SUP-BB-30-B | 2 (1/1) | 0.1 | 0.04 | 0.05 | repouso | adulto_representativo |
| Bichos-pau | SUP-BE-21-B | 2 (1/1) | 0.18 | 0.04 | 0.04 | repouso | adulto_representativo |
| Baratas | SUP-BE-22-B | 2 (1/1) | 0.05 | 0.025 | 0.015 | repouso | adulto_representativo |
| Aranhas | SUP-BE-23-B | 2 (1/1) | 0.1 | 0.1 | 0.04 | repouso | adulto_representativo |
| Escorpiões | SUP-BE-24-B | 2 (1/1) | 0.12 | 0.07 | 0.05 | repouso | adulto_representativo |
| Centopeias | SUP-BE-25-B | 2 (1/1) | 0.15 | 0.04 | 0.015 | repouso | adulto_representativo |
| Piolhos-de-cobra | SUP-BE-26-B | 2 (1/1) | 0.15 | 0.02 | 0.02 | repouso | adulto_representativo |
| Caracóis terrestres | SUP-BE-27-B | 2 (1/1) | 0.08 | 0.04 | 0.05 | repouso | adulto_representativo |
| Lesmas | SUP-BE-28-B | 2 (1/1) | 0.1 | 0.025 | 0.025 | repouso | adulto_representativo |
| Minhocas | SUP-BE-29-B | 2 (1/1) | 0.2 | 0.01 | 0.01 | repouso | adulto_representativo |

A contagem M/F é uma convenção editorial do protótipo para visualização dos grupos; não modela biologicamente colônias, castas, hermafroditismo ou reprodução.
