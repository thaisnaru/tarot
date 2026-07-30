# Tarot — Spec do produto

> Consolidação da spec original (definida em outra conversa) + decisões tomadas em 2026-07-24 depois de revisar o protótipo feito no Figma Make (`https://floss-silly-16270315.figma.site/`). Onde há conflito, **este arquivo é a fonte da verdade**, não o chat.

## Log de decisões

- **2026-07-24** — Adotado tema **escuro** como direção visual oficial, substituindo o "claro e arejado" da spec original. Motivo: alinhar com o protótipo do Figma Make, que o usuário validou.
- **2026-07-24** — Bottom nav reduzido para **4 abas** (Início · Jornada · Tiragem · Perfil), removendo "Praticar" como aba própria — a Lição continua existindo, mas é acessada a partir de um nó na Jornada, não por atalho global.
- **2026-07-24** — A tela de **Tiragem** (equivalente à "Mesa" da spec original) **não** tem campo de pergunta escrita nem sugestões de perguntas. O protótipo do Figma Make incluía esse fluxo ("Formule sua pergunta... as cartas revelarão perspectivas"), mas foi descartado por duas razões: (1) exigiria chamada de IA para interpretar a pergunta, quebrando a regra de app 100% offline/determinístico; (2) a microcopy soava preditiva, o que a spec original proíbe explicitamente. A Tiragem continua neutra: escolher spread → embaralhar → virar → revelar significados do `spreads.json`/`cards.json`.
- **2026-07-24** — `cards.json` preenchido para as **78 cartas** (não só Maiores + Copas como previa a Fase 1 original), a partir do documento `tarot_78_cartas_estrutura_aprendizado.txt` fornecido pelo usuário. Ver seção "Dataset semente" para ressalvas sobre os Arcanos Menores.
- **2026-07-24** — Símbolos **não usam recorte de imagem (`crop`)**. Cada símbolo em `symbols.json` é representado por um **emoji + label curto** (campo `emoji`, não `crop`/`icon_fallback`). Substitui o mecanismo de recorte percentual descrito na spec original — mais simples de implementar e de manter ao adicionar cartas novas.
- **2026-07-24** — A Jornada deixou de usar "trilhas" com algumas travadas (`locked`) e virou **10 Mundos, nenhum travado**: Arcanos Maiores, Simbologia, Cores, Numerologia, Naipes, Copas, Ouros, Espadas, Paus, Cortes. O usuário pode jogar qualquer um a qualquer momento; progresso é isolado por mundo (`lessons:{mundoId}:done` no `storage.js`). Cada mundo tem perguntas dedicadas ao seu tema via `activeTypes` do `lessonBuilder` (ex: mundo Cores só gera `cor-significado`; mundo Copas gera qualquer tipo aplicável às 14 cartas do naipe). Arquivo `src/data/trilhas.json` renomeado para `src/data/mundos.json`; exports do `deck.js` viraram `mundos`/`mundosById`.
- **2026-07-24** — Símbolos e Cores, tanto no detalhe de carta quanto na Enciclopédia, viraram **dropdowns** (`AccordionRow`): fechado mostra só emoji/swatch + nome, expande ao tocar pra ver o significado. Antes mostrava tudo aberto, virando parede de texto.
- **2026-07-24** — **Substituído o modelo de "lição de N questões" por domínio (mastery) por item, 0-100%**, com base no protótipo Figma Make (aba Cartas → detalhe de carta, seção "DOMÍNIO POR HABILIDADE"). Cada Mundo é sobre um tipo de item (carta/símbolo/cor/número/naipe) com 1+ habilidades rastreadas (`src/engine/mastery.js`, chave `mastery:{itemId}:{skill}`, +15 acerto/-10 erro, ≥80% = "Dominado"). Replicamos só as habilidades que o motor consegue gerar de verdade hoje (Palavras-chave, Símbolos, Cores, Numerologia) — não replicamos "Interpretar em contexto/combinações" do protótipo, que exigiriam tipos de pergunta novos fora de escopo. Isso **supera e substitui** a entrada anterior sobre `lessons:{mundoId}:done`/`activeTypes` do `lessonBuilder`: `src/data/mundos.json` não tem mais `lessons[]` (virou `itemType`/`scope`/`skills` direto no mundo), `lessonBuilder.js` foi removido e virou `src/engine/sessionBuilder.js` (`buildAdaptiveSession`, ponderada pelos itens de menor domínio; sessão focada num item só quando o usuário toca nele na lista). `carta-naipe` (carta → qual naipe) parou de ser usado em qualquer Mundo — reconhecer o naipe pela carta é trivial demais; o Mundo Naipes agora pergunta sobre o naipe em si (dois geradores novos: `naipe-significado`, `naipe-elemento`), sem mostrar carta nenhuma.
- **2026-07-25** — Cada Mundo na Jornada virou um **card maior colapsável** (`MundoCard.jsx`, fechado por padrão), com os itens dentro numa trilha vertical (bolinha de status + linha, `TimelineNode` em `JornadaScreen.jsx`) em vez de lista solta — resolve também Simbologia ter 78 itens sempre visíveis.
- **2026-07-25** — Toda pergunta baseada em carta ganhou um **texto de pergunta explícito** (`prompt.question`, renderizado por `QuestionText` em `QuestionCard.jsx`) — antes a carta aparecia sozinha, sem nenhuma frase guiando o que responder. Dois geradores novos, **contextualizados na carta específica sendo estudada**: `carta-simbolo-significado` ("Nesta carta, o que significa 🐂 Quatro criaturas fixas?") e `carta-cor-significado` ("Nesta carta, o que significa a cor amarela?") — usados nos mundos de carta no lugar das versões abstratas (que continuam servindo os mundos Simbologia/Cores, onde o item É o símbolo/cor, sem carta específica).
- **2026-07-25** — **Reformulação grande do motor de perguntas** a partir de spec detalhada do usuário (26 tipos propostos, regra explícita "nunca revelar a resposta", Mundos→Submundos, tags de habilidade/dificuldade). Implementados os **10 tipos que são inteiramente deriváveis dos dados existentes**: `reconhecimento-carta`, `carta-conceito`, `reconhecimento-simbolo`, `simbolo-carta`, `cor-carta`, `numero-carta-maior`, `naipe-carta`, `upright-reversed`, `significado-carta`, `detetive-simbolos` (combo de emojis da própria carta). **Regra anti-spoiler**: sempre que a opção correta é uma carta, a opção é nome em texto — nunca miniatura/imagem (aplicado nos 21 geradores). `difficulty` (`facil`/`medio`/`dificil`/`mestre`) virou export estático em todos os 21 geradores — **não** um `skill` estático, porque o mesmo gerador serve skills diferentes conforme o mundo que o chama (ex: `simbolo-significado` testa `simbolos` no Mundo 1 e `simbolo` no Mundo 2) — quem decide isso continua sendo o `sessionBuilder.js`, não o gerador.
  - Mundo 1 (Arcanos Maiores) ganhou 3 skills novas: `reconhecimento`, `significado` (upright/reversed + conceito geral), `numerologia` (0-21 via `numero-carta-maior` — sistema de numeração **diferente** do rank ace-king que o Mundo 4 usa, não misturar). Total 6 skills, `getSkillsForCard`/`SKILL_LABELS` em `mastery.js` atualizados.
  - Mundos de naipe (6-9) e Cortes (10) ganharam skill `reconhecimento`.
  - **Submundos**: `mundos.json` ganhou campo opcional `groupBy`. Mundo 2 (Simbologia) agrupa por `category` (as 8 categorias que já existem em `symbols.json` — não as 11 do pedido original; Armas/Objetos religiosos não são subcategorias separadas hoje, não inventamos). Mundo 10 (Cortes) agrupa por `rank` em Pajens/Cavaleiros/Rainhas/Reis. `JornadaScreen.jsx` renderiza sub-seções com rótulo quando `groupBy` existe (não é collapse aninhado, só agrupamento visual dentro do `MundoCard` já aberto).
  - **Ficou de fora desta fase, documentado no pedido original do usuário para retomar depois**: frases comparativas carta-a-carta (ex. "diferença entre 4 e 5 de Copas"), descrição de cena em prosa, perguntas de contexto/situação concreta ("você decidiu abandonar...") — todos exigem **conteúdo novo escrito à mão**, não são deriváveis de nenhum campo do JSON atual; memória visual (mostrar-e-esconder) exige mecânica de UI nova (timer), não só um gerador; conexão composta (número+naipe+visual+símbolo numa charada só) é mais complexa, melhor depois que os tipos simples estiverem validados em uso real.
  - `colors.json` só tem 8 cores (o pedido listava 10, incluindo Roxo/Laranja) — não inventamos cores que não vieram da fonte original (`tarot_78_cartas_estrutura_aprendizado.txt`).
