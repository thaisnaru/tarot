import { symbols as allSymbols, symbolsForPool, cardsById } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

// Mostra a carta inteira e pergunta sobre UM símbolo específico dela —
// "Nesta carta, o que significa a Rosa branca?" — em vez do símbolo isolado
// sem contexto (ver simbolo-significado). Mais específico, menos abstrato.
export const id = 'carta-simbolo-significado';

export function isApplicable(pool) {
  return pool.some((c) => symbolsForPool([c]).length >= 1);
}

export function generate(pool, targetId) {
  const candidates = pool.filter((c) => symbolsForPool([c]).length >= 1);
  const card = targetId ? cardsById[targetId] : pickOne(candidates);
  const cardSymbols = symbolsForPool([card]);
  const correct = pickOne(cardSymbols);

  const distractors = pickDistractors({
    pool: allSymbols,
    correct,
    groupKey: (s) => s.category,
    count: 3,
  });

  const options = shuffle([correct, ...distractors]).map((s) => ({
    id: s.id,
    label: s.meaning,
    correct: s.id === correct.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'card', card, question: `Nesta carta, o que significa ${correct.emoji} ${correct.name}?` },
    options,
    subject: { kind: 'symbol', id: correct.id },
    explanation: correct.meaning,
    focusCardId: card.id,
  };
}
