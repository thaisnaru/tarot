// Único lugar do app que monta caminhos de imagem. Nenhum componente deve
// concatenar string de path por conta própria — sempre passar por aqui.

const CARD_BASE = '/cards/';
const MASCOT_BASE = '/mascot/';

export const MASCOT_STATES = ['idle', 'acerto', 'erro', 'pensando', 'comemorando'];

// SVGs inline (data URI) como fallback — não dependem de nenhum arquivo em disco,
// então funcionam mesmo se o public/ inteiro estiver vazio.
const PLACEHOLDER_CARD_SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 175">
      <rect x="2" y="2" width="96" height="171" rx="10" fill="#251B4E" stroke="#EF4444" stroke-width="3"/>
      <text x="50" y="95" font-family="sans-serif" font-size="40" fill="#EF4444" text-anchor="middle">?</text>
    </svg>`
  );

const PLACEHOLDER_MASCOT_SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill="#251B4E" stroke="#8B80B0" stroke-width="3"/>
      <text x="50" y="64" font-family="sans-serif" font-size="42" fill="#8B80B0" text-anchor="middle">✨</text>
    </svg>`
  );

export function getCardImageSrc(card) {
  if (!card?.image) return PLACEHOLDER_CARD_SRC;
  return CARD_BASE + card.image;
}

export function getMascotImageSrc(state) {
  const safeState = MASCOT_STATES.includes(state) ? state : 'idle';
  return `${MASCOT_BASE}mascot_${safeState}.png`;
}

export function handleCardImgError(event) {
  if (event.target.src === PLACEHOLDER_CARD_SRC) return;
  event.target.src = PLACEHOLDER_CARD_SRC;
}

export function handleMascotImgError(event) {
  if (event.target.src === PLACEHOLDER_MASCOT_SRC) return;
  event.target.src = PLACEHOLDER_MASCOT_SRC;
}

export { PLACEHOLDER_CARD_SRC, PLACEHOLDER_MASCOT_SRC };