- **2026-07-26** — Rodada de correções na Fase 1, a partir de auditoria pedida pelo usuário sobre variedade de perguntas, qualidade do Mundo Naipes/Numerologia, granularidade da Simbologia e um bug de scroll. Nenhuma mudança de escopo de produto — só correções e reestruturação do que já existia.
  - **Mundo Cores removido da trilha** (`mundos.json`): o mundo `itemType: "color"` foi excluído da Jornada — não é mais jogável, não gera mais perguntas de cor como progressão. `colors.json` e a skill `cores` do Mundo Arcanos Maiores (pergunta de cor contextualizada numa carta, `carta-cor-significado`) **não** foram tocados — cor continua rastreada como habilidade da carta maior, só o mundo dedicado (item isolado, sem carta) saiu. Cores continuam com aba própria na Enciclopédia (`CoresTab`), inalterada.
  - **Bug corrigido — Numerologia só mostrava Paus**: `sessionBuilder.js` escolhia a carta-representante de um rank com `cards.find(...)`, que sempre pega a primeira ocorrência — e Paus é o primeiro naipe em `cards.json`. Trocado por sorteio (`pickOne`) entre as 4 cartas do rank, então o mesmo número aparece com Copas/Ouros/Espadas/Paus variando entre sessões.
  - **Bug corrigido — spoiler no Mundo Naipes**: `naipe-significado` usava `suit.meaning` como texto das opções, e esse campo começa com "O naipe de Copas fala de..." — o nome do naipe vazava dentro da própria alternativa certa. Trocado pra `suit.sphere` (não menciona o nome). O emoji do naipe (🔥💧💨🪙) também foi tirado do prompt de toda pergunta de naipe (`QuestionCard.jsx`) — entregava o elemento visualmente antes de perguntar sobre elemento.
  - **3 geradores novos de Naipe** (`conceito-naipe`, `naipe-aplicacao`, `naipe-comparacao`), registrados em `generators/index.js` e no pool do Mundo Naipes em `sessionBuilder.js`: direção esfera-de-vida→naipe, cenário derivado das `keywords` do naipe, e comparação entre dois naipes ao mesmo tempo (todas as 4 alternativas citam os dois nomes, pra nenhuma vazar a resposta por menção direta). Revisão confirmou que não há sobreposição de conteúdo entre o Mundo Naipes (conceitos gerais do naipe) e os Mundos Copas/Ouros/Espadas/Paus (cartas individuais) — direções diferentes, sem pergunta duplicada.
  - **Simbologia simplificada**: os "Submundos" eram, na prática, sessões de foco num símbolo só (habilidade única `simbolo`, então virava a mesma pergunta repetida). Removida a possibilidade de focar um símbolo individual (`JornadaScreen.jsx`: `allowItemFocus = mundo.itemType !== 'symbol'`); no lugar, cada categoria (as 8 que já existiam em `symbols.json` — Corpos celestes, Fauna, Flora, Objetos, Vestimentas, Arquitetura, Paisagem, Figuras humanas) ganhou botão próprio "Praticar grupo". `getMundoItems`/`buildAdaptiveSession` em `sessionBuilder.js` ganharam parâmetro `groupValue` pra escopar a sessão a um grupo (reaproveitado pelas Cortes também, que já tinham `groupBy: "rank"` — agora Pajens/Cavaleiros/Rainhas/Reis também têm "Praticar grupo").
  - **Variedade e repetição de perguntas, em todos os mundos**: `buildAdaptiveSession` foi reescrito. Antes, cada pergunta sorteava item+habilidade independentemente (com reposição), então a mesma combinação podia sair 2-3x numa sessão de 10. Agora sorteia sem reposição por "voltas" (todas as combinações item+habilidade do pool, ponderadas por menor domínio, cada uma no máximo 1x por volta) — só repete depois de esgotar a variedade disponível, e cada repetição gera uma pergunta nova (distratores/gerador variam). Além disso, errar uma pergunta agora reinjeta uma nova pergunta sobre o mesmo item+habilidade 2 a 4 perguntas à frente **na mesma sessão** (`sessionReducer.js`: ação `INSERT_FOLLOWUP`; `sessionBuilder.js`: `buildFollowUpQuestion`) — acertar não repete a pergunta na sessão atual.
  - **Bug pré-existente corrigido — crash em Copas/Ouros/Espadas/Paus/Cortes**: a habilidade `reconhecimento` desses mundos podia sortear o gerador `reconhecimento-simbolo`, que só funciona pra cartas com símbolos catalogados (só os Arcanos Maiores têm — ver ressalva do dataset). Como a checagem de aplicabilidade rodava contra o pool inteiro de 78 cartas (sempre tem symbol em algum maior) em vez da carta específica sorteada, a sessão quebrava com tela em branco sempre que uma carta menor caía nesse gerador. `buildQuestionFor` agora filtra esse candidato fora quando a carta-alvo não tem símbolo.
  - **Bug de scroll corrigido**: a navegação é em pilha (telas ficam montadas, `position: absolute`) e a rolagem real é da janela — trocar de tela não resetava o scroll, então uma tela nova podia abrir already scrollada pro meio/fim, herdando a posição da tela anterior. `App.jsx` agora reseta `window.scrollTo(0,0)` sempre que o topo da pilha muda (nova tela ou voltar).
