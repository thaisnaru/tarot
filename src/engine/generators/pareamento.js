import { symbolsForPool } from '../deck.js';
import { shuffle } from '../shuffle.js';

export const id = 'pareamento';
export const difficulty = 'medio';

export function isApplicable(pool) {
  return symbolsForPool(pool).length >= 4;
}

export function generate(pool) {
  const candidates = shuffle(symbolsForPool(pool)).slice(0, 4);

  const leftItems = candidates.map((s) => ({ id: `left::${s.id}`, symbolId: s.id, symbol: s }));
  const rightItemsUnshuffled = candidates.map((s) => ({
    id: `right::${s.id}`,
    symbolId: s.id,
    label: s.meaning,
  }));
  const rightItems = shuffle(rightItemsUnshuffled);

  const correctPairs = Object.fromEntries(leftItems.map((l) => [l.id, `right::${l.symbolId}`]));

  return {
    type: id,
    mode: 'pairs',
    prompt: { kind: 'pairs' },
    leftItems,
    rightItems,
    correctPairs,
    subject: null,
    explanation: 'Cada símbolo tem um significado próprio dentro da carta onde aparece.',
    focusCardId: candidates[0]?.appears_in?.[0] ?? null,
  };
}
