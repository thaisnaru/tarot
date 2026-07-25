import CardImage from './CardImage.jsx';

export default function CardThumbnail({ card, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 shrink-0 w-16 min-h-[44px] ${className}`}
    >
      <CardImage card={card} className="rounded-lg" />
      <span className="text-[10px] text-text-muted leading-tight text-center line-clamp-2">
        {card.name}
      </span>
    </button>
  );
}
