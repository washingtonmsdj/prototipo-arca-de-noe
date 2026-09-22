# Dimensões dos animais — revisão zoológica 5 / proporção v3

Este é o cadastro corporal usado pelo protótipo da Arca: **162 grupos e 1080 indivíduos de referência**.

A revisão v3 removeu o antigo padrão de blocos genéricos: os **162 grupos possuem 162 envelopes dimensionais distintos**, definidos a partir de uma forma animal de referência, estágio de vida e postura. Isso não implica precisão biométrica absoluta; os registros continuam marcados como confiança alta ou média.

## Regras

- comprimento, largura e altura descrevem a postura indicada;
- comprimento corporal nunca vira altura;
- asas abertas, caudas erguidas e postura bípede ocasional não definem automaticamente a caixa de repouso;
- grupos grandes podem usar jovens independentes quando isso estiver explicitamente registrado;
- não existe `scale` oculto no componente de renderização;
- medidas de confiança alta mantêm `adult_reference` e fonte curada no JSON;
- medidas de confiança média são envelopes de modelagem individualizados e devem ser promovidas somente após pesquisa específica.

Fontes executáveis: `dimensoes-animais-jogo-v1.json` (versão 5), `animalPlanning.ts`, `modulos-alojamento-base-v1.json` e `plannedEnclosures.ts`.

Grupos atualmente com referência curada de alta confiança: Rinocerontes, Hipopotamos, Zebras, Camelos, Bisoes, Girafas, Alces, Ursos-pardos, Ursos-negros, Porcos, Vombates, Capivaras, Tamanduas, Avestruzes, Casuares, Cisnes.

## Catálogo completo

