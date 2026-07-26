import { suits as allSuits, suitsById } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

// Pergunta sobre o naipe em si (sem mostrar carta nenhuma) — "o que Paus
// representa?". Ver Log de decisões da SPEC.md: substitui carta-naipe como
// conteúdo do Mundo Naipes, que era reconhecimento trivial de imagem.
export const id = 'naipe-significado';
export const difficulty = 'facil';

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
    label: s.meaning,
    correct: s.id === correct.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'naipe', suit: correct, question: 'O que este naipe representa?' },
    options,
    subject: { kind: 'naipe', id: correct.id },
    explanation: correct.meaning,
    focusCardId: null,
  };
}
