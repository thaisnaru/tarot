import { suits as allSuits, suitsById } from '../deck.js';
import { pickOne, shuffle } from '../shuffle.js';

// Compara dois naipes ao mesmo tempo — "qual a diferença entre a energia de
// Copas e Espadas?" — em vez de perguntar sobre um naipe isolado. Todas as
// opções citam os dois nomes, então nenhuma entrega a resposta só pelo texto
// mencionar o naipe certo (o que muda é qual esfera vai com qual naipe).
export const id = 'naipe-comparacao';
export const difficulty = 'dificil';

export function isApplicable(pool) {
  return pool.length >= 2;
}

function pairLabel(a, b, sphereA, sphereB) {
  return `${a.name} está mais ligado a ${sphereA.toLowerCase()}; ${b.name}, a ${sphereB.toLowerCase()}.`;
}

export function generate(pool, targetId) {
  const a = targetId ? suitsById[targetId] : pickOne(pool.length ? pool : allSuits);
  const others = allSuits.filter((s) => s.id !== a.id);
  const b = pickOne(others);

  const correctLabel = pairLabel(a, b, a.sphere, b.sphere);
  const spheres = allSuits.map((s) => s.sphere);
  const wrongCombos = [];
  spheres.forEach((sphereA) => {
    spheres.forEach((sphereB) => {
      if (sphereA === sphereB) return;
      if (sphereA === a.sphere && sphereB === b.sphere) return;
      wrongCombos.push([sphereA, sphereB]);
    });
  });
  const distractorLabels = shuffle(wrongCombos)
    .slice(0, 3)
    .map(([sphereA, sphereB]) => pairLabel(a, b, sphereA, sphereB));

  const options = shuffle([
    { id: 'correct', label: correctLabel, correct: true },
    ...distractorLabels.map((label, i) => ({ id: `wrong-${i}`, label, correct: false })),
  ]);

  return {
    type: id,
    mode: 'single',
    prompt: {
      kind: 'naipe-pair',
      suitA: a,
      suitB: b,
      question: `Qual é a principal diferença entre a energia de ${a.name} e ${b.name}?`,
    },
    options,
    subject: { kind: 'naipe', id: a.id },
    explanation: correctLabel,
    focusCardId: null,
  };
}