- **2026-07-26** — Revisão de conteúdo via planilha + 2 tipos de jogo novos, a partir de um arquivo `.xlsx` exportado com o conteúdo-fonte de todos os Mundos/Submundos (não uma lista de perguntas fixas — ver "Fluxo de revisão de conteúdo por planilha" no `CONTEXT.md`), editado pelo usuário e devolvido em `.numbers`.
  - **Conteúdo reimportado** em `cards.json`, `symbols.json`, `colors.json`, `suits.json`, `numbers.json` (168 mudanças de campo). Padrão editorial aplicado pelo usuário em todo `meaning_upright`/`meaning_reversed`: removido o prefixo redundante ("Representa "/"Invertida, indica ") já que o cabeçalho da seção já diz o que é. `colors.json` passou pra formato bullet (`Palavra • Palavra • Palavra`). 8 emojis de símbolo trocados (ex: Anjo 🪽→👼🏻, Bandeira 🚩→🏴‍☠️) e "Coração/escudo"→"Escudo". Naipes ganharam significado completo reescrito (mais rico que o original). Corrigidos 2 typos introduzidos na edição ("Ipasse"→"Impasse", "Qgressividade"→"Agressividade").
  - **`naipe-carta` removido do Mundo Naipes** (pergunta fraca, feedback direto do usuário) — gerador mantido só por completude, igual `carta-naipe`/`cor-significado`/`cor-carta`.
  - **`naipe-comparacao` virou pareamento** (era escolha única com 4 alternativas de texto comparando 2 naipes — pouca variedade de distratores plausíveis). Agora pareia os 4 naipes com as 4 esferas de vida de uma vez, igual ao `pareamento` de símbolos. `PareamentoBoard.jsx` generalizado pra aceitar itens da coluna esquerda sem emoji (`item.symbol` opcional, cai pra `item.label`).
  - **`significado-carta` ativado** no Mundo Arcanos Maiores (skill `significado`, junto com `carta-conceito`/`upright-reversed`) — só existia como gerador testado, sem nenhum Mundo chamando.
  - **`upright-reversed` reformulado**: opções viraram só "Normal"/"Invertida" (tirado o jargão em inglês "Upright"/"Reversed"), pergunta reformulada pra citar a carta pelo nome, e o prompt (`card-text` em `QuestionCard.jsx`) trocou o fundo sólido roxo (`bg-surface`, igual às opções de resposta — confundia visualmente) por um estilo de citação (borda esquerda + itálico, sem preenchimento).
  - **Legenda nos emojis de pista** (`detetive-simbolos`): antes mostrava só os emojis soltos (`prompt.emojis`), sem nome — agora `prompt.clues` traz `{emoji, name}` e `QuestionCard.jsx` mostra o nome do símbolo embaixo de cada um. (`simbolo-significado` já mostrava o nome do símbolo desde antes — não precisou mudar, só não apareceu no exemplo da planilha por limitação do dump.)
  - **Tipo de jogo novo — Verdadeiro ou Falso** (`src/engine/generators/verdadeiroFalso.js`): **não é um gerador** (não entra em `GENERATORS`/`GENERATORS_BY_ID`) — é uma transformação aplicada em cima de qualquer pergunta `mode:'single'` já pronta, de qualquer gerador/Mundo/Submundo. Pega a pergunta, mostra uma resposta candidata (certa ou errada, sorteada) como afirmação, e troca as opções pelas duas opções lado a lado Verdadeiro/Falso. Acoplado em `sessionBuilder.js` (`finalizeQuestion`, ~25% de chance, só em perguntas de escolha única com mais de 2 opções — evita rewrap de perguntas que já são binárias tipo `upright-reversed`). `QuestionCard.jsx` ganhou o mode `'boolean'`: caixa de citação com a afirmação + botões lado a lado (`AnswerOption` ganhou prop `centered`).
  - **Tipo de jogo novo — Complete a frase** (`src/engine/generators/completarFrase.js`, id `completar-frase`): "{carta} está relacionado a ___, ___ e ___" com 3 lacunas, reaproveitando a mecânica `mode:'multi'` do `carta-keywords` (toca nas palavras certas, confirma) — só muda a moldura da pergunta. Registrado como candidato adicional da skill `keywords` (junto com `carta-keywords`) em todo Mundo de carta que tem essa skill. Precisa de pelo menos 3 keywords catalogadas pra aparecer (cartas menores com só 2 keywords continuam só com `carta-keywords`).
