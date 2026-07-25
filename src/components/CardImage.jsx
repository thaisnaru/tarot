import { getCardImageSrc, handleCardImgError } from '../assets.js';

export default function CardImage({ card, className = '', alt }) {
  return (
    <img
      src={getCardImageSrc(card)}
      onError={handleCardImgError}
      alt={alt ?? card?.name ?? 'Carta de tarot'}
      className={`aspect-[1/1.75] w-full rounded-2xl object-cover bg-surface ${className}`}
      draggable={false}
    />
  );
}
