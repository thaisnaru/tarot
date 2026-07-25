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

// Tenta gerar uma pergunta testando `item` numa `skill` específica do mundo.
// Retorna { question, masteryTarget } ou null se não der pra gerar (o
// chamador tenta outro item/skill em vez de travar a sessão).
function buildQuestionFor(mundo, item, skill) {
  if (mundo.itemType === 'card') {
    if (skill === 'keywords') {
      if (!GENERATORS_BY_ID['carta-keywords'].isApplicable([item])) return null;
      return {
        question: GENERATORS_BY_ID['carta-keywords'].generate(cards, item.id),
        masteryTarget: { itemId: item.id, skill },
      };
    }
    if (skill === 'numerologia') {
      if (!GENERATORS_BY_ID['numero-tema'].isApplicable([item])) return null;
      return {
        question: GENERATORS_BY_ID['numero-tema'].generate(cards, item.id),
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
    const gen = pickOne(['simbolo-significado', 'significado-simbolo']);
    return {
      question: GENERATORS_BY_ID[gen].generate(cards, item.id),
      masteryTarget: { itemId: item.id, skill },
    };
  }

  if (mundo.itemType === 'color') {
    return {
      question: GENERATORS_BY_ID['cor-significado'].generate(cards, item.id),
      masteryTarget: { itemId: item.id, skill },
    };
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
    const gen = pickOne(['naipe-significado', 'naipe-elemento']);
    return {
      question: GENERATORS_BY_ID[gen].generate(suits, item.id),
      masteryTarget: { itemId: item.id, skill },
    };
  }

  return null;
}

// 'simbolos' de uma carta: na maioria das vezes pergunta sobre um símbolo
// específico DELA (carta-simbolo-significado, contextualizado); de vez em
// quando varia pro pareamento (mecânica diferente, mesma carta).
function buildSimbolosQuestionForCard(card) {
  const cardSymbols = symbolsForPool([card]);
  if (cardSymbols.length === 0) return null;

  if (cardSymbols.length >= 4 && Math.random() < 0.25 && GENERATORS_BY_ID['pareamento'].isApplicable([card])) {
    return {
      question: GENERATORS_BY_ID['pareamento'].generate([card]),
      masteryTarget: { itemId: card.id, skill: 'simbolos' },
    };
  }

  if (!GENERATORS_BY_ID['carta-simbolo-significado'].isApplicable([card])) return null;
  return {
    question: GENERATORS_BY_ID['carta-simbolo-significado'].generate(cards, card.id),
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
    if (skill === 'keywords') return item.keywords?.length >= 2;
    if (skill === 'numerologia') return Boolean(item.rank);
    if (skill === 'cores') return colorsOfCard(item).length > 0;
    if (skill === 'simbolos') return symbolsForPool([item]).length > 0;
    return true;
  });
}
