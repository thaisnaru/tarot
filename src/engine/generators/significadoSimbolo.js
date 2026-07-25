import { symbols as allSymbols, symbolsById, symbolsForPool } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

export const id = 'significado-simbolo';

export function isApplicable(pool) {
  return symbolsForPool(pool).length >= 1;
}

export function generate(pool, targetId) {
  const candidates = symbolsForPool(pool);
  const correct = targetId ? symbolsById[targetId] : pickOne(candidates);
  const distractors = pickDistractors({
    pool: allSymbols,
    correct,
    groupKey: (s) => s.category,
    count: 3,
  });

  const options = shuffle([correct, ...distractors]).map((s) => ({
    id: s.id,
    symbol: s,
    correct: s.id === correct.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'text', text: correct.meaning, question: 'Qual símbolo corresponde a este significado?' },
    options,
    subject: { kind: 'symbol', id: correct.id },
    explanation: correct.meaning,
    focusCardId: correct.appears_in?.[0] ?? null,
  };
}
