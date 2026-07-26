import { cards, symbols, colors, numbers, suits, resolveCards, symbolsForPool, colorsOfCard } from './deck.js';
import { GENERATORS_BY_ID } from './generators/index.js';
import { getItemAverage } from './mastery.js';
import { pickOne, shuffle } from './shuffle.js';

let counter = 0;
function nextId(type) {
  counter += 1;
  return `${type}-${counter}-${Math.random().toString(36).slice(2, 7)}`;
}

// Pool de itens de um mundo, conforme itemType — é sobre isso que a
// ponderação adaptativa e a lista de progresso da Jornada rodam.
// `groupValue`, quando o mundo tem `groupBy` (Simbologia por categoria,
// Cortes por rank), restringe aos itens daquele grupo só.
export function getMundoItems(mundo, { groupValue } = {}) {
  let items;
  switch (mundo.itemType) {
    case 'card':
      items = resolveCards(mundo.scope?.cards ?? []);
      break;
    case 'symbol':
      items = symbols;
      break;
    case 'color':
      items = colors;
      break;
    case 'number':
      items = numbers;
      break;
    case 'suit':
      items = suits;
      break;
    default:
      items = [];
  }

  if (groupValue != null && mundo.groupBy) {
    items = items.filter((item) => (item[mundo.groupBy] ?? 'outro') === groupValue);
  }

  return items;
}

// Escolhe entre alguns geradores candidatos (o primeiro cujo isApplicable
// aceita o pool dado), retornando null se nenhum servir — o chamador tenta
// outro item/skill em vez de travar a sessão.
function generateFromCandidates(candidateIds, pool, targetId) {
  const usable = shuffle(candidateIds).filter((gid) => GENERATORS_BY_ID[gid].isApplicable(pool));
  if (usable.length === 0) return null;
  const chosen = usable[0];
  return GENERATORS_BY_ID[chosen].generate(pool, targetId);
}

// Tenta gerar uma pergunta testando `item` numa `skill` específica do mundo.
// Retorna { question, masteryTarget } ou null se não der pra gerar.
function buildQuestionFor(mundo, item, skill) {
  if (mundo.itemType === 'card') {
    if (skill === 'reconhecimento') {
      // reconhecimento-simbolo só funciona pra cartas com símbolos catalogados
      // (hoje só os Arcanos Maiores — ver symbols.json). generateFromCandidates
      // checa isApplicable contra o pool INTEIRO de cartas (sempre tem algum
      // maior com símbolo), não contra `item` especificamente — sem esse
      // filtro aqui, cai nesse gerador pra uma carta menor (sem símbolos) e
      // quebra ao tentar montar as opções.
      const candidateIds = symbolsForPool([item]).length > 0
        ? ['reconhecimento-carta', 'reconhecimento-simbolo']
        : ['reconhecimento-carta'];
      const question = generateFromCandidates(candidateIds, cards, item.id);
      return question ? { question, masteryTarget: { itemId: item.id, skill } } : null;
    }
    if (skill === 'significado') {
      const question = generateFromCandidates(['carta-conceito', 'upright-reversed'], cards, item.id);
      return question ? { question, masteryTarget: { itemId: item.id, skill } } : null;
    }
    if (skill === 'keywords') {
      if (!GENERATORS_BY_ID['carta-keywords'].isApplicable([item])) return null;
      return {
        question: GENERATORS_BY_ID['carta-keywords'].generate(cards, item.id),
        masteryTarget: { itemId: item.id, skill },
      };
    }
    if (skill === 'numerologia') {
      // Maiores usam a numeração 0-21 (numero-carta-maior); menores usam o
      // rank ace-king (numero-tema) — são dois sistemas de numerologia
      // diferentes, não dá pra misturar no mesmo gerador.
      const genId = item.arcana === 'maior' ? 'numero-carta-maior' : 'numero-tema';
      if (!GENERATORS_BY_ID[genId].isApplicable([item])) return null;
      return {
        question: GENERATORS_BY_ID[genId].generate(cards, item.id),
        masteryTarget: { itemId: item.id, skill },
      };
    }
    if (skill === 'cores') {
      if (!GENERATORS_BY_ID['carta-cor-significado'].isApplicable([item])) return null;
      return {
        question: GENERATORS_BY_ID['carta-cor-significado'].generate(cards, item.id),
        masteryTarget: { itemId: item.id, skill },
      };
    }
    if (skill === 'simbolos') {
      return buildSimbolosQuestionForCard(item);
    }
    return null;
  }

  if (mundo.itemType === 'symbol') {
    const question = generateFromCandidates(
      ['simbolo-significado', 'significado-simbolo', 'simbolo-carta'],
      cards,
      item.id
    );
    return question ? { question, masteryTarget: { itemId: item.id, skill } } : null;
  }

  if (mundo.itemType === 'color') {
    const question = generateFromCandidates(['cor-significado', 'cor-carta'], cards, item.id);
    return question ? { question, masteryTarget: { itemId: item.id, skill } } : null;
  }

  if (mundo.itemType === 'number') {
    // numero-tema precisa de uma carta representante daquele rank pra
    // mostrar a imagem — sorteada entre os 4 naipes (não sempre a mesma),
    // senão o Mundo Numerologia vira "só cartas de Paus" (o primeiro naipe
    // em cards.json) e o jogador nunca vê 3 de Copas/Ouros/Espadas.
    const representatives = cards.filter((c) => c.rank === item.id);
    if (representatives.length === 0) return null;
    const representative = pickOne(representatives);
    return {
      question: GENERATORS_BY_ID['numero-tema'].generate(cards, representative.id),
      masteryTarget: { itemId: item.id, skill },
    };
  }

  if (mundo.itemType === 'suit') {
    const question = generateFromCandidates(
      [
        'naipe-significado',
        'naipe-elemento',
        'naipe-carta',
        'conceito-naipe',
        'naipe-aplicacao',
        'naipe-comparacao',
      ],
      suits,
      item.id
    );
    return question ? { question, masteryTarget: { itemId: item.id, skill } } : null;
  }

  return null;
}

