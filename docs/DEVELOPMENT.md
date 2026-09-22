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

Antes de integrar mudanças:

```bash
npm run typecheck
npm test
npm run build
```

A CI executa os mesmos comandos.

## Princípios

- corrigir a fonte do problema, não mascarar sintomas;
- manter anatomia, locomoção, mundo e renderização desacoplados;
- nenhuma animação deve depender exclusivamente de FPS;
- não alterar comprimento de membros para alcançar um alvo;
- novas espécies entram por dados sempre que possível;
- comportamento específico deve ficar isolado por capacidade, não espalhado pelo renderer;
- assets publicados no futuro devem ser versionados e imutáveis;
- evitar código legado, redirects internos e caminhos paralelos sem necessidade.

## Fluxo para nova funcionalidade

1. definir contrato;
2. implementar matemática pura;
3. adicionar teste;
4. conectar ao rig;
5. revisar visualmente no laboratório;
6. validar no mundo com terreno inclinado;
7. documentar decisões que alterem arquitetura.
