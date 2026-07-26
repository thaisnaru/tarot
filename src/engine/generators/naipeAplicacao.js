import { suits as allSuits, suitsById } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

// Cenário de leitura montado a partir das keywords reais do naipe (não é
// texto inventado à mão — só combina dados já existentes em suits.json) e
// pede qual naipe oferece o contexto principal pra interpretar aquilo.
export const id = 'naipe-aplicacao';
export const difficulty = 'medio';

export function isApplicable(pool) {
  return pool.some((s) => s.keywords?.length >= 2);
}

export function generate(pool, targetId) {
  const candidates = pool.filter((s) => s.keywords?.length >= 2);
  const correct = targetId ? suitsById[targetId] : pickOne(candidates.length ? candidates : allSuits);
  const kw = shuffle(correct.keywords).slice(0, 2).join(' e ');

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
    prompt: {
      kind: 'text',
      text: `Uma leitura está fortemente relacionada a ${kw}.`,
      question: 'Qual naipe oferece o principal contexto para interpretar essa energia?',
    },
    options,
    subject: { kind: 'naipe', id: correct.id },
    explanation: `${kw} fazem parte do universo de ${correct.name}: ${correct.sphere.toLowerCase()}.`,
    focusCardId: null,
  };
}