// 'simbolos' de uma carta: alterna entre pergunta sobre um símbolo
// específico dela (contextualizado), detetive de múltiplos símbolos, e
// pareamento (mecânica diferente, mesma carta).
function buildSimbolosQuestionForCard(card) {
  const cardSymbols = symbolsForPool([card]);
  if (cardSymbols.length === 0) return null;

  const candidates = ['carta-simbolo-significado'];
  if (cardSymbols.length >= 3) candidates.push('detetive-simbolos');
  if (cardSymbols.length >= 4) candidates.push('pareamento');

  const chosenId = pickOne(candidates);
  const pool = chosenId === 'pareamento' ? [card] : cards;
  const targetId = chosenId === 'pareamento' ? undefined : card.id;
  if (!GENERATORS_BY_ID[chosenId].isApplicable([card])) return null;

  return {
    question: GENERATORS_BY_ID[chosenId].generate(pool, targetId),
    masteryTarget: { itemId: card.id, skill: 'simbolos' },
  };
}

// Habilidades realmente aplicáveis a um item específico (pra cartas, pode
// variar — nem toda carta maior tem cor mapeada em colors.json, por ex).
function skillsForItem(mundo, item) {
  if (mundo.itemType !== 'card') return mundo.skills;
  return mundo.skills.filter((skill) => {
    if (skill === 'reconhecimento') return true;
    if (skill === 'significado') return Boolean(item.meaning_upright && item.meaning_reversed);
    if (skill === 'keywords') return item.keywords?.length >= 2;
    if (skill === 'numerologia') return item.arcana === 'maior' ? item.number != null : Boolean(item.rank);
    if (skill === 'cores') return colorsOfCard(item).length > 0;
    if (skill === 'simbolos') return symbolsForPool([item]).length > 0;
    return true;
  });
}

// Sorteio sem reposição de todas as combinações (item, skill) do pool,
// ponderado pelo domínio do item (menor domínio = mais chance de vir
// primeiro). Cada combinação aparece exatamente uma vez por "volta" — é
// isso que garante que a sessão não repita a mesma pergunta sem motivo:
// só volta a repetir depois de esgotar toda a variedade disponível.
function weightedRound(mundo, pool) {
  const combos = pool.flatMap((item) => skillsForItem(mundo, item).map((skill) => ({ item, skill })));
  const remaining = [...combos];
  const ordered = [];

  while (remaining.length > 0) {
    const weights = remaining.map(({ item }) => {
      const avg = getItemAverage(item.id, skillsForItem(mundo, item));
      return (100 - (avg ?? 0)) + 10;
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    let idx = weights.length - 1;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    ordered.push(remaining[idx]);
    remaining.splice(idx, 1);
  }

  return ordered;
}

// Sessão adaptativa: sem `focusItemId`, sorteia entre todos os itens do
// mundo (ou do grupo, se `groupValue`), ponderando pelos de menor domínio.
// Com `focusItemId`, restringe a esse item só, variando entre as
// habilidades aplicáveis a ele. Nunca repete a mesma combinação
// item+habilidade dentro da sessão antes de esgotar as demais.
export function buildAdaptiveSession(mundo, { focusItemId, groupValue } = {}, size = 10) {
  const allItems = getMundoItems(mundo, { groupValue });
  if (allItems.length === 0) return [];

  const pool = focusItemId ? allItems.filter((i) => i.id === focusItemId) : allItems;
  if (pool.length === 0) return [];

  const skills = mundo.skills ?? [];
  if (skills.length === 0) return [];

  const questions = [];
  const maxAttempts = size * 20;
  let attempts = 0;
  let queue = [];

  while (questions.length < size && attempts < maxAttempts) {
    attempts += 1;

    if (queue.length === 0) {
      queue = weightedRound(mundo, pool);
      if (queue.length === 0) break;
    }

    const { item, skill } = queue.shift();
    const built = buildQuestionFor(mundo, item, skill);
    if (!built) continue;

    questions.push({
      ...built.question,
      id: nextId(built.question.type),
      masteryTarget: built.masteryTarget,
    });
  }

  return questions;
}

// Gera uma pergunta de reforço pro mesmo item+habilidade de uma pergunta que
// o jogador acabou de errar — usada pra reinjetá-la mais adiante na mesma
// sessão (ver LicaoScreen). Reconstrói do zero (não reaproveita o objeto
// antigo), então distratores e, quando há mais de um gerador candidato pra
// aquela habilidade, o próprio formato da pergunta variam.
export function buildFollowUpQuestion(mundo, question) {
  const target = question?.masteryTarget;
  if (!target) return null;

  const items = getMundoItems(mundo);
  const item = items.find((i) => i.id === target.itemId);
  if (!item) return null;

  const built = buildQuestionFor(mundo, item, target.skill);
  if (!built) return null;

  return {
    ...built.question,
    id: nextId(built.question.type),
    masteryTarget: built.masteryTarget,
  };
}
