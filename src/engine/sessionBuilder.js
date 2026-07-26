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
export function getMundoItems(mundo) {
  switch (mundo.itemType) {
    case 'card':
      return resolveCards(mundo.scope?.cards ?? []);
    case 'symbol':
      return symbols;
    case 'color':
      return colors;
    case 'number':
      return numbers;
    case 'suit':
      return suits;
    default:
      return [];
  }
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
      const question = generateFromCandidates(['reconhecimento-carta', 'reconhecimento-simbolo'], cards, item.id);
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
    // mostrar a imagem — qualquer naipe serve, o que importa é o rank.
    const representative = cards.find((c) => c.rank === item.id);
    if (!representative) return null;
    return {
      question: GENERATORS_BY_ID['numero-tema'].generate(cards, representative.id),
      masteryTarget: { itemId: item.id, skill },
    };
  }

  if (mundo.itemType === 'suit') {
    const question = generateFromCandidates(['naipe-significado', 'naipe-elemento', 'naipe-carta'], suits, item.id);
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

// Sessão adaptativa: sem `focusItemId`, sorteia itens ponderando pelos de
// menor domínio (mas nunca zera a chance dos já dominados). Com
// `focusItemId`, restringe a esse item só, variando entre as habilidades
// aplicáveis a ele.
export function buildAdaptiveSession(mundo, { focusItemId } = {}, size = 10) {
  const allItems = getMundoItems(mundo);
  if (allItems.length === 0) return [];

  const pool = focusItemId ? allItems.filter((i) => i.id === focusItemId) : allItems;
  if (pool.length === 0) return [];

  const skills = mundo.skills ?? [];
  if (skills.length === 0) return [];

  const questions = [];
  const maxAttempts = size * 6;
  let attempts = 0;

  while (questions.length < size && attempts < maxAttempts) {
    attempts += 1;

    let item;
    if (focusItemId) {
      item = pool[0];
    } else {
      const weighted = pool.flatMap((candidate) => {
        const avg = getItemAverage(candidate.id, skillsForItem(mundo, candidate));
        const weight = (100 - (avg ?? 0)) + 10;
        return Array(Math.max(1, Math.round(weight / 10))).fill(candidate);
      });
      item = pickOne(weighted.length ? weighted : pool);
    }

    const applicableSkills = skillsForItem(mundo, item);
    if (applicableSkills.length === 0) continue;
    const skill = pickOne(applicableSkills);

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
