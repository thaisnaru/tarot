import { symbolsById, resolveCards, cards as allCards } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

// Símbolo → em qual carta ele aparece. Opções são nomes de carta em texto,
// nunca miniaturas (a imagem entregaria a resposta na hora).
export const id = 'simbolo-carta';
export const difficulty = 'dificil';

export function isApplicable(pool) {
  return pool.some((s) => s.appears_in?.length >= 1);
}

export function generate(pool, targetId) {
  const candidates = pool.filter((s) => s.appears_in?.length >= 1);
  const symbol = targetId ? symbolsById[targetId] : pickOne(candidates);
  const correctCard = pickOne(resolveCards(symbol.appears_in));

  const otherCardsPool = allCards.filter((c) => !symbol.appears_in.includes(c.id));
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
    prompt: { kind: 'symbol', symbol, question: 'Em qual destas cartas este símbolo aparece?' },
    options,
    subject: { kind: 'symbol', id: symbol.id },
    explanation: `${symbol.emoji} ${symbol.name} aparece em ${correctCard.name}.`,
    focusCardId: correctCard.id,
  };
}
