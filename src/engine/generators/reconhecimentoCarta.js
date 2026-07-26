import { cards as allCards, cardsById } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

// Reconhecimento puro: mostra a carta, pede o nome. Opções são só texto —
// nunca miniaturas de outras cartas, senão vira "reconhecer a imagem entre
// imagens" em vez de "saber o nome".
export const id = 'reconhecimento-carta';
export const difficulty = 'facil';

export function isApplicable(pool) {
  return pool.length >= 2;
}

export function generate(pool, targetId) {
  const card = targetId ? cardsById[targetId] : pickOne(pool);
  const groupKey = (c) => (c.arcana === 'maior' ? 'maior' : c.suit);
  const distractors = pickDistractors({ pool: allCards, correct: card, groupKey, count: 3 });

  const options = shuffle([card, ...distractors]).map((c) => ({
    id: c.id,
    label: c.name,
    correct: c.id === card.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'card', card, question: 'Qual é esta carta?' },
    options,
    subject: { kind: 'card', id: card.id },
    explanation: `Esta carta é ${card.name}.`,
    focusCardId: card.id,
  };
}