- **2026-07-26** — Ajustes na Enciclopédia: texto de significado normal ampliado, títulos simplificados, símbolos/cores dos Arcanos Menores corrigidos.
  - **Novo campo `meaning_upright_full`** em `cards.json` (78 cartas, texto próprio escrito nesta sessão — não veio de fonte externa): versão mais completa/didática do significado normal (cita brevemente a imagem da carta + contexto prático), usada só em `CardDetailScreen.jsx` (com fallback pro `meaning_upright` curto se faltar). **Decisão de arquitetura**: não editei `meaning_upright` em si, porque esse campo alimenta o motor de perguntas (`carta-conceito`, `significado-carta`, `upright-reversed`) — virar um parágrafo longo quebraria a UX de alternativa de múltipla escolha e, pior, tornaria `upright-reversed` (adivinhar se um texto é normal ou invertido) trivial só pelo tamanho do texto, sem precisar saber o conteúdo. `meaning_reversed` continua curto como já era, não precisou de campo novo. Nenhum gerador foi alterado.
  - **Títulos da Enciclopédia simplificados**: "Significado (normal)"/"Significado (invertida)" → "Normal"/"Invertida" (`CardDetailScreen.jsx`).
  - **Símbolos e cores dos 56 Arcanos Menores corrigidos**: antes, `symbols` de toda carta menor era uma frase livre de cena (ex: `"uma mão emerge oferecendo um bastão"`) que nunca batia com nenhum nome em `symbols.json` — sempre caía no fallback "não catalogado". E `dominant_colors` guardava só o elemento do naipe como string (`"Fogo"`/`"Água"`/`"Ar"`/`"Terra"`), que também não existe em `colors.json` (só tem as 8 cores reais) — a seção "Cores" também sempre quebrava pra carta menor. Pesquisado o texto original de A.E. Waite, *The Pictorial Key to the Tarot* (1910, domínio público, via sacred-texts.com/archive.org — descrição de imagem de cada carta menor) e cruzado com os 78 símbolos já catalogados: **41 das 56 cartas** ganharam 1-3 símbolos reais reaproveitados (ex: Rei de Paus → Leão/Trono/Coroa, citação textual de Waite "he connects with the symbol of the lion... emblazoned on the back of his throne"; Ás de Espadas → Coroa/Espada). As outras 15 ficaram sem símbolo em vez de forçar uma associação fraca ou errada (ex: não usei `Pentagrama invertido` no Rei de Ouros só porque Waite menciona "pentagrama" — o pentáculo do Rei é o normal, não o invertido do Diabo, seriam símbolos com significado oposto). Cores: usadas por conhecimento próprio da arte do baralho RWS (autorizado pelo usuário a pular a pesquisa pra esse campo especificamente), sempre entre as 8 já cadastradas. `symbols.json`/`colors.json` tiveram `appears_in` atualizado com os ids das cartas menores onde cada símbolo/cor passou a aparecer.
- **2026-07-30** — Ajustes pontuais pedidos pelo usuário + reimport de uma segunda rodada de edição via planilha (`tarot_enciclopedia.xlsx` → editado pelo usuário → devolvido como `tarot_enciclopedia_pronto.xlsx`, lido com openpyxl).
  - **Símbolos genéricos demais removidos**: `Bastão levantado` tirado do Ás de Paus (só aparecia ali entre as cartas de Paus) e `Espada` tirado de todas as cartas de Espadas que o tinham (Ás, 2, 3, 5, 7, 8, 9, 10, Pajem, Rainha, Rei) — tautológico, o símbolo do próprio naipe repetido em toda carta do naipe não ensinava nada de novo. Ambos voltaram a existir só nos Arcanos Maiores onde já estavam catalogados (O Mago, A Justiça).
  - **Reimport da planilha da Enciclopédia**: script de diff campo-a-campo (não ficou no repo) comparou a planilha devolvida contra `cards.json` atual. O parser de listas (`symbols`/`dominant_colors`) ficou mais tolerante — antes só aceitava `;` como separador, agora também aceita `,` e `" e "` dentro de uma célula (o usuário às vezes editou sem seguir à risca o `;`), sempre validando cada pedaço contra o catálogo real antes de aplicar. Aliases de sinônimo/singular-plural resolvidos direto pro nome existente sem inventar símbolo novo: `Montanha→Montanhas`, `Esfinge→Esfinges`, `Quatro criaturas`/`Quatro figuras→Quatro criaturas fixas`, `Colunas→Pilares`, `Infinito→Símbolo do infinito`, `Pergaminho→Livro/rolo`. De brinde, corrigido um bug legado (não desta planilha) em `dominant_colors` de A Roda da Fortuna/O Carro que guardava `"Preto e branco"` como string única em vez de duas cores separadas.
  - **4 símbolos sugeridos pelo usuário não têm correspondência no catálogo e ficaram de fora** (não aplicados, não inventados): "Simbolo de Vênus" (A Imperatriz), "Barba Branca" (O Imperador), "Mão apontando para cima" (O Hierofante — existe só "Mão apontando para baixo", direção oposta, não é o mesmo símbolo), "Nuvem" (Os Enamorados). Avisado ao usuário pra decidir se quer criar esses símbolos novos no catálogo.
  - **Texto do significado normal**: o usuário reformatou os 78 textos de `meaning_upright_full` com quebras de parágrafo (uma ideia por linha, dentro da mesma célula). `CardDetailScreen.jsx` ganhou `whitespace-pre-line` na classe do parágrafo — sem isso o HTML colapsa quebra de linha simples e o texto aparecia tudo corrido, ignorando a formatação da planilha.
