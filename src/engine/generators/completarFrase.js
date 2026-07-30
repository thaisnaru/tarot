import { cards as allCards, cardsById } from '../deck.js';
import { pickOne, shuffle } from '../shuffle.js';

// "Complete a frase": mostra "{carta} está relacionado a ___, ___ e ___" e
// pede pra tocar nas palavras certas entre as opções — mesma mecânica de
// múltipla escolha do carta-keywords (mode: 'multi'), só muda a moldura da
// pergunta pra preenchimento de lacunas em vez de "quais são as palavras-
// chave?". Reaproveita o banco de distratores por naipe/grupo.
export const id = 'completar-frase';
export const difficulty = 'medio';

const BLANK_COUNT = 3;

export function isApplicable(pool) {
  return pool.some((c) => c.keywords?.length >= BLANK_COUNT);
}

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

function blanksText(count) {
  const blanks = Array(count).fill('___');
  if (count <= 1) return blanks.join('');
  return `${blanks.slice(0, -1).join(', ')} e ${blanks[blanks.length - 1]}`;
}

export function generate(pool, targetId) {
  const candidates = pool.filter((c) => c.keywords?.length >= BLANK_COUNT);
  const card = targetId ? cardsById[targetId] : pickOne(candidates);
  const group = card.suit ?? 'maior';

  const correctKeywords = shuffle(card.keywords).slice(0, BLANK_COUNT);
  const correctLabels = new Set(correctKeywords.map((k) => k.toLowerCase()));

  const bank = keywordBank().filter(
    (entry) => entry.cardId !== card.id && !correctLabels.has(entry.label.toLowerCase())
  );
  const sameGroup = bank.filter((entry) => entry.group === group);
  const others = bank.filter((entry) => entry.group !== group);

  const distractorCount = BLANK_COUNT + 1;
  const distractorEntries = shuffle(sameGroup).slice(0, distractorCount);
  if (distractorEntries.length < distractorCount) {
    distractorEntries.push(...shuffle(others).slice(0, distractorCount - distractorEntries.length));
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
    prompt: {
      kind: 'complete',
      card,
      blanksText: blanksText(correctOptions.length),
      question: 'Toque nas palavras que completam a frase corretamente',
    },
    options,
    subject: { kind: 'card', id: card.id },
    explanation: `${card.name} está relacionado a ${correctKeywords.join(', ')}.`,
    focusCardId: card.id,
  };
}
