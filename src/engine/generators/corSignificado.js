import { colors as allColors, colorsById, colorsForPool } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

export const id = 'cor-significado';

export function isApplicable(pool) {
  return colorsForPool(pool).length >= 1 && allColors.length >= 2;
}

export function generate(pool, targetId) {
  const candidates = colorsForPool(pool);
  const correct = targetId ? colorsById[targetId] : pickOne(candidates.length ? candidates : allColors);
  const distractors = pickDistractors({
    pool: allColors,
    correct,
    groupKey: () => 'cor',
    count: 3,
  });

  const options = shuffle([correct, ...distractors]).map((c) => ({
    id: c.id,
    label: c.meaning,
    correct: c.id === correct.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'color', color: correct, question: 'O que esta cor representa?' },
    options,
    subject: { kind: 'color', id: correct.id },
    explanation: correct.meaning,
    focusCardId: correct.appears_in?.[0] ?? null,
  };
}