- **2026-07-30 (continuação)** — 3 pedidos pontuais do usuário depois de revisar a planilha.
  - **Símbolo `Torres` reformulado**: significado trocado pra "Limites e Proteção" (`"Representam limites e proteção, guardando a fronteira e demarcando a passagem entre dois territórios."`), formatado igual aos outros (uma frase, verbo no plural já que o nome é plural). Usado em A Carruagem/A Lua/8 de Espadas.
  - **`carta-keywords` reformulado**: antes testava só 2 palavras-chave sorteadas entre as N da carta (Arcanos Maiores têm 5, mas só 2 apareciam na pergunta). Agora testa **todas** as palavras-chave da carta de uma vez — quem sabe a carta de verdade precisa reconhecer o conjunto inteiro entre os distratores (sempre 3 distratores fixos, então Arcanos Maiores viram 8 opções no total, 5 corretas). `completar-frase` não foi mexido (continua sempre 3 lacunas, é um gerador separado).
  - **2 símbolos novos criados** no catálogo (`symbols.json`, agora 80 símbolos), a pedido explícito do usuário — diferente da rodada anterior, aqui não houve dúvida sobre o que criar:
    - `Barba Branca` 🧔🏼 (figura-humana) — "Representa a sabedoria conquistada com a idade e a experiência..." — em O Imperador e O Eremita.
    - `Nuvem` ☁️ (paisagem) — "Representa a comunicação saudável e a clareza mental necessária para expressar pensamentos e sentimentos sem gerar conflito." — em Os Enamorados, 3/5/Pajem/Cavaleiro/Rainha/Rei de Espadas.
    - Os textos "78 símbolos"/"78 cartas" no card "Simbologias" do Início (`InicioScreen.jsx`) eram string fixa — trocados por `symbols.length`/`cards.length` de `deck.js`, pra não ficar defasado de novo quando o catálogo crescer.
- **2026-07-30 (continuação 2)** — Enciclopédia: símbolos agrupados por categoria (`EnciclopediaScreen.jsx`, `SimbolosTab` reaproveita `CATEGORY_LABELS`/`CATEGORY_ORDER` de `groupLabels.js` — mesmos rótulos/ordem já usados na Jornada e na planilha). Aba Cartas ganhou um container "Sobre {naipe/Maiores}" acima da grade quando um filtro específico está ativo (Maiores/Paus/Copas/Espadas/Ouros) — puxa `suit.meaning` de `suits.json` pros naipes; Arcanos Maiores usa um texto novo escrito nesta sessão (`MAIORES_MEANING`, não existia dado equivalente). Não aparece no filtro "Todos".
- **2026-07-30 (continuação 3)** — **Bug de scroll corrigido de verdade** (a correção de uma sessão anterior, `window.scrollTo(0,0)` em `App.jsx`, tinha diagnóstico errado e nunca funcionou de fato — só não tinha sido percebido). Causa raiz real: a div-shell em `App.jsx` (`.relative.min-h-screen...`) tem `overflow-x-hidden` mas não `overflow-y` explícito — pela spec do CSS, quando só um eixo tem overflow não-`visible`, o outro é computado como `auto` automaticamente. Isso silenciosamente transformou essa div (não a janela) no container de scroll real de todo o app; `window.scrollY` ficava sempre em 0 mesmo com a tela visivelmente rolada, então `window.scrollTo(0,0)` nunca tinha efeito nenhum. Corrigido com `useRef` na div-shell + `shellRef.current.scrollTop = 0` no lugar de (agora, além de) `window.scrollTo`, e `overflow-y-auto` tornado explícito na classe pra não depender do comportamento implícito. Trocado `useEffect`→`useLayoutEffect` de brinde, pra rodar antes do paint. Removido também um `overflow-y-auto` solto e sem função real em `CardDetailScreen.jsx` (não era a causa, mas era um container de scroll aninhado desnecessário, incoerente com o resto do app onde só a shell rola).

---

## Papel

Engenheiro de front-end sênior + game designer construindo, em fases, um jogo mobile de estudo de Tarot.

## Objetivo

App gamificado com dois pilares complementares:

1. **Fixação** — microlições de recall (símbolo → significado, cor, naipe, numerologia) organizadas em mundos.
2. **Prática livre** — a Tiragem, onde o usuário tira quantas cartas quiser, tenta lembrar sozinho o que significam, e revela quando quiser.

A Tiragem é deliberadamente simples: sem tema, sem correção, sem pontuação, **sem pergunta escrita, sem IA**. É espaço de prática, não de avaliação nem de leitura preditiva. Todo o rigor do produto mora nos mundos.

