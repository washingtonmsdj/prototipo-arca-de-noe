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
