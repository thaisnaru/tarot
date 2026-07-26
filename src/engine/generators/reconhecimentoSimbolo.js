import { symbolsForPool, symbols as allSymbols, cardsById } from '../deck.js';
import { pickOne, shuffle } from '../shuffle.js';

// Mostra a carta, pergunta qual símbolo (dentre 4) realmente aparece nela —
// observação, não significado. 3 distratores são símbolos reais que NÃO
// estão nesta carta.
export const id = 'reconhecimento-simbolo';
export const difficulty = 'medio';

export function isApplicable(pool) {
  return pool.some((c) => symbolsForPool([c]).length >= 1);
}

export function generate(pool, targetId) {
  const candidates = pool.filter((c) => symbolsForPool([c]).length >= 1);
  const card = targetId ? cardsById[targetId] : pickOne(candidates);
  const cardSymbols = symbolsForPool([card]);
  const correct = pickOne(cardSymbols);

  const cardSymbolIds = new Set(cardSymbols.map((s) => s.id));
  const notOnCard = allSymbols.filter((s) => !cardSymbolIds.has(s.id));
  const distractors = shuffle(notOnCard).slice(0, 3);

  const options = shuffle([correct, ...distractors]).map((s) => ({
    id: s.id,
    symbol: s,
    correct: s.id === correct.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'card', card, question: 'Qual destes símbolos aparece nesta carta?' },
    options,
    subject: { kind: 'symbol', id: correct.id },
    explanation: `${correct.emoji} ${correct.name} aparece em ${card.name}.`,
    focusCardId: card.id,
  };
}
