import { colorsById, resolveCards, cards as allCards } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

// Cor → qual carta tem associação importante com ela. Opções em texto.
export const id = 'cor-carta';
export const difficulty = 'dificil';

export function isApplicable(pool) {
  return pool.some((c) => c.appears_in?.length >= 1);
}

export function generate(pool, targetId) {
  const candidates = pool.filter((c) => c.appears_in?.length >= 1);
  const color = targetId ? colorsById[targetId] : pickOne(candidates);
  const correctCard = pickOne(resolveCards(color.appears_in));

  const otherCardsPool = allCards.filter((c) => !color.appears_in.includes(c.id));
  const groupKey = (c) => (c.arcana === 'maior' ? 'maior' : c.suit);
  const distractors = pickDistractors({ pool: otherCardsPool, correct: correctCard, groupKey, count: 3 });

  const options = shuffle([correctCard, ...distractors]).map((c) => ({
    id: c.id,
    label: c.name,
    correct: c.id === correctCard.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'color', color, question: 'Qual carta tem uma associação importante com esta cor?' },
    options,
    subject: { kind: 'color', id: color.id },
    explanation: `${color.name} está associada a ${correctCard.name}.`,
    focusCardId: correctCard.id,
  };
}
