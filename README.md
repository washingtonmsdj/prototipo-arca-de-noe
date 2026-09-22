# Protótipo Arca de Noé

Laboratório técnico de **mundo + fauna + humanos + animação procedural**, combinando desenvolvimento próprio do Arca de Noé com uma importação autorizada do núcleo técnico do Pilgrimage.

O objetivo desta fase é dominar e evoluir geração, rig, animação e bake antes de adicionar gameplay completo e a arca propriamente dita.

## Runtime 3D da arca

O projeto usa **Three.js via React Three Fiber**. A página `/arca` apresenta o exterior v9 exportado do Blender, com terreno, câmera orbital e porta interativa. A home `/` preserva o laboratório original e seu botão `Abrir arca 3D` acessa essa página.

A prévia finalizada e o futuro modo de construção são independentes: a primeira carrega `arca-exterior-runtime-v1.glb`; o kit modular legado fica reservado para o segundo e ainda requer correção de transformações. Não há gameplay de construção implementado. A animação interativa da porta usa a dobradiça exportada, independentemente do progresso da obra. Os materiais atuais são PBR básicos; o relevo procedural de madeira do Blender ainda não foi convertido em texturas web. O GLB exterior ainda exige otimização para produção. Esta alteração não foi validada com build ou testes de navegador.

Os assets publicados ficam em `public/assets/arca/` e seu contrato está em `public/assets/arca/manifest.json`. Os `.blend` e briefs em `concepts/arca/` continuam sendo fontes de autoria; os GLBs são os artefatos de runtime. A unidade é metro, o eixo é Y-up e a cena usa nomes estáveis para permitir colisões, LOD e gameplay de construção nas próximas etapas.

## Estado atual

### Mundo procedural

O mundo ativo usa uma porta isolada dos sistemas de geração do Pilgrimage:

- woodland/darkwood/clareiras por seed;
- rios e lagos por seed;
- profundidade de água e direção de fluxo;
- elevação procedural;
- drenagem/hidrologia;
- superfícies de água por altura drenada;
- movimento de corrente e quedas orientado pela hidrologia;
- praias físicas + shoreline diagonal recíproca;
- slopes e cliff masks;
- paredes 3D para desníveis de cliff;
- floresta instanciada;
- loops de caminhada validados contra água, floresta e cliffs;
- laboratório central colocado automaticamente em área seca e passável.

Não usamos mais o antigo rio senoidal nem trajetos ambientes cegos.

### Animais

Há dois motores comparáveis no laboratório.

**Pilgrimage original isolado**:

- wildlife: cervo, ovelha, cabra, coelho, javali, raposa, falcão, pardal, galinhas e galo;
- transporte: jumento, cavalo comum, cavalo nobre e boi;
- anatomia/malha procedural;
- gaits, IK e ações originais;
- editor de rig por frame/junta;
- pelagens dos animais de transporte;
- cadência e passada por gait original;
- movimento em mundo sincronizado por distância;
- uma pata/hoof de suporte estabilizada em curvas;
- bake modular por clip com 8 direções, color/depth/shadow e metadata de juntas;
- LOD entre rig 3D e sprite/depth com fase/posição compartilhadas;
- modo automático por distância com histerese.

**Arca simplificado**:

- quadrúpede próprio para experimentação;
- morfologia por espécie;
- IK de duas articulações;
- passada sincronizada por distância.

### Humanos

**Pilgrimage original**:

- `createBasePersonRig()` executado diretamente;
- presets originais;
- 19 clips originais;
- editor visual de pose por frame/junta;
- sockets + attachments compartilhados entre preview e bake;
- caminhada no mundo por distância + foot lock;
- blend entre clips incluindo deformação da roupa;
- bake por clip em 8 direções;
- saída de color atlas, depth atlas, shadow atlas e metadata com sockets;
- LOD entre rig 3D e sprite/depth sem reiniciar caminhada;
- depth sprite reconstruído corretamente sob câmera perspectiva.

**Arca simplificado**:

- perfis próprios e geração por seed;
- clips simples;
- caminhada sincronizada por distância.

### Desenvolvimento

O laboratório permite selecionar motor, espécie/preset, ação, gait, pelagem, velocidade, juntas e frame de edição. Os ajustes de rig/pose usam JSON importável/exportável.

Os bakers são ferramentas separadas do runtime: editar um rig não altera silenciosamente assets publicados.

## Executar

```bash
npm install
npm run dev
```

Validação completa:

```bash
npm run typecheck
npm test
npm run build
```

## Organização

```text
src/
  arca/                    # carregamento GLB e prévia runtime da arca
  animals/                 # motor próprio + adaptadores dos animais originais
  humans/                  # motor próprio + adaptador humano original
  dev/                     # editores e painéis de bake
  pilgrimage/
    bake/                  # câmera, ink, depth, iluminação e bakers isolados
    wildlife/              # wildlife original isolado
    transport/             # equinos/bovino originais isolados
    world/                 # woodland, água, elevação e hidrologia isolados
  world/                   # integração/renderização do mundo

vendor/pilgrimage/         # snapshot upstream preservado
docs/                      # arquitetura e documentação técnica
```

## Regra arquitetural

```text
vendor/pilgrimage
        ↓ referência preservada
src/pilgrimage
        ↓ porta mínima do núcleo técnico
src/animals | src/humans | src/world | src/dev
        ↓
laboratório / futuro gameplay
```

População, economia, construções, cart systems e settlement gameplay não entram apenas para satisfazer imports.

Veja `docs/PILGRIMAGE_PORT_STATUS.md` para o inventário exato e `docs/BAKING_PIPELINE.md` para o pipeline de exportação.

## Próximas evoluções

- manifest/cache persistente para os atlases baked;
- profiling de cenas com muitos atores usando LOD automático;
- biblioteca real de props/equipamentos;
- CLI de bake quando houver pipeline persistente para alimentar;
- pontes/fords quando a travessia fizer parte do gameplay;
- navegação por rotas quando o gameplay começar.

## Pilgrimage upstream

Origem: `tomjohndesign/pilgrimage`  
Commit de referência: `c5e8c507a4ae4fe925f789793dd463b93821487d`

A licença original está em `vendor/pilgrimage/LICENSE` e a procedência em `vendor/pilgrimage/UPSTREAM.md`.

`vendor/` é referência. Adaptações ativas pertencem a `src/pilgrimage/` ou às camadas próprias do Arca.

Este trabalho é conduzido como projeto não comercial.
