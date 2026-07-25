import { shuffle } from './shuffle.js';

// Regra crítica dos distratores: opções erradas vêm preferencialmente da
// mesma "categoria" (groupKey) do item correto. Se não houver o suficiente
// na mesma categoria, completa com o resto do pool — nunca trava a lição
// por falta de opções.
export function pickDistractors({ pool, correct, groupKey, count, idKey = 'id' }) {
  const correctId = correct[idKey];
  const correctGroup = groupKey(correct);

  const sameGroup = pool.filter((item) => item[idKey] !== correctId && groupKey(item) === correctGroup);
  const others = pool.filter((item) => item[idKey] !== correctId && groupKey(item) !== correctGroup);

  const chosen = shuffle(sameGroup).slice(0, count);
  if (chosen.length < count) {
    chosen.push(...shuffle(others).slice(0, count - chosen.length));
  }
  return chosen;
}
