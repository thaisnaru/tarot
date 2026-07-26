import { cards as allCards, cardsById } from '../deck.js';
import { pickOne, shuffle } from '../shuffle.js';

export const id = 'carta-keywords';
export const difficulty = 'medio';

export function isApplicable(pool) {
  return pool.some((c) => c.keywords?.length >= 2);
}

// Monta o "banco global" de palavras-chave (uma entrada por carta+keyword)
// pra poder puxar distratores de outras cartas do mesmo naipe/grupo.
function keywordBank() {
  const bank = [];
  for (const card of allCards) {
    const group = card.suit ?? 'maior';
    for (const kw of card.keywords ?? []) {
      bank.push({ id: `${card.id}::${kw}`, label: kw, group, cardId: card.id });
    }
  }
  return bank;
}

export function generate(pool, targetId) {
  const candidates = pool.filter((c) => c.keywords?.length >= 2);
  const card = targetId ? cardsById[targetId] : pickOne(candidates);
  const group = card.suit ?? 'maior';

  const correctKeywords = shuffle(card.keywords).slice(0, 2);
  const correctLabels = new Set(correctKeywords.map((k) => k.toLowerCase()));

  const bank = keywordBank().filter(
    (entry) => entry.cardId !== card.id && !correctLabels.has(entry.label.toLowerCase())
  );
  const sameGroup = bank.filter((entry) => entry.group === group);
  const others = bank.filter((entry) => entry.group !== group);

  const distractorEntries = shuffle(sameGroup).slice(0, 3);
  if (distractorEntries.length < 3) {
    distractorEntries.push(...shuffle(others).slice(0, 3 - distractorEntries.length));
  }

  const correctOptions = correctKeywords.map((kw, i) => ({
    id: `${card.id}::correct::${i}`,
    label: kw,
    correct: true,
  }));
  const distractorOptions = distractorEntries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    correct: false,
  }));

  const options = shuffle([...correctOptions, ...distractorOptions]);

  return {
    type: id,
    mode: 'multi',
    expectedCorrectCount: correctOptions.length,
    prompt: { kind: 'card', card, question: `Quais são as ${correctOptions.length} palavras-chave de ${card.name}?` },
    options,
    subject: { kind: 'card', id: card.id },
    explanation: `As palavras-chave de ${card.name} são: ${correctKeywords.join(' e ')}.`,
    focusCardId: card.id,
  };
}
