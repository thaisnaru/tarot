# Contexto do projeto — Tarot (app de estudo gamificado)

> Documento de handoff entre conversas. Não resume código — o código já está no projeto e no GitHub (`https://github.com/thaisnaru/tarot`). Isto é só mapa + decisões. Para detalhes de implementação, leia os arquivos reais ou `SPEC.md` (fonte de verdade completa, com log cronológico de decisões).

## O que é o projeto

App gamificado de estudo de Tarot (baralho Rider-Waite-Smith, domínio público). Objetivo: ensinar progressivamente reconhecimento de cartas → símbolos → cores → numerologia → naipes → interpretação. Público: estudante autodidata, sessões curtas no celular.

**Stack:** React + Vite + Tailwind, JavaScript puro (sem TS), 100% offline (sem rede, sem IA em nenhuma tela), português do Brasil.

**Onde está:** `/Users/thaisnaru/Claude/Projects/Tarot`. Repo GitHub: `thaisnaru/tarot` (branch `main`). Deploy no Vercel (projeto "tarot", time "Thais Naru Team"). `gh` CLI e Homebrew já instalados e autenticados na máquina.

## Estrutura de pastas

```
src/data/        cards.json (78), symbols.json (78, com emoji), colors.json (8, só Enciclopédia —
                 não tem mundo próprio na trilha), suits.json (4), numbers.json (14 ranks),
                 mundos.json (9 mundos jogáveis)
src/engine/      deck.js (acesso/lookup dos dados), mastery.js (domínio por item+skill),
                 sessionBuilder.js (gera sessão adaptativa, sem repetir item+skill até esgotar
                 variedade, com reforço de erro na mesma sessão), sessionReducer.js,
                 groupLabels.js (rótulos dos Submundos, compartilhado Jornada/Lição),
                 shuffle.js, distractors.js, generators/ (25 arquivos, um por tipo de pergunta, + index.js
                 + verdadeiroFalso.js, que não é um gerador — é uma transformação aplicada em cima de
                 qualquer pergunta de escolha única já pronta, não entra em GENERATORS_BY_ID)
src/components/  CardImage, MascotImage, QuestionCard, AnswerOption, PareamentoBoard,
                 FeedbackPanel, MundoCard, MasteryRow, AccordionRow, ProgressBar, BottomNav...
src/screens/     InicioScreen, JornadaScreen, LicaoScreen, FimDeLicaoScreen,
                 EnciclopediaScreen, CardDetailScreen, TiragemScreen (placeholder), PerfilScreen, AssetCheckScreen
src/navigation.jsx  navegação em PILHA (não react-router) — telas ficam montadas,
                    então abrir detalhe de carta a partir de uma lição não perde o progresso da lição
src/storage.js   wrapper de localStorage (get/set/list), namespace "tarot:"
public/cards/    78 PNGs das cartas. Nome = id da carta (major_arcana_X.png /
                 minor_arcana_{naipe-em-inglês}_{rank}.png — naipes em inglês: wands/cups/swords/pentacles)
public/mascot/   5 PNGs da bruxinha mascote: idle, acerto, erro, pensando, comemorando
SPEC.md          fonte de verdade do produto, com Log de decisões cronológico — LER PRIMEIRO
```

## Decisões importantes já tomadas

- **Tema escuro** (não claro como o rascunho original previa).
- **Bottom nav com 4 abas**: Início · Jornada · Tiragem · Perfil (sem aba "Praticar" separada).
- **Tiragem** (mesa de prática livre): sem pergunta escrita, sem IA, 100% determinística — só embaralhar/virar/revelar. Hoje é só placeholder, não implementada de verdade (Fase 5).
- **cards.json completo**: 78 cartas com dados semânticos reais (não só Maiores+Copas).
- **Símbolos usam emoji + label**, não recorte de imagem.
- **Jornada = 10 Mundos, nenhum travado**, progresso independente por mundo.
- **Modelo de progresso = domínio (mastery) por item, 0-100%**, não "lição de N questões". Cada item (carta/símbolo/cor/número/naipe) tem 1+ *skills* rastreadas via `mastery.js`, chave `mastery:{itemId}:{skill}` no localStorage. Acerto +15, erro -10, ≥80% = "Dominado". `sessionBuilder.js` gera sessões ponderando pros itens com menor domínio (botão "Praticar" = sessão mista; tocar num item específico = sessão focada nele).
- **Cada Mundo é um card colapsável** (`MundoCard`, fechado por padrão) com os itens numa trilha vertical (bolinha verde=dominado / roxa=em progresso / vazia=não começou).
- **Submundos**: Mundo 2 (Simbologia) agrupado por categoria de símbolo; Mundo 10 (Cortes) agrupado por rank (Pajens/Cavaleiros/Rainhas/Reis). Campo `groupBy` em `mundos.json`.
- **Regra anti-spoiler (crítica, sempre aplicar em pergunta nova)**: quando a resposta certa é uma carta, a opção é **nome em texto**, nunca imagem/miniatura — senão o jogador acerta só reconhecendo visualmente, sem saber o conteúdo.
- `difficulty` (`facil`/`medio`/`dificil`/`mestre`) é export estático em cada gerador. `skill` **não** é estático — o mesmo gerador serve skills diferentes conforme o mundo que chama (decidido pelo `sessionBuilder.js`).

