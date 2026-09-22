# Planejamento de alojamento da fauna — v1

O interior da arca não usa mais uma relação rígida **“uma baia antiga = um grupo animal”**. Essa abordagem produzia exatamente o problema visível na prévia: algumas espécies ocupavam salas enormes, enquanto outras ficavam apertadas.

## Arquitetura atual

```text
dimensoes-animais-jogo-v1.json
        ↓ espécie/tipo, estágio, postura e envelope
animalPlanning.ts
        ↓ classe de alojamento e regra de área/forma
modulos-alojamento-base-v1.json
        ↓ 128 volumes estruturais reais disponíveis
plannedEnclosures.ts
        ↓ empacotamento determinístico
162 alojamentos + áreas de serviço
```

Os **128 módulos estruturais** vêm da geometria interna da arca e permanecem como limites que o planejador não pode ultrapassar. Dentro deles, o runtime cria 162 alojamentos proporcionais aos respectivos grupos.

O empacotamento também trata **acesso** como requisito estrutural. Não basta uma baia caber sem sobreposição: ela precisa ter uma rota de manejo. Nos módulos normais, as baias ficam lado a lado com frente direta para o corredor central. Nos módulos estreitos e profundos do terceiro pavimento, o planejador pode reservar uma **espinha lateral de serviço** de 0,45 m; as baias se conectam a essa passagem, que por sua vez se conecta ao corredor principal.

## Classes de alojamento

O sistema diferencia:

- baia grande para mamíferos grandes;
- baia de rebanho;
- baia média;
- viveiro grande;
- viveiro compacto;
- recinto de pequeno mamífero;
- gaiola compacta;
- terrário;
- microterrário;
- insetário.

Cada classe possui taxa-alvo de ocupação corporal, área mínima, lado mínimo, limite de proporção comprimento/largura e altura de contenção. As taxas foram normalizadas para reduzir diferenças visuais injustificadas entre espécies; densidade maior só é permitida quando a quantidade do grupo permite compartilhar circulação, como nos grandes rebanhos. Portanto uma formiga não recebe uma sala do tamanho de uma baia de porco, e um crocodiliano não é encaixado na mesma regra de um sapo.

## Espaço que sobra

Espaço residual não pode aparecer como salão vazio. O planejador separa deliberadamente **área animal** e **área de serviço**, e o runtime distribui os indivíduos por aproximadamente 82% da zona animal em vez de agrupá-los no centro.

Nos recintos de mamíferos, o runtime mostra cocho em uma borda e área seca de descanso na borda oposta. Entre elas permanece circulação. Aves recebem poleiros; terrários, gaiolas e insetários recebem bases próprias; espécies úmidas recebem área úmida.

O espaço restante dos módulos só é convertido em zona de serviço quando forma uma região acessível e não sobreposta às baias. A passagem lateral dos módulos estreitos é sempre classificada como **circulação**. O restante acessível é reservado explicitamente para:

- alimento;
- água;
- manejo;
- limpeza;
- circulação;
- ventilação.

`ServiceZones.tsx` torna essas zonas visíveis na prévia. `HousingFixtures.tsx` adiciona leitura funcional aos alojamentos: cochos para mamíferos, poleiros para aves, bases para gaiolas/terrários/insetários e áreas úmidas simplificadas quando aplicável.

## Regras de validade

O layout só é aceito quando os testes comprovam simultaneamente que:

- existem 162 grupos;
- existem 1.080 blocos individuais;
- nenhum grupo está fora da arca;
- cada grupo recebe exatamente um alojamento planejado;
- todo alojamento permanece dentro de um dos 128 módulos estruturais;
- alojamentos do mesmo módulo não se sobrepõem;
- cada indivíduo cabe integralmente nos bounds do seu alojamento;
- a ocupação corporal máxima permanece abaixo do limite definido;
- existem áreas de serviço remanescentes;
- toda baia possui acesso direto ao corredor central ou a uma espinha de serviço;
- as zonas de serviço não ocupam o piso reservado aos animais;
- o planejamento evita concentrar muitas baias em poucos módulos: no estado atual há no máximo 1 baia por módulo no primeiro pavimento, 3 no segundo (uma única exceção tripla) e 2 no terceiro; os 128 módulos estruturais permanecem em uso.

As antigas cercas/baias exportadas do Blender são ocultadas no runtime. Elas não controlam mais o posicionamento nem a colisão. O `.blend` continua sendo fonte de autoria da estrutura da arca, enquanto a divisão interna passa a ser recalculável.

## Interpretação

Este planejamento busca uma arca que **pareça deliberadamente organizada**, em vez de uma coleção de caixas iguais. É uma reconstrução de jogo. O texto bíblico não fornece planta detalhada de baias, espécies representativas, idades ou metragem por animal; por isso essas escolhas são declaradas como decisões de projeto, e não como descrição histórica comprovada.
