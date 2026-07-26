// Rótulos dos grupos usados por mundos com `groupBy` (Simbologia por
// categoria, Cortes por rank) — compartilhado entre JornadaScreen (que
// monta as seções) e LicaoScreen (que precisa do nome do grupo pro
// cabeçalho da sessão/fim de lição).
export const CATEGORY_LABELS = {
  celestial: 'Corpos celestes',
  fauna: 'Fauna',
  flora: 'Flora',
  'figura-humana': 'Figuras humanas',
  objeto: 'Objetos',
  vestimenta: 'Vestimentas',
  arquitetura: 'Arquitetura',
  paisagem: 'Paisagem',
};
export const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

export const RANK_LABELS = { page: 'Pajens', knight: 'Cavaleiros', queen: 'Rainhas', king: 'Reis' };
export const RANK_ORDER = ['page', 'knight', 'queen', 'king'];

export function groupLabelFor(mundo, groupValue) {
  if (!groupValue) return null;
  if (mundo.groupBy === 'category') return CATEGORY_LABELS[groupValue] ?? groupValue;
  if (mundo.groupBy === 'rank') return RANK_LABELS[groupValue] ?? groupValue;
  return groupValue;
}
