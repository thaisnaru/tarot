import { getMajors, cardsById } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

// Número do Arcano Maior (0-21) → qual carta. Numerologia dos Maiores é um
// sistema separado da numerologia de naipe/rank dos Menores (Mundo 4) —
// aqui não existe "naipe", é só a sequência 0-21. Opções em texto.
export const id = 'numero-carta-maior';
export const difficulty = 'medio';

export function isApplicable(pool) {
  return pool.some((c) => c.arcana === 'maior' && c.number != null);
}

export function generate(pool, targetId) {
  const candidates = pool.filter((c) => c.arcana === 'maior' && c.number != null);
  const card = targetId ? cardsById[targetId] : pickOne(candidates);

  const majors = getMajors();
  const distractors = pickDistractors({ pool: majors, correct: card, groupKey: () => 'maior', count: 3 });

  const options = shuffle([card, ...distractors]).map((c) => ({
    id: c.id,
    label: c.name,
    correct: c.id === card.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'numero', numero: card.number, question: `Qual Arcano Maior corresponde ao número ${card.number}?` },
    options,
    subject: { kind: 'card', id: card.id },
    explanation: `O número ${card.number} corresponde a ${card.name}.`,
    focusCardId: card.id,
  };
}
