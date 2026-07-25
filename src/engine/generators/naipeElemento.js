import { suits as allSuits, suitsById } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

// "Paus está ligado a qual elemento?" — conjunto fechado dos 4 naipes,
// sempre as outras 3 opções (igual ao antigo carta-naipe, mas partindo do
// nome do naipe, não de uma imagem de carta).
export const id = 'naipe-elemento';

export function isApplicable(pool) {
  return pool.length >= 2;
}

export function generate(pool, targetId) {
  const correct = targetId ? suitsById[targetId] : pickOne(pool.length ? pool : allSuits);
  const distractors = pickDistractors({
    pool: allSuits,
    correct,
    groupKey: () => 'naipe',
    count: 3,
  });

  const options = shuffle([correct, ...distractors]).map((s) => ({
    id: s.id,
    label: s.element,
    correct: s.id === correct.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'naipe', suit: correct, question: 'A qual elemento este naipe está ligado?' },
    options,
    subject: { kind: 'naipe', id: correct.id },
    explanation: `${correct.name} está associado ao elemento ${correct.element}.`,
    focusCardId: null,
  };
}