## Os 9 Mundos

Cores **não é mais um mundo jogável** (removido da trilha em 2026-07-26 — ver Log de decisões do SPEC.md). `colors.json` e a skill `cores` do Mundo 1 continuam existindo; só o mundo dedicado (`itemType: "color"`) saiu de `mundos.json`. Cor continua consultável na aba "Cores" da Enciclopédia.

| # | Mundo | itemType | Skills rastreadas |
|---|---|---|---|
| 1 | Arcanos Maiores (22 cartas) | card | reconhecimento, keywords, simbolos, cores, significado, numerologia (0-21, sistema **diferente** do Mundo 3) |
| 2 | Simbologia (78 símbolos, agrupado por categoria — só "Praticar grupo" por categoria, sem foco em símbolo individual) | symbol | simbolo |
| 3 | Numerologia (14 ranks ace-king, carta-exemplo sorteada entre os 4 naipes a cada pergunta) | number | numero |
| 4 | Naipes (4 naipes, sem emoji no prompt — vazava o elemento; `naipe-carta` removido por feedback do usuário) | suit | naipe |
| 5-8 | Copas / Ouros / Espadas / Paus (14 cartas cada) | card | reconhecimento, keywords, numerologia |
| 9 | Cortes (16 cartas, agrupado por rank — "Praticar grupo" por Pajens/Cavaleiros/Rainhas/Reis) | card | reconhecimento, keywords, numerologia |

## Tipos de pergunta (25 geradores em `src/engine/generators/` + 1 transformação)

**Originais (11):** simboloSignificado, significadoSimbolo, corSignificado, cartaNaipe (não usado ativamente — reconhecer naipe pela carta era fácil demais), cartaKeywords, numeroTema, pareamento, naipeSignificado, naipeElemento, cartaSimboloSignificado, cartaCorSignificado.

**Contextualizados/anti-spoiler (10):** reconhecimentoCarta, cartaConceito, reconhecimentoSimbolo, simboloCarta, corCarta, numeroCartaMaior, naipeCarta (removido do Mundo Naipes em 2026-07-26, gerador mantido só por completude — ver Log de decisões), uprightReversed, significadoCarta (ativado no Mundo Arcanos Maiores em 2026-07-26), detetiveSimbolos.

**Naipe, rodada 2026-07-26 (3):** conceitoNaipe (esfera de vida → naipe), naipeAplicacao (cenário derivado das keywords do naipe → naipe), naipeComparacao (pareamento dos 4 naipes com as 4 esferas de vida — era escolha única, virou pareamento por pedido do usuário). Motivo original: os geradores de naipe antigos vazavam a resposta (`naipe-significado` usava texto que começava com o nome do próprio naipe; o prompt mostrava emoji do elemento).

**Novos tipos de jogo, pedido do usuário em 2026-07-26 (2):**
- `completarFrase` (gerador de verdade, skill `keywords`): "{carta} está relacionado a ___, ___ e ___" — reaproveita a mecânica `mode:'multi'` do carta-keywords (toca nas palavras certas, confirma), só muda a moldura pra preenchimento de lacunas. 3 espaços em vez de 2. Ativo em todos os mundos de carta que têm skill `keywords`.
- `verdadeiroFalso.js` (**não é gerador, é transformação** — não entra em `GENERATORS_BY_ID`/`GENERATORS`): pega qualquer pergunta `mode:'single'` já gerada (de qualquer gerador, qualquer Mundo) com mais de 2 opções, mostra uma resposta candidata (certa ou errada, sorteado) e troca as opções por Verdadeiro/Falso lado a lado. Aplicado em `sessionBuilder.js` (`finalizeQuestion`, ~25% de chance por pergunta elegível) — é assim que funciona em todos os Mundos/Submundos sem precisar mexer em cada gerador.

Toda pergunta baseada em carta tem texto de pergunta explícito (`prompt.question`) acima da imagem.

## Variedade e reforço de sessão (2026-07-26)

`buildAdaptiveSession` sorteia sem reposição por "voltas" — todas as combinações item+habilidade do pool (ponderadas por menor domínio), cada uma no máximo 1x por volta; só repete depois de esgotar a variedade. Errar reinjeta uma pergunta nova (item+habilidade igual, gerador pode variar) 2-4 perguntas à frente **na mesma sessão** (`INSERT_FOLLOWUP` em `sessionReducer.js`); acertar não repete na sessão atual. Ver detalhe completo no Log de decisões do SPEC.md.

## Fluxo de revisão de conteúdo por planilha (2026-07-26)

