import { suits as allSuits, suitsById } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

// Direção inversa de naipe-significado: mostra a esfera de vida (sem citar
// o nome do naipe) e pede pra identificar o naipe. Opções são só nomes —
// texto puro, sem emoji/spoiler.
export const id = 'conceito-naipe';
export const difficulty = 'medio';

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
    label: s.name,
    correct: s.id === correct.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'text', text: correct.sphere, question: 'Qual naipe está mais relacionado a este conjunto de temas?' },
    options,
    subject: { kind: 'naipe', id: correct.id },
    explanation: `${correct.sphere} é a esfera de vida associada a ${correct.name}.`,
    focusCardId: null,
  };
}
