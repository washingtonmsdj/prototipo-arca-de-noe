# Desenvolvimento

## Requisitos

- Node.js 22 ou superior recomendado;
- npm.

## Executar

```bash
npm install
npm run dev
```

## Qualidade

```bash
npm run typecheck
npm test
npm run build
```

A GitHub Actions executa os mesmos comandos.

## Laboratório

1. escolha **Animal** ou **Humano**;
2. escolha **Pilgrimage original** ou **Arca simplificado**;
3. selecione espécie/preset;
4. selecione gait/clip;
5. ajuste velocidade;
6. pause;
7. mostre juntas;
8. use o editor de pose/rig no motor original;
9. gere atlas quando quiser congelar o estado atual em sprites.

## Editores

### Animal

Frame, junta, offsets, influência, cadência e contatos. Import/export JSON.

### Humano

Frame e junta respeitando a contagem real de cada clip. Import/export JSON.

## Bakers

Os painéis de bake são browser tools independentes do runtime.

**Humano:** gera color/depth/shadow + metadata de sockets para o clip atual.

**Animal:** gera color/depth/shadow + metadata de juntas para o animal/clip atual, tanto wildlife quanto transporte.

Trocar preset, espécie, clip ou edits invalida o resultado anterior. Progresso de um bake antigo não pode sobrescrever a seleção nova.


## Planejamento da fauna na arca

A escala e o alojamento são camadas separadas:

```text
concepts/arca/dimensoes-animais-jogo-v1.json
        ↓
src/arca/animalPlanning.ts
        ↓
concepts/arca/modulos-alojamento-base-v1.json
        ↓
src/arca/plannedEnclosures.ts
        ↓
enclosureLayout / render / colisão / placas
```

Não adicionar dimensões diretamente em componentes React nem criar baias manuais para corrigir um caso visual.

Para alterar uma espécie:

1. ajuste o envelope corporal, postura, estágio e forma de referência no catálogo de dimensões;
2. escolha/corrija a classe em `animalPlanning.ts` somente se o tipo de alojamento estiver errado;
3. deixe `plannedEnclosures.ts` recalcular o espaço;
4. valide com `npm test`.

O planejador deve falhar quando um grupo não couber. É proibido resolver falta de espaço aplicando `scale` escondido no runtime.

## Princípios

- corrigir a fonte, não mascarar sintomas;
- anatomia, locomoção, mundo e renderização desacoplados;
- `vendor/` é referência e não área de adaptação;
- portas ativas ficam em `src/pilgrimage/`;
- gameplay não entra só para satisfazer import;
- dependências temporárias são removidas após isolar o contrato correto;
- matemática e integração ganham testes;
- assets publicados futuramente devem ser versionados/imutáveis;
- evitar caminhos paralelos e legados sem função.