## Público

Estudante autodidata de Tarot. Uso principal: celular, sessões de 2–5 minutos, várias vezes ao dia.

## Enquadramento

App de estudo de um sistema simbólico. A Tiragem é exercício de memória e interpretação — a microcópia não deve sugerir previsão de fatos. Nenhuma tela pede "qual sua pergunta" nem promete revelar o futuro.

---

## Referências na pasta do projeto

**`/referencias/figma/`** — exports/prints do design feito no Figma (Make), usados como spec visual literal (ver README da pasta).

**`/public/cards/`** — imagens do baralho Rider–Waite–Smith. Baralho de 1909, ilustrado por Pamela Colman Smith, em domínio público.

O vínculo entre imagem e carta é feito exclusivamente pelo nome do arquivo. Nenhum componente deve tentar inferir a carta de outro jeito. Ver `/public/cards/README.md` para a lista completa de 78 nomes esperados.

O `cards.json` (a fornecer) traz os 78 registros com `id` igual ao nome do arquivo (sem extensão) e o campo `image` já preenchido. Usar como está — não renomear arquivos, não gerar ids novos, não alterar `id`, `name`, `number`, `arcana`, `suit`, `rank`, `element`, `numerology` nem `image`. Preencher apenas `keywords`, `meaning_upright`, `meaning_reversed`, `symbols`, `dominant_colors` e `astro`.

Atenção: no Rider–Waite–Smith **A Força é VIII e A Justiça é XI**, invertidas em relação ao Tarot de Marselha. A numeração no arquivo já está correta; não "corrigir".

Criar uma **tela oculta de verificação de assets** (acessível por toque longo no cabeçalho do Perfil): grade com todas as cartas do dataset, cada uma exibindo a imagem carregada, o nome esperado do arquivo e o nome da carta. Imagem faltando aparece como placeholder vermelho.

**`/public/mascot/`** — bruxinha kawaii, estilo chibi anime: cabelo roxo longo, chapéu preto pontudo com fita rosa e fivela dourada, vestido preto com laço rosa, vassoura, brilhos amarelos. Fundo transparente. Estados: `idle`, `acerto`, `erro`, `pensando`, `comemorando`. Se faltar algum, cai para `idle`.

---

## Stack e restrições técnicas

- **React + Tailwind**, single-page, mobile-first (viewport base 390×844).
- Separar `data/`, `engine/`, `components/`, `screens/`.
- **Sem dependência de rede.** App inteiro roda offline, com dados locais. Nenhuma chamada de IA em nenhuma tela, incluindo a Tiragem.
- Módulo `assets.js` resolve todo caminho de imagem em um lugar só, com fallback gracioso quando o arquivo não existir. Nenhum componente monta caminho por conta própria.
- Módulo `storage.js` isolado com interface `get/set/list`.
- Proporção de carta fixa em **1:1.75**.
- Área de toque mínima 44×44px. Navegação principal na zona do polegar.
- Português do Brasil em toda a interface.

---

## Modelo de dados

### `cards.json`
```json
{
  "id": "major_arcana_tower",
  "name": "A Torre",
  "number": 16,
  "arcana": "maior",
  "suit": null,
  "rank": null,
  "element": null,
  "numerology": 16,
  "image": "major_arcana_tower.png",
  "astro": null,
  "keywords": [],
  "meaning_upright": "",
  "meaning_reversed": "",
  "symbols": [],
  "dominant_colors": []
}
```
Naipes: `suit` entre `paus`/`copas`/`espadas`/`ouros`, `element` entre `fogo`/`agua`/`ar`/`terra`. `rank`: `ace`, `2`…`10`, `page`, `knight`, `queen`, `king`.

### `symbols.json`
```json
{
  "id": "rosas-vermelhas",
  "name": "Rosas vermelhas",
  "emoji": "🌹",
  "category": "flora",
  "meaning": "Desejo, paixão, o impulso da vida material.",
  "appears_in": ["major_arcana_magician", "major_arcana_fool", "major_arcana_death"],
  "contrast_with": ["lirios-brancos"]
}
```
Cada símbolo é representado por um **emoji + label**, não por recorte de imagem — mais simples de manter ao adicionar cartas novas (ver Log de decisões).

Categorias: `flora`, `fauna`, `paisagem`, `objeto`, `vestimenta`, `celestial`, `arquitetura`, `figura-humana`.

### `colors.json`
```json
{
  "id": "amarelo",
  "name": "Amarelo",
  "hex": "#E8B84B",
  "meaning": "Intelecto, consciência, clareza mental.",
  "appears_in": ["major_arcana_magician", "major_arcana_sun"]
}
```

### `suits.json` e `numbers.json`
Naipes (Paus/fogo, Copas/água, Espadas/ar, Ouros/terra) com significado, esfera de vida e palavras-chave. Números 1–10 e as quatro cortes com tema numerológico.

### `spreads.json`
Apenas rótulos de posição, sem lógica.
```json
{
  "id": "situacao-obstaculo-conselho",
  "name": "Situação · Obstáculo · Conselho",
  "count": 3,
  "positions": ["Situação", "Obstáculo", "Conselho"]
}
```
Tiragens tradicionais: uma carta (Carta do dia); Passado · Presente · Futuro; Situação · Obstáculo · Conselho; Você · O outro · A relação; Mente · Corpo · Espírito; Cruz Celta (10).

### Conteúdo de referência
Baseado na tradição **Rider–Waite–Smith**. Onde houver divergência entre escolas, escolher a leitura mais consensual — não inventar correspondências.

---

## Dataset semente (Fase 1)

