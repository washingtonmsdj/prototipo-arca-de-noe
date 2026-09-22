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
6. pause quando necessário;
7. mostre juntas;
8. abra o editor quando estiver no motor original.

### Editor animal

Edita frame, junta, offsets, influência, cadência e contatos. Suporta import/export JSON.

### Editor humano

Edita qualquer clip original respeitando sua contagem real de frames. Suporta import/export JSON.

## Princípios

- corrigir a fonte, não mascarar sintomas;
- anatomia, locomoção, mundo e renderização desacoplados;
- não deformar comprimento de osso para alcançar alvo;
- comportamento específico isolado por capacidade/família;
- `vendor/` é referência, não área de adaptação;
- portas ativas ficam em `src/pilgrimage/`;
- não trazer gameplay apenas para satisfazer import;
- remover dependências temporárias quando o contrato isolado existir;
- adicionar testes para contratos matemáticos e de integração;
- evitar código legado, redirects internos e caminhos paralelos.

## Fluxo para nova funcionalidade

1. identificar algoritmo/contrato;
2. separar dependências de gameplay;
3. portar somente o núcleo técnico;
4. implementar adaptador Arca;
5. adicionar teste;
6. conectar ao laboratório;
7. revisar visualmente;
8. validar em terreno inclinado;
9. documentar mudança arquitetural.
