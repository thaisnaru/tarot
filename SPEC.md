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
  - Ressalva: nos Arcanos Menores a fonte não tem símbolos/cores individuais por carta como nos Maiores — só a cena geral (`symbols` com 1 item) e o elemento do naipe como "cor" (`dominant_colors` com 1 item, ex. `["Fogo"]`). Não é erro de parsing, é limitação do documento de origem.
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
