import { colors as allColors, colorsOfCard, cardsById } from '../deck.js';
import { pickDistractors } from '../distractors.js';
import { pickOne, shuffle } from '../shuffle.js';

// Mostra a carta inteira e pergunta sobre UMA cor específica dela —
// "Nesta carta, o que significa a cor amarela?" — em vez da cor isolada
// sem contexto (ver cor-significado). Mais específico, menos abstrato.
export const id = 'carta-cor-significado';

export function isApplicable(pool) {
  return pool.some((c) => colorsOfCard(c).length >= 1);
}

export function generate(pool, targetId) {
  const candidates = pool.filter((c) => colorsOfCard(c).length >= 1);
  const card = targetId ? cardsById[targetId] : pickOne(candidates);
  const cardColors = colorsOfCard(card);
  const correct = pickOne(cardColors);

  const distractors = pickDistractors({
    pool: allColors,
    correct,
    groupKey: () => 'cor',
    count: 3,
  });

  const options = shuffle([correct, ...distractors]).map((c) => ({
    id: c.id,
    label: c.meaning,
    correct: c.id === correct.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'card', card, question: `Nesta carta, o que significa a cor ${correct.name.toLowerCase()}?` },
    options,
    subject: { kind: 'color', id: correct.id },
    explanation: correct.meaning,
    focusCardId: card.id,
  };
}
