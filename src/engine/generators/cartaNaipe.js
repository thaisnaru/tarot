import { suits as allSuits, cardsById } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

// Não usada ativamente em nenhum Mundo (reconhecer o naipe pela carta é
// trivial demais — ver Log de decisões da SPEC.md). Mantida como gerador
// testado; o Mundo Naipes usa naipeSignificado/naipeElemento em vez disso.
export const id = 'carta-naipe';

export function isApplicable(pool) {
  return pool.some((c) => c.suit) && allSuits.length >= 2;
}

export function generate(pool, targetId) {
  const candidates = pool.filter((c) => c.suit);
  const card = targetId ? cardsById[targetId] : pickOne(candidates);
  const correctSuit = allSuits.find((s) => s.id === card.suit);
  const distractors = pickDistractors({
    pool: allSuits,
    correct: correctSuit,
    groupKey: () => 'naipe',
    count: 3,
  });

  const options = shuffle([correctSuit, ...distractors]).map((s) => ({
    id: s.id,
    label: `${s.name} (${s.element})`,
    correct: s.id === correctSuit.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'card', card, question: `A qual naipe ${card.name} pertence?` },
    options,
    subject: { kind: 'card', id: card.id },
    explanation: `${card.name} pertence ao naipe de ${correctSuit.name}, associado ao elemento ${correctSuit.element}.`,
    focusCardId: card.id,
  };
}