- **`cards.json` completo — as 78 cartas, todos os 4 naipes** (`src/data/cards.json`). Superou o mínimo original da Fase 1 (que previa só Maiores + Copas) porque a fonte (`tarot_78_cartas_estrutura_aprendizado.txt`, fornecida pelo usuário) já trazia significados, palavras-chave, cores e simbologia para os 78. Gerado por agente em 2026-07-24, validado (78 entradas, `id`/`image` batendo com os arquivos reais de `public/cards/`).
  - Ressalva (válida até 2026-07-25): nos Arcanos Menores a fonte não tinha símbolos/cores individuais por carta como nos Maiores — só a cena geral (`symbols` com 1 item de texto livre) e o elemento do naipe como "cor" (`dominant_colors` com 1 item, ex. `["Fogo"]`), nenhum dos dois batendo com o catálogo real de `symbols.json`/`colors.json`. **Corrigido em 2026-07-26** — ver Log de decisões: 41 das 56 menores ganharam símbolos reais reaproveitados do catálogo (baseado em A.E. Waite), e as 56 ganharam cores reais das 8 cadastradas.
- **`symbols.json` (78 símbolos) e `colors.json` (8 cores) completos** (`src/data/symbols.json`, `src/data/colors.json`), derivados dos 22 Arcanos Maiores com `appears_in` cruzado e emoji em vez de `crop`. Gerados e validados em 2026-07-24.
- **`suits.json` (4 naipes) e `numbers.json` (14 ranks) completos** (`src/data/suits.json`, `src/data/numbers.json`), escritos à mão em 2026-07-24.
- **`mundos.json` com os 10 Mundos da Jornada completo** (`src/data/mundos.json`), nenhum travado. Ver Log de decisões.

---

## PARTE 1 — Fixação

### Tipos de questão

Sete formatos, gerados a partir dos dados, nunca hardcoded:

| id | Formato |
|---|---|
| `simbolo-significado` | Símbolo (emoji) → escolher o significado |
| `significado-simbolo` | Significado → escolher o símbolo entre 4 imagens |
| `cor-significado` | Cor → escolher o significado |
| `carta-naipe` | Carta → escolher naipe/elemento |
| `carta-keywords` | Carta → escolher as 2 palavras-chave corretas entre 5 |
| `numero-tema` | Número → escolher o tema numerológico |
| `pareamento` | Arrastar 4 símbolos até 4 significados |

**Regra dos distratores:** opções erradas vêm da mesma `category` ou do mesmo naipe.

### Feedback

Painel ao responder, com:
1. Resposta correta com explicação do porquê.
2. "Onde mais isso aparece" — miniaturas clicáveis de outras cartas com mesmo símbolo/cor (`appears_in`), máx. 5, scroll horizontal.
3. Par de contraste, se houver `contrast_with`.
4. Reação do mascote.

Tocar numa miniatura abre a carta na enciclopédia sem perder a sessão.

### Mundos (Jornada)

10 mundos fixos (Arcanos Maiores, Simbologia, Cores, Numerologia, Naipes, Copas, Ouros, Espadas, Paus, Cortes), **nenhum travado** — o usuário escolhe qualquer um a qualquer momento. Não existe mais "lição de N questões": cada mundo é sobre um `itemType` (carta/símbolo/cor/número/naipe) com uma ou mais habilidades (`skills`) rastreadas por item via `mastery.js` — progresso é **por item, 0-100% de domínio**, não por lição concluída (ver Log de decisões).

```json
{
  "id": "arcanos-maiores",
  "name": "Os Arcanos Maiores",
  "level": "iniciante",
  "accent": "primary",
  "itemType": "card",
  "scope": { "cards": ["major_arcana_fool", "..."] },
  "skills": ["keywords", "simbolos", "cores"]
}
```

Fase 1: os 10 mundos já têm conteúdo real (não há mais placeholder "em breve" — todos os 4 naipes e as cortes têm dados semânticos completos desde a extração do `tarot_78_cartas_estrutura_aprendizado.txt`).

A prática é acessada de dois jeitos na tela Jornada: botão "Praticar" no cabeçalho do mundo (sessão mista, ponderada pelos itens de menor domínio) ou tocando num item específico da lista (sessão focada só nele). Não existe aba própria de "Praticar" no bottom nav.

### Gamificação

- Sem vidas, sem corações. Errar não pune nem interrompe.
- Revisão embutida, nunca um modo separado. Item errado é reinjetado 2 lições depois, e de novo 5 depois se errar outra vez. Guardar `strength` por item, sem expor como "modo revisar".
- XP por acerto, com bônus de combo e de lição perfeita.
- Ofensiva diária com meta configurável.
- Fim de lição: acertos, XP, ofensiva, mascote comemorando, "seus 3 pontos fracos" (informativo).
- Conquistas por marcos.

---

## PARTE 2 — Tiragem

Espaço de prática livre. Sem tema, sem correção, sem pontuação, **sem pergunta escrita, sem chamada de IA**. Tudo offline e determinístico.

### Fluxo

1. **Escolher a tiragem** — uma das tradicionais de `spreads.json`, ou modo livre com contador de 1 a 10 cartas. Modo livre é o padrão.
2. **Embaralhar** — animação curta e contida. Sorteio sem repetição dentro da mesma tiragem.
3. **Virar** — cartas entram viradas para baixo, dispostas na mesa. Toque em cada uma revela a imagem. Se a tiragem tiver posições nomeadas, o rótulo aparece sob a carta.
4. **Lembrar** — momento sem interface. Cartas visíveis, nada mais acontece.
5. **Revelar significados** — botão único, sempre visível no rodapé. Abre o significado de todas as cartas de uma vez, em lista rolável abaixo delas: nome, imagem pequena, palavras-chave e significado. Carta invertida mostra `meaning_reversed`.
6. **Explorar** — tocar em qualquer carta abre a ficha completa na enciclopédia. Voltar não desfaz a tiragem.
7. **Nova tiragem** — limpa e recomeça.

