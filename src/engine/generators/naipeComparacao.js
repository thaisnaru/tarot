import { suits as allSuits } from '../deck.js';
import { shuffle } from '../shuffle.js';

// Pareamento dos 4 naipes com as 4 esferas de vida — pedido do usuário pra
// virar "estilo pareamento" em vez de escolha única (a comparação direta
// entre 2 naipes tinha pouca variedade de distratores plausíveis). Usa
// sempre os 4 naipes de uma vez, igual ao pareamento de símbolos.
export const id = 'naipe-comparacao';
export const difficulty = 'dificil';

export function isApplicable(pool) {
  return pool.length >= 4;
}

export function generate() {
  const suits = shuffle(allSuits);

  const leftItems = suits.map((s) => ({ id: `left::${s.id}`, suitId: s.id, label: s.name }));
  const rightItemsUnshuffled = suits.map((s) => ({ id: `right::${s.id}`, suitId: s.id, label: s.sphere }));
  const rightItems = shuffle(rightItemsUnshuffled);

  const correctPairs = Object.fromEntries(leftItems.map((l) => [l.id, `right::${l.suitId}`]));

  return {
    type: id,
    mode: 'pairs',
    prompt: { kind: 'pairs' },
    leftItems,
    rightItems,
    correctPairs,
    subject: null,
    explanation: 'Cada naipe tem uma esfera de vida própria dentro do Tarot.',
    focusCardId: null,
  };
}