O usuário pediu um dump de todas as perguntas/respostas por Mundo/Submundo pra revisar e devolver otimizado. Como o app **não guarda perguntas fixas** (tudo é gerado combinando gerador+dado em tempo real), o que foi exportado foi o CONTEÚDO-FONTE (keywords, significados, temas — os campos que os geradores consomem), não uma lista de perguntas prontas, mais uma aba com 1 exemplo real gerado por tipo de pergunta. Arquivo gerado como `.xlsx` (openpyxl), o usuário devolveu como `.numbers` (Apple Numbers) — lido com a lib `numbers-parser` (`pip install numbers-parser`; não vem pré-instalada, ao contrário do openpyxl). Reimportado via diff campo-a-campo contra os JSON originais (script descartável, não ficou no repo) pra aplicar só o que mudou e pegar erros de digitação introduzidos na edição (aconteceu 2x: "Ipasse"→corrigido pra "Impasse", "Qgressividade"→corrigido pra "Agressividade").

**Padrão editorial que o usuário aplicou em toda edição de significado**: removeu o prefixo redundante ("Representa " no upright, "Invertida, indica " no reversed) já que os cabeçalhos das seções/colunas já dizem o que é — os textos agora começam direto no conteúdo. `colors.json`'s `meaning` virou formato bullet (`Palavra • Palavra • Palavra`) em vez de frase corrida. Se for gerar/editar conteúdo novo, seguir esse padrão pra manter consistência.

## O que ficou de fora (documentado, não construído)

Precisam de **conteúdo novo escrito à mão** (não derivável dos dados): perguntas de contexto/situação ("você decidiu abandonar..."), frases comparativas carta-a-carta (4 vs 5 de Copas), descrição de cena em prosa.
Precisa de **mecânica de UI nova**: memória visual (mostrar carta e esconder, com timer).
**Mais complexo, deixado pra depois**: charada composta (número+naipe+símbolo+contexto numa pergunta só).
**Dados que a fonte original não tem** (não inventados): só 8 cores (faltam Roxo/Laranja do pedido original), só 8 categorias de símbolo (faltam Armas/Objetos religiosos como subcategorias separadas).

## Ainda não implementado (fases futuras do produto)

- XP, ofensiva diária, sistema de conquistas (Fase 2).
- Tela de Configurações (Fase 3).
- Tiragem funcional de verdade (Fase 5) — hoje é só placeholder.
- Refino visual final com a paleta/mascote (Fase 4).

## Coisas a saber, não bugs

- Alguns nomes de símbolo em `card.symbols` (texto livre do documento original) não batem 100% com o nome canônico em `symbols.json` (ex: singular/plural). Cai graciosamente pra texto simples + ícone genérico, não quebra nada.
- `carta-naipe` existe mas não é chamado por nenhum mundo ativo hoje — mantido só por completude.
- `symbolsForPool`/`appears_in` em `symbols.json`: até 2026-07-26 só referenciava Arcanos Maiores; agora 41 das 56 cartas menores também têm 1-3 símbolos reais (reaproveitados do catálogo existente, baseado no texto de A.E. Waite — ver Log de decisões do SPEC.md). As outras 15 cartas menores continuam sem símbolo catalogado (nenhuma associação boa foi encontrada, não forçamos uma errada) — **ainda não assuma que toda carta menor tem símbolo**, `symbolsForPool([cartaMenor])` pode continuar vazio. Foi por causa dessa lacuna (antes 100% das menores) que o `reconhecimento-simbolo` tinha um bug de crash corrigido em 2026-07-26 — a checagem por card específico (não pelo pool inteiro) continua necessária.
- `card.meaning_upright_full` (campo novo de 2026-07-26, todas as 78): versão longa/didática do significado normal, só pra exibição na Enciclopédia (`CardDetailScreen.jsx`, precisa da classe `whitespace-pre-line` pra respeitar quebra de parágrafo do texto). O motor de perguntas continua usando `meaning_upright` (curto) — nunca trocar isso, senão `upright-reversed` vira óbvio só pelo tamanho do texto.
- De 4 símbolos sugeridos pelo usuário em 2026-07-30, 2 foram criados no catálogo (`Barba Branca`, `Nuvem` — agora 80 símbolos). Os outros 2 continuam pendentes, sem decisão do usuário ainda: "Simbolo de Vênus" (Imperatriz), "Mão apontando para cima" (Hierofante, diferente do "Mão apontando para baixo" que já existe).
- **Arquitetura de scroll (importante, já causou bug 2x)**: o app não usa scroll da `window`/`body` — a div-shell em `App.jsx` (`.relative.min-h-screen...overflow-x-hidden overflow-y-auto`) é quem rola de verdade, porque todas as telas ficam empilhadas como `position:absolute` dentro dela (navegação em pilha, nada desmonta). Motivo do `overflow-y-auto` explícito: sem ele, `overflow-x-hidden` sozinho já fazia o CSS computar `overflow-y:auto` implicitamente (regra da spec — só um eixo non-visible → o outro vira auto), o que funcionava só que escondido, e `window.scrollTo()` não tinha nenhum efeito (só resetava `window.scrollY`, que nunca é o que rola). Se for mexer em reset de scroll de novo, o alvo certo é o `ref` da shell (`shellRef.current.scrollTop`), não `window`. Nenhuma tela individual deve ter seu próprio `overflow-y-auto` — criaria um scroll aninhado que o reset da shell não alcança (removido um assim de `CardDetailScreen.jsx` em 2026-07-30).
