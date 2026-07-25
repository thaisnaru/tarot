// Fonte única de dados carregados: importa todos os JSON e monta lookup
// maps. Módulo estático — sem estado, sem rede, tudo resolvido em build time.
import cardsData from '../data/cards.json';
import symbolsData from '../data/symbols.json';
import colorsData from '../data/colors.json';
import suitsData from '../data/suits.json';
import numbersData from '../data/numbers.json';
import mundosData from '../data/mundos.json';

export const cards = cardsData;
export const symbols = symbolsData;
export const colors = colorsData;
export const suits = suitsData;
export const numbers = numbersData;
export const mundos = mundosData;

function byId(list) {
  return Object.fromEntries(list.map((item) => [item.id, item]));
}

export const cardsById = byId(cards);
export const symbolsById = byId(symbols);
export const colorsById = byId(colors);
export const suitsById = byId(suits);
export const numbersById = byId(numbers);
export const mundosById = byId(mundos);

function byNameLower(list) {
  return Object.fromEntries(list.map((item) => [item.name.toLowerCase(), item]));
}

const symbolsByNameLower = byNameLower(symbols);
const colorsByNameLower = byNameLower(colors);

// cards.json guarda `symbols`/`dominant_colors` como texto livre (vindo do
// documento de origem), nem sempre igual ao `name` normalizado em
// symbols.json/colors.json (ex: nomes deduplicados). Faz o melhor esforço
// de casar por nome exato (case-insensitive); se não achar, quem chamou
// deve degradar graciosamente pro texto puro.
export function findSymbolByName(name) {
  return symbolsByNameLower[name?.toLowerCase()] ?? null;
}

export function findColorByName(name) {
  return colorsByNameLower[name?.toLowerCase()] ?? null;
}

export function getMajors() {
  return cards.filter((c) => c.arcana === 'maior');
}

export function getMinorsBySuit(suit) {
  return cards.filter((c) => c.suit === suit);
}

export function resolveCards(ids = []) {
  return ids.map((id) => cardsById[id]).filter(Boolean);
}

// Símbolos/cores relevantes a um conjunto de cartas (usado pelo motor de
// questões pra restringir o "assunto" da pergunta ao escopo da lição).
export function symbolsForPool(pool) {
  const poolIds = new Set(pool.map((c) => c.id));
  return symbols.filter((s) => s.appears_in.some((id) => poolIds.has(id)));
}

export function colorsForPool(pool) {
  const poolIds = new Set(pool.map((c) => c.id));
  return colors.filter((c) => c.appears_in.some((id) => poolIds.has(id)));
}

// Cores reais (colors.json) presentes numa carta específica — cruza o texto
// livre de `card.dominant_colors` com os nomes catalogados, sem duplicar.
export function colorsOfCard(card) {
  const seen = new Set();
  const result = [];
  for (const name of card.dominant_colors ?? []) {
    const color = findColorByName(name);
    if (color && !seen.has(color.id)) {
      seen.add(color.id);
      result.push(color);
    }
  }
  return result;
}
