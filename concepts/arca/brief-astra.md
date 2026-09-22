# Arca de Noé — briefing para Blender

## Referência atual — versão 3

Para continuar a modelagem, usar `arca-recintos-v3.blend`, `mapa-recintos-v3.md` e `catalogo-recintos-v3.json`. O concept orienta a aparência; as medidas e posições atualizadas estão na V3. Nesta etapa trabalhar somente em blocagem 3D, sem texturas ou integração no jogo.

A V3 preserva 128 grupos editoriais e 952 animais previstos, amplia viveiros grandes, compacta pequenos recintos em duas fileiras com corredor próprio, acrescenta contenção e áreas de manejo/suprimentos. Os envelopes de assets juvenis são hipóteses artísticas, não tamanhos reais validados. A contagem não comprova capacidade. Não aumentar a população antes de dimensionar crescimento, habitats, percursos e suprimentos. O mapa V3 detalha essas pendências.

As instruções abaixo permanecem como contexto inicial; em caso de divergência sobre o interior, prevalece o mapa V3.

Modele uma arca explorável para jogo 3D usando `arca-concept-v1.png` como referência artística e as medidas abaixo como autoridade geométrica. Entregue o arquivo .blend organizado e uma exportação GLB para o projeto React Three Fiber. Não altere o jogo nesta etapa.

## Base textual e limites

- Gênesis 6:14–16: madeira de gofer (identificação botânica incerta), compartimentos, revestimento de betume por dentro e por fora, 300 × 50 × 30 côvados, três pavimentos e porta lateral.
- Escala de trabalho escolhida: côvado de 0,45 m. Dimensões: 135 × 22,5 × 13,5 m. Esta conversão é uma convenção do projeto, não uma medida histórica exata.
- Gênesis 7:2–3: adotar a tradução de sete pares por tipo de animal puro, um casal por tipo impuro e sete pares por tipo de ave. Há traduções que apresentam a expressão dos puros como “sete”; registrar a leitura adotada.
- Não equiparar automaticamente “tipo” bíblico a espécie biológica moderna. Não há catálogo completo ou total de animais no relato. A capacidade depende de um catálogo de jogo ainda a definir.
- Formato detalhado do casco, cobertura, ventilação contínua, rampas, distribuição dos animais, depósitos e alojamentos são interpretações para o jogo. Não apresentar como reconstrução arqueológica comprovada.

## Direção visual e modelagem

Arca longa, de madeira, com extremidades rombas e fundo suavemente arredondado. Proporção comprimento/largura de 6:1. Exatamente três pavimentos internos, cobertura baixa, porta lateral e rampa externa. Estrutura de vigas, tábuas, cavilhas e juntas com betume. Aparência realista, com escala humana legível.

Use unidades métricas, 1 unidade = 1 metro. Eixo longitudinal X, largura Y, vertical Z; origem central na base. Faça primeiro o volume de 135 × 22,5 × 13,5 m, descontando estruturas ao calcular espaços úteis. Resolva a altura da cobertura dentro do envelope adotado e documente essa escolha. Não infira medidas pela perspectiva da prancha.

Crie coleções separadas para casco, estrutura, cada pavimento, cobertura, acessos, baias, viveiros, depósitos e objetos. Cobertura e laterais removíveis para inspeção; o corte da prancha não é uma abertura permanente do casco.

## Interior proposto

- Inferior: baias maiores, animais pesados e depósitos. Recintos de predadores devem ter contenção apropriada.
- Intermediário: módulos de baias ajustáveis e armazenamento. Grupos de animais puros recebem capacidade para 14 indivíduos por tipo, não apenas sete baias no navio inteiro.
- Superior: aves em viveiros fechados, pequenos animais, mantimentos e acomodação para oito pessoas. Cavalos ou outros animais grandes mostrados nesse nível na imagem são ilustrativos: não copiar essa inconsistência.
- Corredores de serviço contínuos, cochos acessíveis, portões funcionais, ventilação e acesso a todos os recintos. Água, alimentos, resíduos e circulação precisam de espaço reservado.
- Definir rampas e vãos com base no maior animal do catálogo; não aceitar uma rampa apenas porque parece caber no desenho. Verificar inclinação, patamares, altura livre e área para manobrar.
- Usar módulos instanciados de estrutura e baias, materiais PBR reutilizáveis e colisões simples. Separar peças interativas e manter nomes claros.

## Capacidade e validação

Não afirmar que todos os animais cabem antes do estudo de ocupação. Criar inventário por tipo, classe (puro/impuro/ave), quantidade, dimensões corporais, recinto, área, altura livre e pavimento. A soma de recintos, circulação, estrutura e armazenamento deve caber nos três pavimentos. A área bruta idealizada é 9.112,5 m² (135 × 22,5 × 3); a área útil é menor devido ao casco e estruturas.

Entregar blockout cotado, plantas dos três níveis, vista exterior, corte interno e uma baia detalhada. Validar escala humana, acesso, colisões, folgas e consistência entre plantas e modelo antes de detalhar a madeira. O concept é referência artística, não planta executiva nem validação naval.

## Fontes

- https://www.biblegateway.com/passage/?search=Genesis+6%3A14-7%3A5&version=ESV%3BNIV
- https://www.esv.org/Genesis%2B6%3A11%E2%80%9322%3BGenesis%2B7%3A1%E2%80%9316/

Imagem gerada com a ferramenta integrada image_gen; o seletor não expõe nome ou versão do modelo. Prompt integral em `image-prompt.txt`.
