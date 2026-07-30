import { suitsById, cards as allCards } from '../deck.js';
import { pickOne, shuffle } from '../shuffle.js';

// Naipe → qual destas cartas pertence a ele. Distratores vêm um de cada
// outro naipe (sempre existem exatamente 3 outros naipes). Opções em texto.
// Removido do Mundo Naipes por feedback do usuário (pergunta fraca) — mantido
// como gerador testado, igual carta-naipe/cor-significado/cor-carta.
export const id = 'naipe-carta';
export const difficulty = 'medio';

export function isApplicable(pool) {
  return pool.some((s) => allCards.some((c) => c.suit === s.id));
}

export function generate(pool, targetId) {
  const candidates = pool.filter((s) => allCards.some((c) => c.suit === s.id));
  const suit = targetId ? suitsById[targetId] : pickOne(candidates);
  const correctCard = pickOne(allCards.filter((c) => c.suit === suit.id));

  const otherSuitIds = [...new Set(allCards.map((c) => c.suit).filter((s) => s && s !== suit.id))];
  const distractors = shuffle(otherSuitIds)
    .slice(0, 3)
    .map((sId) => pickOne(allCards.filter((c) => c.suit === sId)));

  const options = shuffle([correctCard, ...distractors]).map((c) => ({
    id: c.id,
    label: c.name,
    correct: c.id === correctCard.id,
  }));

  return {
    type: id,
    mode: 'single',
    prompt: { kind: 'naipe', suit, question: 'Qual destas cartas pertence a este naipe?' },
    options,
    subject: { kind: 'card', id: correctCard.id },
    explanation: `${correctCard.name} pertence ao naipe de ${suit.name}.`,
    focusCardId: correctCard.id,
  };
}
