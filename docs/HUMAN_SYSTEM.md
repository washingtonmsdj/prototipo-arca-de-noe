# Sistema procedural de humanos

## Dois motores

### Arca simplificado

`src/humans/` contém perfis de viajante, pastor, construtor, agricultor e sacerdote, além de `generatedHuman(seed)`, IK de pernas e caminhada por distância.

Clips próprios: `idle`, `walk`, `carry`, `pray`, `build` e `gather`.

### Pilgrimage original

`src/humans/UpstreamHuman.tsx` monta diretamente `createBasePersonRig()` a partir do snapshot upstream.

O laboratório expõe todos os **19 clips originais**:

- `idle`, `walk`, `wearyWalk`;
- `sleeping`, `sitting`;
- `seatedMeal`, `seatedDrink`, `seatedPrayer`;
- `praying`, `drinking`, `drinkingLow`, `preaching`;
- `treeFelling`, `woodcutting`, `building`, `gathering`;
- `carrying`, `hoisting`, `procession`.

Cada clip conserva sua própria quantidade de frames.

## Editor de pose

`src/dev/HumanRigEditorPanel.tsx` permite escolher frame/junta, editar offset X/Y/Z e raio de influência, limpar chaves, resetar e importar/exportar JSON.

As edições usam diretamente `PoseEdits`, `setPoseKey`, `clearFrameKeys` e `validatePoseEdits` do sistema original.

## Juntas editáveis

Cabeça, peito, pelve, ombros, cotovelos, mãos, quadris, joelhos, pés e ponta do cajado são expostos como pontos editáveis.

## Sockets e objetos

Os seis sockets originais (`head`, `back`, `leftHip`, `rightHip`, `leftHand`, `rightHand`) já são visíveis no laboratório.

Attachments de desenvolvimento usam `src/humans/attachments.ts`, compartilhado por:

- preview 3D;
- seleção de socket no laboratório;
- bake color/depth/shadow;
- metadata exportado.

O mesmo objeto e o mesmo socket são usados no runtime e no baker, evitando divergência entre preview e atlas.

## Próximas evoluções

- blend entre clips;
- foot locking em movimento no runtime original;
- roupas/cabelo apropriados ao cenário;
- biblioteca real de ferramentas/objetos além do attachment de teste.
