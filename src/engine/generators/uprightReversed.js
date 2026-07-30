import { cardsById } from '../deck.js';
import { pickOne } from '../shuffle.js';

// Mostra a carta + UMA frase de significado (upright OU reversed, sorteado)
// e pede pra classificar. Binário, sem pista visual — testa se o jogador
// realmente sabe diferenciar os dois sentidos, não só decorar um resumo.
export const id = 'upright-reversed';
export const difficulty = 'dificil';

export function isApplicable(pool) {
  return pool.some((c) => c.meaning_upright && c.meaning_reversed);
}

export function generate(pool, targetId) {
  const candidates = pool.filter((c) => c.meaning_upright && c.meaning_reversed);
  const card = targetId ? cardsById[targetId] : pickOne(candidates);
  const showUpright = Math.random() < 0.5;
  const shownMeaning = showUpright ? card.meaning_upright : card.meaning_reversed;

  const options = [
    { id: 'upright', label: 'Normal', correct: showUpright },
    { id: 'reversed', label: 'Invertida', correct: !showUpright },
  ];

  return {
    type: id,
    mode: 'single',
    prompt: {
      kind: 'card-text',
      card,
      text: shownMeaning,
      question: `Este é o significado normal ou invertido de ${card.name}?`,
    },
    options,
    subject: { kind: 'card', id: card.id },
    explanation: `"${shownMeaning}" é o significado ${showUpright ? 'normal' : 'invertido'} de ${card.name}.`,
    focusCardId: card.id,
  };
}
