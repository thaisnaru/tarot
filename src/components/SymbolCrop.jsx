import { useMemo } from 'react';
import { getCardImageSrc, handleCardImgError } from '../assets.js';
import { getCropStyle } from '../utils/cropStyle.js';
import { cardsById } from '../engine/deck.js';

// Mostra só o recorte de um símbolo sobre a carta onde ele aparece.
// Se o símbolo não tiver `crop` definido, cai para a carta inteira (CardImage).
export default function SymbolCrop({ symbol, className = '' }) {
  const card = symbol?.crop ? cardsById[symbol.crop.card] : null;
  const style = useMemo(() => getCropStyle(symbol?.crop), [symbol]);

  if (!card || !style) {
    const fallbackCard = symbol?.appears_in?.length ? cardsById[symbol.appears_in[0]] : null;
    return (
      <img
        src={getCardImageSrc(fallbackCard)}
        onError={handleCardImgError}
        alt={symbol?.name ?? 'Símbolo'}
        className={`aspect-[1/1.75] w-full rounded-xl object-cover bg-surface ${className}`}
      />
    );
  }

  return (
    <div style={style.containerStyle} className={`rounded-xl bg-surface ${className}`}>
      <img
        src={getCardImageSrc(card)}
        onError={handleCardImgError}
        alt={symbol?.name ?? 'Símbolo'}
        style={style.imgStyle}
      />
    </div>
  );
}
