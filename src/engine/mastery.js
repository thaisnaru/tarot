import * as storage from '../storage.js';

// Domínio por item+habilidade, 0-100, persistido em localStorage via storage.js.
// Acerto sobe, erro desce — sem trava, sem punição (só reflete o quanto o
// item já foi exercitado com sucesso).

const GAIN_ON_CORRECT = 15;
const LOSS_ON_WRONG = 10;
export const DOMINADO_THRESHOLD = 80;

function key(itemId, skill) {
  return `mastery:${itemId}:${skill}`;
}

export function getMastery(itemId, skill) {
  return storage.get(key(itemId, skill), 0);
}

export function recordAnswer(itemId, skill, correct) {
  const current = getMastery(itemId, skill);
  const next = correct
    ? Math.min(100, current + GAIN_ON_CORRECT)
    : Math.max(0, current - LOSS_ON_WRONG);
  storage.set(key(itemId, skill), next);
  return next;
}

// Média das habilidades aplicáveis a um item (ex: card_x -> ['keywords','simbolos','cores']).
// Retorna null se a lista de skills estiver vazia (item sem nenhuma habilidade rastreável).
export function getItemAverage(itemId, skills) {
  if (!skills || skills.length === 0) return null;
  const total = skills.reduce((sum, skill) => sum + getMastery(itemId, skill), 0);
  return Math.round(total / skills.length);
}

export function isDominado(score) {
  return score != null && score >= DOMINADO_THRESHOLD;
}

// Habilidades rastreáveis por carta dependem só da arcana (maiores têm
// símbolos/cores curados; menores têm naipe/rank pra numerologia).
// Vale pra qualquer mundo que contenha aquela carta — Cortes e o mundo do
// naipe específico usam a mesma regra pra cartas menores.
export function getSkillsForCard(card) {
  return card.arcana === 'maior' ? ['keywords', 'simbolos', 'cores'] : ['keywords', 'numerologia'];
}

export const SKILL_LABELS = {
  keywords: 'Palavras-chave',
  simbolos: 'Símbolos',
  cores: 'Cores',
  numerologia: 'Numerologia',
  simbolo: 'Símbolo',
  cor: 'Cor',
  numero: 'Número',
  naipe: 'Naipe',
};
