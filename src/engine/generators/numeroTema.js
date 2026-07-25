import { numbers as allNumbers, cardsById } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

export const id = 'numero-tema';

export function isApplicable(pool) {
  return pool.some((c) => c.rank && allNumbers.some((n) => n.id === c.rank)) && allNumbers.length >= 2;
}

export function generate(pool, targetId) {
  const candidates = pool.filter((c) => c.rank && allNumbers.some((n) => n.id === c.rank));
  const card = targetId ? cardsById[targetId] : pickOne(candidates);
  const correctNumber = allNumbers.find((n) => n.id === card.rank);
  const distractors = pickDistractors({
    pool: allNumbers,
    correct: correctNumber,
    groupKey: () => 'numero',
    count: 3,
  });

  const options = shuffle([correctNumber, ...distractors]).map((n) => ({
    id: n.id,
    label: n.theme,
    correct: n.id === correctNumber.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'card', card, question: `Qual é o tema numerológico de ${card.name}?` },
    options,
    subject: { kind: 'card', id: card.id },
    explanation: `${card.name} (${correctNumber.name}) carrega o tema: ${correctNumber.theme}.`,
    focusCardId: card.id,
  };
}
