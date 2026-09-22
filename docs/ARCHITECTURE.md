# Arquitetura

## Objetivo

O repositório é um laboratório independente para fauna e mundo. Não há dependência de modelos externos, Blender, Mixamo ou animações compradas para o núcleo funcionar.

A arquitetura separa cinco responsabilidades:

1. `species.ts` descreve anatomia e capacidades de cada espécie.
2. `gait.ts` produz contatos, passada, cadência e fase das patas.
3. `ik.ts` resolve a cadeia articular sem alterar o comprimento dos membros.
4. `Animal.tsx` aplica a pose ao rig visual e sincroniza a animação com distância.
5. `world/` fornece terreno e ambiente sem conhecer detalhes do rig.

## Regra central

Simulação não deve depender de frames de renderização. A distância percorrida determina a fase locomotora:

```
fase = distância_acumulada / comprimento_da_passada
```

Isso mantém a passada coerente quando FPS, velocidade ou escala mudam.

## Separação de dados e comportamento

Espécies comuns entram por dados. Um novo tipo de anatomia deve ganhar uma família de rig própria, em vez de acumular condicionais no quadrúpede genérico.

## Código local e upstream

A arquitetura possui duas camadas deliberadamente separadas:

- `vendor/pilgrimage/`: snapshot do código autorizado do Pilgrimage, preservado com procedência e licença;
- `src/`: integração e desenvolvimento ativo do Arca de Noé.

Não editar silenciosamente o snapshot para “fazê-lo funcionar”. Quando um módulo upstream for adaptado, a mudança deve acontecer na camada ativa e manter referência ao caminho/commit de origem. Isso torna claro o que é upstream e o que é evolução do Arca.
