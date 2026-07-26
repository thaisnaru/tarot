import { cards as allCards, cardsById } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

// Direção inversa de carta-conceito: mostra o conceito, pede a carta.
// Opções são nomes em texto — a carta correta nunca aparece como imagem.
export const id = 'significado-carta';
export const difficulty = 'dificil';

export function isApplicable(pool) {
  return pool.some((c) => c.meaning_upright);
}

export function generate(pool, targetId) {
  const candidates = pool.filter((c) => c.meaning_upright);
  const card = targetId ? cardsById[targetId] : pickOne(candidates);
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
    prompt: { kind: 'text', text: card.meaning_upright, question: 'Qual carta está mais associada a este conceito?' },
    options,
    subject: { kind: 'card', id: card.id },
    explanation: `Esse conceito descreve ${card.name}.`,
    focusCardId: card.id,
  };
}