| Grupo | Forma de referência | Estágio | Postura | Comp. m | Larg. m | Alt. m | Confiança |
|---|---|---|---|---:|---:|---:|---|
| Elefantes | Elefante-africano-da-savana | jovem independente | quadrupede | 3 | 1.4 | 2.6 | média |
| Rinocerontes | Rinoceronte-branco | jovem independente | quadrupede | 3 | 1.3 | 1.7 | alta |
| Hipopotamos | Hipopótamo-comum | jovem independente | quadrupede | 3 | 1.4 | 1.5 | alta |
| Tapires | Anta-sul-americana | adulto | quadrupede | 2 | 0.8 | 1.1 | média |
| Cavalos | Cavalo doméstico | adulto | quadrupede | 2.4 | 0.8 | 1.6 | média |
| Asnos | Asno doméstico | adulto | quadrupede | 2 | 0.7 | 1.3 | média |
| Zebras | Zebra-das-planícies | adulto | quadrupede | 2.3 | 0.8 | 1.5 | alta |
| Camelos | Camelo-bactriano | adulto | quadrupede | 3.3 | 0.95 | 2.1 | alta |
| Bovinos | Bovino doméstico | jovem independente | quadrupede | 2.1 | 0.85 | 1.5 | média |
| Bufalos | Búfalo-asiático | jovem independente | quadrupede | 2.4 | 0.9 | 1.6 | média |
| Bisoes | Bisão-americano | jovem independente | quadrupede | 2.6 | 0.9 | 1.55 | alta |
| Iaques | Iaque | jovem independente | quadrupede | 2.2 | 0.85 | 1.5 | média |
| Girafas | Girafa | jovem independente | quadrupede | 2 | 0.75 | 2.9 | alta |
| Alces | Alce | jovem independente | quadrupede | 2.1 | 0.8 | 1.6 | alta |
| Renas | Rena | jovem independente | quadrupede | 1.8 | 0.7 | 1.3 | média |
| Cervos | Veado-vermelho | jovem independente | quadrupede | 1.6 | 0.65 | 1.2 | média |
| Ovelhas | Ovelha doméstica | adulto | quadrupede | 1.3 | 0.5 | 0.9 | média |
| Cabras | Cabra doméstica | adulto | quadrupede | 1.2 | 0.5 | 0.9 | média |
| Ibex | Íbex-alpino | adulto | quadrupede | 1.4 | 0.5 | 1 | média |
| Gazelas | Gazela de porte médio | adulto | quadrupede | 1.2 | 0.45 | 0.9 | média |
| Orix | Órix/gemsbok | adulto | quadrupede | 1.6 | 0.55 | 1.2 | média |
| Impala | Impala | adulto | quadrupede | 1.3 | 0.45 | 0.95 | média |
| Kudu | Kudu-maior | adulto | quadrupede | 1.7 | 0.55 | 1.3 | média |
| Gnus | Gnu-azul | adulto | quadrupede | 1.8 | 0.65 | 1.3 | média |
| Gorilas | Gorila-ocidental | adulto | apoio_quadrupede | 1.3 | 0.7 | 1.1 | média |
| Chimpanzes | Chimpanzé | adulto | apoio_quadrupede | 1 | 0.55 | 0.9 | média |
| Leoes | Leão | adulto | quadrupede | 2 | 0.7 | 1 | média |
| Tigres | Tigre | adulto | quadrupede | 2.2 | 0.75 | 1.05 | média |
| Leopardos | Leopardo | adulto | quadrupede | 1.6 | 0.55 | 0.8 | média |
| Jaguares | Onça-pintada | adulto | quadrupede | 1.7 | 0.6 | 0.85 | média |
| Pumas | Puma | adulto | quadrupede | 1.55 | 0.6 | 0.78 | média |
| Guepardos | Guepardo | adulto | quadrupede | 1.5 | 0.5 | 0.8 | média |
| Ursos-pardos | Urso-pardo | adulto | quadrupede | 2.1 | 0.9 | 1.1 | alta |
| Ursos-negros | Urso-negro-americano | adulto | quadrupede | 1.7 | 0.7 | 0.9 | alta |
| Lobos | Lobo-cinzento | adulto | quadrupede | 1.4 | 0.5 | 0.8 | média |
| Raposas | Raposa-vermelha | adulto | quadrupede | 0.9 | 0.35 | 0.45 | média |
| Hienas | Hiena-malhada | adulto | quadrupede | 1.5 | 0.5 | 0.85 | média |
| Chacais | Chacal-de-dorso-negro | adulto | quadrupede | 0.95 | 0.35 | 0.5 | média |
| Porcos | Porco doméstico | adulto | quadrupede | 1.5 | 0.65 | 0.8 | alta |
| Javalis | Javali | adulto | quadrupede | 1.5 | 0.65 | 0.85 | média |
| Cangurus | Canguru-vermelho | adulto | ereto_relaxado | 1.8 | 0.6 | 1.6 | média |
| Vombates | Vombate-comum | adulto | quadrupede | 1 | 0.45 | 0.4 | alta |
| Capivaras | Capivara | adulto | quadrupede | 1.2 | 0.5 | 0.5 | alta |
| Tamanduas | Tamanduá-bandeira | adulto | quadrupede | 2.1 | 0.55 | 0.65 | alta |
| Avestruzes | Avestruz-comum | adulto | ereto | 1.05 | 0.55 | 2.2 | alta |
| Emas | Ema | adulto | ereto | 1 | 0.5 | 1.75 | média |
| Babuinos | Babuíno-oliva | adulto | quadrupede | 1 | 0.45 | 0.8 | média |
| Macacos | Macaco de porte pequeno/médio | adulto | quadrupede | 0.8 | 0.4 | 0.7 | média |
| Pombos | Pombo-da-rocha/doméstico | adulto | ereto_pousado | 0.35 | 0.18 | 0.28 | média |
| Corvos | Corvo-comum | adulto | ereto_pousado | 0.5 | 0.22 | 0.35 | média |
| Galinhas | Galinha doméstica | adulto | ereto_pousado | 0.5 | 0.25 | 0.45 | média |
| Perdizes | Perdiz de porte médio | adulto | ereto_pousado | 0.35 | 0.18 | 0.3 | média |
| Pavoes | Pavão-indiano | adulto | ereto_pousado | 1.5 | 0.4 | 1 | média |
| Patos | Pato doméstico/de porte médio | adulto | ereto_pousado | 0.55 | 0.25 | 0.4 | média |
| Marrecos | Marreco de porte médio | adulto | ereto_pousado | 0.4 | 0.2 | 0.3 | média |
| Araras | Arara de grande porte | adulto | ereto_pousado | 0.8 | 0.25 | 0.5 | média |
| Cacatuas | Cacatua de porte médio | adulto | ereto_pousado | 0.5 | 0.22 | 0.45 | média |
| Pica-paus | Pica-pau de porte médio | adulto | ereto_pousado | 0.3 | 0.15 | 0.25 | média |
| Poupas | Poupa-eurasiática | adulto | ereto_pousado | 0.3 | 0.14 | 0.25 | média |
| Andorinhoes | Andorinhão de porte médio | adulto | ereto_pousado | 0.2 | 0.12 | 0.14 | média |
| Pardais | Pardal-doméstico | adulto | ereto_pousado | 0.16 | 0.08 | 0.12 | média |
| Canarios | Canário | adulto | ereto_pousado | 0.14 | 0.07 | 0.11 | média |
| Aguias | Águia de grande porte | adulto | ereto_pousado | 0.9 | 0.4 | 0.8 | média |
| Cegonhas | Cegonha-branca | adulto | ereto_pousado | 1 | 0.4 | 1.2 | média |
| Pelicanos | Pelicano de grande porte | adulto | ereto_pousado | 1.4 | 0.5 | 1.15 | média |
| Grous | Grou de grande porte | adulto | ereto_pousado | 1.2 | 0.45 | 1.35 | média |
| Cucos | Cuco-comum | adulto | ereto_pousado | 0.34 | 0.17 | 0.28 | média |
| Corujas-pequenas | Coruja de pequeno porte | adulto | ereto_pousado | 0.3 | 0.2 | 0.25 | média |
| Coelhos | Coelho-europeu | adulto | quadrupede | 0.5 | 0.3 | 0.35 | média |
| Hiraxes | Hírax-das-rochas | adulto | quadrupede | 0.5 | 0.3 | 0.3 | média |
| Marmotas | Marmota | adulto | quadrupede | 0.6 | 0.3 | 0.35 | média |
| Porcos-espinhos | Porco-espinho de grande porte | adulto | quadrupede | 0.7 | 0.4 | 0.45 | média |
| Porquinhos-da-india | Porquinho-da-índia | adulto | quadrupede | 0.3 | 0.18 | 0.15 | média |
| Gerbos | Gerbil-mongol | adulto | quadrupede | 0.15 | 0.07 | 0.08 | média |
| Ratos | Rato-marrom | adulto | quadrupede | 0.25 | 0.12 | 0.12 | média |
| Toupeiras | Toupeira-europeia | adulto | quadrupede | 0.16 | 0.08 | 0.08 | média |
| Texugos | Texugo-europeu | adulto | quadrupede | 0.85 | 0.4 | 0.35 | média |
| Mangustos | Mangusto de porte médio | adulto | quadrupede | 0.55 | 0.2 | 0.25 | média |
| Jabutis | Jabuti/tartaruga terrestre de porte médio | adulto | quadrupede | 0.5 | 0.35 | 0.25 | média |
| Iguanas | Iguana-verde | adulto | quadrupede | 1.2 | 0.35 | 0.35 | média |
| Teius | Teiú de grande porte | adulto | quadrupede | 1.2 | 0.3 | 0.3 | média |
| Camaleoes | Camaleão de porte médio | adulto | quadrupede | 0.4 | 0.15 | 0.18 | média |
| Escincos | Escinco de porte médio | adulto | quadrupede | 0.3 | 0.1 | 0.1 | média |
| Pitons | Píton de porte médio em repouso | adulto | enrodado_relaxado | 0.9 | 0.6 | 0.25 | média |
| Viboras | Víbora de porte médio em repouso | adulto | enrodado_relaxado | 0.6 | 0.3 | 0.2 | média |
| Crocodilianos | Crocodiliano jovem independente | jovem independente | quadrupede | 1.8 | 0.6 | 0.4 | média |
| Sapos | Sapo de grande porte | adulto | repouso | 0.15 | 0.12 | 0.1 | média |
| Salamandras | Salamandra de porte médio | adulto | repouso | 0.2 | 0.08 | 0.05 | média |
| Rolinhas | Rolinha | adulto | ereto_pousado | 0.3 | 0.16 | 0.25 | média |
| Gralhas | Gralha | adulto | ereto_pousado | 0.42 | 0.2 | 0.32 | média |
| Codornas | Codorna | adulto | ereto_pousado | 0.25 | 0.14 | 0.22 | média |
| Faisoes | Faisão | adulto | ereto_pousado | 0.8 | 0.3 | 0.5 | média |
| Perus | Peru doméstico | adulto | ereto_pousado | 1 | 0.5 | 0.9 | média |
| Gansos | Ganso | adulto | ereto_pousado | 0.85 | 0.38 | 0.7 | média |
| Papagaios | Papagaio de porte médio | adulto | ereto_pousado | 0.4 | 0.2 | 0.35 | média |
| Periquitos | Periquito | adulto | ereto_pousado | 0.25 | 0.12 | 0.18 | média |
| Tucanos | Tucano | adulto | ereto_pousado | 0.6 | 0.25 | 0.4 | média |
| Martins-pescadores | Martim-pescador | adulto | ereto_pousado | 0.27 | 0.13 | 0.18 | média |
| Andorinhas | Andorinha | adulto | ereto_pousado | 0.18 | 0.1 | 0.12 | média |
| Cotovias | Cotovia | adulto | ereto_pousado | 0.18 | 0.1 | 0.14 | média |
| Tentilhoes | Tentilhão | adulto | ereto_pousado | 0.15 | 0.08 | 0.12 | média |
| Pintassilgos | Pintassilgo | adulto | ereto_pousado | 0.13 | 0.07 | 0.11 | média |
| Abutres | Abutre de grande porte | adulto | ereto_pousado | 1 | 0.5 | 0.85 | média |
| Garcas | Garça de grande porte | adulto | ereto_pousado | 1 | 0.4 | 1 | média |
| Cormoroes | Cormorão | adulto | ereto_pousado | 0.9 | 0.35 | 0.7 | média |
| Flamingos | Flamingo | adulto | ereto_pousado | 1 | 0.4 | 1.4 | média |
| Beija-flores | Beija-flor | adulto | ereto_pousado | 0.1 | 0.05 | 0.08 | média |
| Falcoes-pequenos | Falcão de pequeno porte | adulto | ereto_pousado | 0.5 | 0.25 | 0.4 | média |
| Lebres | Lebre | adulto | quadrupede | 0.6 | 0.3 | 0.4 | média |
| Esquilos | Esquilo | adulto | quadrupede | 0.35 | 0.18 | 0.25 | média |
| Castores | Castor | adulto | quadrupede | 0.85 | 0.4 | 0.4 | média |
| Chinchilas | Chinchila | adulto | quadrupede | 0.3 | 0.18 | 0.2 | média |
| Hamsters | Hamster | adulto | quadrupede | 0.18 | 0.1 | 0.1 | média |
| Camundongos | Camundongo | adulto | quadrupede | 0.12 | 0.06 | 0.07 | média |
| Musaranhos | Musaranho | adulto | quadrupede | 0.1 | 0.05 | 0.05 | média |
| Ouricos | Ouriço-cacheiro | adulto | quadrupede | 0.25 | 0.15 | 0.15 | média |
| Furoes | Furão | adulto | quadrupede | 0.5 | 0.15 | 0.18 | média |
| Morcegos | Morcego de porte médio | adulto | pousado | 0.2 | 0.1 | 0.12 | média |
| Tartarugas-semiaquaticas | Tartaruga semiaquática de porte médio | adulto | repouso | 0.4 | 0.3 | 0.2 | média |
| Varanos | Varano de porte médio/grande | adulto | quadrupede | 1.2 | 0.35 | 0.3 | média |
| Agamas | Agama | adulto | quadrupede | 0.3 | 0.12 | 0.12 | média |
| Lagartixas | Lagartixa | adulto | quadrupede | 0.2 | 0.1 | 0.08 | média |
| Jiboias | Jiboia em repouso | adulto | enrodado_relaxado | 0.8 | 0.6 | 0.25 | média |
| Cobras-nao-peconhentas | Serpente não peçonhenta de porte médio | adulto | enrodado_relaxado | 0.6 | 0.3 | 0.15 | média |
| Najas | Naja em repouso | adulto | enrodado_relaxado | 0.6 | 0.4 | 0.25 | média |
| Ras | Rã de grande porte | adulto | repouso | 0.12 | 0.1 | 0.08 | média |
| Pererecas | Perereca | adulto | repouso | 0.08 | 0.07 | 0.06 | média |
| Cecilias | Cecília | adulto | repouso | 0.4 | 0.08 | 0.08 | média |
| Preguiças | Preguiça de porte médio | adulto | quadrupede_suspenso_referencia | 0.7 | 0.45 | 0.55 | média |
| Tatus | Tatu de porte médio | adulto | quadrupede | 0.8 | 0.35 | 0.35 | média |
| Pandas | Panda-gigante | adulto | quadrupede | 1.5 | 0.75 | 0.85 | média |
| Coalas | Coala | adulto | quadrupede | 0.7 | 0.4 | 0.6 | média |
| Lêmures | Lêmure de porte médio | adulto | quadrupede | 0.8 | 0.3 | 0.45 | média |
| Lontras | Lontra de porte médio | adulto | quadrupede | 1 | 0.3 | 0.3 | média |
| Suricatos | Suricato | adulto | quadrupede | 0.4 | 0.15 | 0.3 | média |
| Ocapis | Ocapi | adulto | quadrupede | 2.1 | 0.75 | 1.7 | média |
| Pangolins | Pangolim de porte médio | adulto | quadrupede | 1 | 0.3 | 0.35 | média |
| Porcos-formigueiros | Porco-formigueiro | adulto | quadrupede | 1.3 | 0.45 | 0.65 | média |
| Pinguins | Pinguim de porte médio | adulto | ereto_pousado | 0.5 | 0.35 | 0.8 | média |
| Kiwis | Kiwi | adulto | ereto_pousado | 0.45 | 0.25 | 0.4 | média |
| Casuares | Casuar-do-sul | adulto | ereto_pousado | 0.95 | 0.45 | 1.65 | alta |
| Cisnes | Cisne-mudo | adulto | ereto_pousado | 1.4 | 0.5 | 0.85 | alta |
| Turacos | Turaco de porte médio | adulto | ereto_pousado | 0.45 | 0.2 | 0.3 | média |
| Formigas | Formiga de grande porte para leitura visual | adulto | repouso | 0.012 | 0.004 | 0.006 | média |
| Abelhas | Abelha | adulto | repouso | 0.02 | 0.01 | 0.012 | média |
| Vespas | Vespa | adulto | repouso | 0.025 | 0.012 | 0.015 | média |
| Cupins | Cupim | adulto | repouso | 0.008 | 0.003 | 0.004 | média |
| Besouros | Besouro de grande porte | adulto | repouso | 0.06 | 0.03 | 0.025 | média |
| Borboletas | Borboleta de grande porte | adulto | repouso | 0.06 | 0.12 | 0.03 | média |
| Mariposas | Mariposa de grande porte | adulto | repouso | 0.06 | 0.1 | 0.03 | média |
| Gafanhotos | Gafanhoto de grande porte | adulto | repouso | 0.08 | 0.03 | 0.04 | média |
| Grilos | Grilo | adulto | repouso | 0.04 | 0.02 | 0.025 | média |
| Louva-a-deus | Louva-a-deus de grande porte | adulto | repouso | 0.1 | 0.04 | 0.05 | média |
| Bichos-pau | Bicho-pau de grande porte | adulto | repouso | 0.18 | 0.04 | 0.04 | média |
| Baratas | Barata de grande porte | adulto | repouso | 0.05 | 0.025 | 0.015 | média |
| Aranhas | Aranha de grande porte | adulto | repouso | 0.1 | 0.1 | 0.04 | média |
| Escorpiões | Escorpião de grande porte | adulto | repouso | 0.12 | 0.07 | 0.05 | média |
| Centopeias | Centopeia de grande porte | adulto | repouso | 0.15 | 0.04 | 0.015 | média |
| Piolhos-de-cobra | Diplópode de grande porte | adulto | repouso | 0.15 | 0.02 | 0.02 | média |
| Caracóis terrestres | Caracol terrestre de grande porte | adulto | repouso | 0.08 | 0.04 | 0.05 | média |
| Lesmas | Lesma de grande porte | adulto | repouso | 0.1 | 0.025 | 0.025 | média |
| Minhocas | Minhoca de grande porte | adulto | repouso | 0.2 | 0.01 | 0.01 | média |

## Alojamento

A dimensão do animal não contém ID de baia. O planejador recebe os 128 módulos estruturais e recalcula os 162 alojamentos de acordo com a classe: baia grande, rebanho, baia média, viveiro, recinto pequeno, gaiola, terrário, microterrário ou insetário.

O espaço residual recebe função de alimento, água, manejo, limpeza, circulação ou ventilação. Consulte `planejamento-alojamento-v1.md`.

> Reconstrução interpretativa para jogo: o texto bíblico não fornece uma planta zoológica detalhada, idades, espécies modernas equivalentes nem metragem de cada alojamento.
