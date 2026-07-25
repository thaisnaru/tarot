import { symbolsById, colorsById, resolveCards } from '../engine/deck.js';
import { useNavigation } from '../navigation.jsx';
import CardThumbnail from './CardThumbnail.jsx';
import MascotImage from './MascotImage.jsx';

export default function FeedbackPanel({ question, correct, onNext }) {
  const { navigate } = useNavigation();
  const subject = question.subject;

  let appearsInCards = [];
  let contrastSymbols = [];

  if (subject?.kind === 'symbol') {
    const symbol = symbolsById[subject.id];
    if (symbol) {
      appearsInCards = resolveCards(symbol.appears_in).slice(0, 5);
      contrastSymbols = (symbol.contrast_with ?? []).map((id) => symbolsById[id]).filter(Boolean);
    }
  } else if (subject?.kind === 'color') {
    const color = colorsById[subject.id];
    if (color) appearsInCards = resolveCards(color.appears_in).slice(0, 5);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[430px] bg-surface-overlay border-t border-white/10 rounded-t-3xl px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] max-h-[70vh] overflow-y-auto">
      <div className="flex items-center gap-3 mb-3">
        <MascotImage state={correct ? 'acerto' : 'erro'} className="w-12 h-12 shrink-0" />
        <div>
          <p className={`font-semibold ${correct ? 'text-success' : 'text-danger'}`}>
            {correct ? 'Certo! ✦' : 'Quase lá'}
          </p>
          <p className="text-sm text-text-secondary">{question.explanation}</p>
        </div>
      </div>

      {appearsInCards.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-text-muted mb-2">Onde mais aparece</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {appearsInCards.map((card) => (
              <CardThumbnail key={card.id} card={card} onClick={() => navigate('cardDetail', { cardId: card.id })} />
            ))}
          </div>
        </div>
      )}

      {contrastSymbols.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-text-muted mb-2">Contraste</p>
          <div className="flex gap-2 flex-wrap">
            {contrastSymbols.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs text-text-secondary"
              >
                <span aria-hidden>{s.emoji}</span> {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className="w-full min-h-[44px] mt-2 rounded-2xl bg-primary text-white font-medium"
      >
        Continuar
      </button>
    </div>
  );
}
