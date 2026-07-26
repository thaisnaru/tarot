import { symbolsForPool, cards as allCards, cardsById } from '../deck.js';
import { pickOne, shuffle } from '../shuffle.js';

// Mostra 3-4 emojis (símbolos reais daquela carta) como "pistas" e pergunta
// qual carta os reúne todos. Distratores preferem cartas que compartilham
// ALGUNS símbolos das pistas (mas não todos) — mais difícil que aleatório.
export const id = 'detetive-simbolos';
export const difficulty = 'mestre';

export function isApplicable(pool) {
  return pool.some((c) => symbolsForPool([c]).length >= 3);
}

export function generate(pool, targetId) {
  const candidates = pool.filter((c) => symbolsForPool([c]).length >= 3);
  const card = targetId ? cardsById[targetId] : pickOne(candidates);
  const cardSymbols = symbolsForPool([card]);
  const clueCount = Math.min(4, cardSymbols.length);
  const clues = shuffle(cardSymbols).slice(0, clueCount);
  const clueIds = new Set(clues.map((s) => s.id));

  const otherCards = allCards.filter((c) => c.id !== card.id);
  const scored = otherCards.map((c) => {
    const theirSymbolIds = new Set(symbolsForPool([c]).map((s) => s.id));
    let overlap = 0;
    clueIds.forEach((id) => {
      if (theirSymbolIds.has(id)) overlap += 1;
    });
    return { card: c, overlap };
  });
  scored.sort((a, b) => b.overlap - a.overlap);
  const distractors = scored.slice(0, 3).map((s) => s.card);
  while (distractors.length < 3) {
    const extra = pickOne(otherCards);
    if (!distractors.find((d) => d.id === extra.id)) distractors.push(extra);
  }

  const options = shuffle([card, ...distractors]).map((c) => ({
    id: c.id,
    label: c.name,
    correct: c.id === card.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'emoji-combo', emojis: clues.map((s) => s.emoji), question: 'Qual carta reúne todos estes elementos?' },
    options,
    subject: { kind: 'card', id: card.id },
    explanation: `${clues.map((s) => `${s.emoji} ${s.name}`).join(', ')} aparecem em ${card.name}.`,
    focusCardId: card.id,
  };
}