### Regras

- Botão de revelar não some depois de usado; pode reler.
- Nada é pontuado, nada alimenta XP, ofensiva ou mundos.
- **Cartas invertidas**: ativável nas configurações. Quando ligado, cada carta tem 30% de chance de sair invertida, com `meaning_reversed` na revelação.
- **Não há campo de pergunta, não há sugestões de pergunta, não há interpretação por IA.** Essa etapa existia no protótipo do Figma Make e foi removida deliberadamente (ver Log de decisões).
- Salvar tiragem é opcional, fica para depois.

## Filtros e configurações

Configurável em Perfil → Configurações:

- Mostrar imagens das cartas — on/off
- Mostrar imagens dos símbolos — on/off. Quando ligado e a questão for sobre símbolo, exibir o emoji do símbolo; quando desligado, cai para o nome em texto.
- Tipos de questão ativos — multi-seleção entre os 7. Avisar antes de começar se não der pra gerar questões suficientes.
- Cartas invertidas na Tiragem — on/off
- Meta diária de ofensiva
- Tamanho da lição (6 / 10 / 15)

---

## Direção visual

**Místico, contemporâneo, tema escuro.** (Revisão 2026-07-24: substitui a diretriz original de tema claro/arejado.)

### Paleta (extraída do protótipo Figma Make via computed styles)

| Token | Valor | Uso |
|---|---|---|
| `bg` | `#080617` | Fundo geral (quase preto, tom indigo) |
| `surface` | `#251B4E` | Cards, superfícies elevadas |
| `surface-overlay` | `rgba(19,15,42,0.8–0.95)` | Painéis sobre conteúdo (feedback, modais) |
| `primary` | `#8B5CF6` (violet-500) | Botões, nós ativos, ícone ativo do nav |
| `secondary` | `#3B82F6` (blue-500) | Acento secundário |
| `accent-warm` | `#F59E0B` (amber-500) | Ofensiva/streak, XP, destaques de conquista |
| `success` | `#22C55E` (green-500) | Acertos, checkmarks |
| `text-primary` | `#FFFFFF` | Texto principal |
| `text-secondary` | `#E8E0FF` | Texto secundário sobre fundo escuro |
| `text-muted` | `#8B80B0` | Legendas, metadados |

Sucesso e erro nunca dependem só de cor — sempre com ícone e microcópia.

### Componentes
- Cards grandes, cantos 16–24px, sombra/glow suave (halo roxo em elementos ativos).
- Espaçamento generoso. Uma ideia por tela.
- Barra de progresso em gradiente `primary` → `accent-warm`.
- Jornada como caminho vertical serpenteante com nós ilustrados por mundo; mascote no nó atual.
- A Tiragem tem respiro maior e tipografia um pouco mais generosa que o resto do app — é o momento contemplativo do produto.
- Contraste mínimo AA (checar especialmente `text-muted` sobre `bg`).

---

## Telas

1. **Início** — mundos com progresso, ofensiva e XP no topo, desafio do dia, grade "Explore" (Cartas · Simbologias · Tiragens · Combinações) como porta de entrada da enciclopédia
2. **Jornada** — caminho vertical pelos 10 mundos, mascote no ponto atual, acesso às lições
3. **Lição** — progresso, questão, painel de feedback (acessada a partir de um nó da Jornada)
4. **Fim de lição** — resumo e mascote
5. **Tiragem** — escolher tiragem → embaralhar → virar → revelar significados (sem pergunta escrita)
6. **Enciclopédia** — cartas, símbolos e cores, com imagens (acessada via grade "Explore" do Início)
7. **Perfil** — estatísticas, conquistas, configurações (+ verificação de assets oculta)

**Bottom nav (4 abas): Início · Jornada · Tiragem · Perfil.**

---

## Critérios de aceite

- [ ] Roda em 390px sem scroll horizontal nem overflow
- [ ] Uma lição completa funciona ponta a ponta
- [ ] Os 7 tipos de questão são gerados dinamicamente do JSON
- [ ] Imagens respeitam 1:1.75 e degradam sem quebrar layout quando o arquivo falta
- [ ] Símbolo renderiza emoji + label a partir do campo `emoji`
- [ ] Feedback mostra outras cartas com o mesmo símbolo/cor, clicáveis
- [ ] Mundos independentes — nenhum bloqueia outro, nenhum travado
- [ ] Item errado reaparece em lição posterior
- [ ] Tiragem sorteia sem repetir carta e só revela significado quando pedido
- [ ] Tiragem não pontua nada nem afeta mundos, XP ou ofensiva
- [ ] Tiragem não tem campo de pergunta nem chama IA
- [ ] Tela de verificação de assets lista as 78 cartas e sinaliza imagem faltante
- [ ] Nenhum `id` ou `image` do `cards.json` fornecido foi alterado
- [ ] App funciona inteiro sem conexão
- [ ] Adicionar uma carta nova ao JSON não exige tocar em nenhum outro arquivo

---

## Como trabalhar

**Fase 1 (atual):** preenchimento do `cards.json` + demais dados + `assets.js` + motor de questões + tela de lição com feedback completo. Design ainda pode ser cru.

**Fases seguintes (referência, não executar ainda):**
- Fase 2: XP, ofensiva, revisão embutida, refino do fim de lição
- Fase 3: configurações + enciclopédia
- Fase 4: refino visual com a paleta escura e o mascote
- Fase 5: **Tiragem** — tiragem livre, virar cartas, revelar significados, invertidas
- Fase 6: dataset completo das 78 cartas (já concluído em 2026-07-24, ver Log de decisões)
