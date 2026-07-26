import { cards as allCards, cardsById } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

// Carta → conceito geral (a frase inteira de meaning_upright, não palavras
// soltas como carta-keywords). Opções são frases completas de outras cartas.
export const id = 'carta-conceito';
export const difficulty = 'medio';

export function isApplicable(pool) {
  return pool.some((c) => c.meaning_upright);
}

export function generate(pool, targetId) {
  const candidates = pool.filter((c) => c.meaning_upright);
  const card = targetId ? cardsById[targetId] : pickOne(candidates);
  const groupKey = (c) => (c.arcana === 'maior' ? 'maior' : c.suit);
  const distractors = pickDistractors({
    pool: allCards.filter((c) => c.meaning_upright),
    correct: card,
    groupKey,
    count: 3,
  });

  const options = shuffle([card, ...distractors]).map((c) => ({
    id: c.id,
    label: c.meaning_upright,
    correct: c.id === card.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'card', card, question: 'Qual conceito está mais associado a esta carta?' },
    options,
    subject: { kind: 'card', id: card.id },
    explanation: card.meaning_upright,
    focusCardId: card.id,
  };
}
