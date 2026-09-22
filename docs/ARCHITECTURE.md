# Arquitetura

## Objetivo

O repositório é um laboratório para estudar, portar e evoluir geração procedural de mundo, animais e pessoas sem importar o gameplay completo do upstream.

## Três camadas

### 1. Snapshot upstream — `vendor/pilgrimage/`

Fonte de referência preservada, com licença e procedência. Não é a camada de adaptação do Arca.

### 2. Runtime upstream isolado — `src/pilgrimage/`

Porta apenas o núcleo técnico necessário:

- `wildlife/`: anatomia, gaits, malhas e rig edits;
- `transport/`: equinos/bovino, pelagens e rigs;
- `world/`: woodland, água, terreno e utilitários mínimos;
- `transport-core.ts` e `transport-animal-pose.ts`: contratos compartilhados sem gameplay.

Quando um arquivo upstream puxa população, construções, economia ou simulação sem necessidade técnica, a dependência é cortada nesta camada por um contrato explícito.

### 3. Arca — `src/animals/`, `src/humans/`, `src/world/`, `src/dev/`

Contém motores próprios, adaptadores React/Three, integração com terreno, laboratório, editores e futuras melhorias.

## Regra de dependência

```text
vendor/pilgrimage
       ↓
src/pilgrimage
       ↓
src/animals | src/humans | src/world | src/dev
       ↓
App
```

O fluxo não deve inverter. `vendor/` não conhece o Arca e `src/pilgrimage/` não deve adquirir dependências de gameplay não utilizado.

## Locomoção

O motor próprio do Arca usa distância percorrida como fonte de fase:

```text
fase = distância_acumulada / comprimento_da_passada
```

No laboratório original os rigs podem ser reproduzidos estacionários por tempo ou congelados em um frame para edição. Sincronização espacial pertence à camada de movimento.

## Qualidade

- anatomia e renderização separadas;
- comprimentos de ossos não mudam para alcançar alvos;
- espécies comuns entram por dados;
- famílias anatômicas diferentes recebem rigs próprios;
- nenhuma dependência de gameplay é mantida só para satisfazer imports;
- todo port upstream mantém procedência;
- CI valida typecheck, testes e build.
