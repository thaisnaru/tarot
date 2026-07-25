import { Check, X } from 'lucide-react';

// Estado de acerto/erro sempre com ícone + cor, nunca só cor.
export default function AnswerOption({ option, selected, revealed, onClick, disabled }) {
  let stateClasses = 'border-white/10 bg-surface text-text-primary';
  let Icon = null;

  if (revealed && option.correct) {
    stateClasses = 'border-success bg-success/10 text-success';
    Icon = Check;
  } else if (revealed && selected && !option.correct) {
    stateClasses = 'border-danger bg-danger/10 text-danger';
    Icon = X;
  } else if (!revealed && selected) {
    stateClasses = 'border-primary bg-primary/10 text-text-primary';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full min-h-[44px] flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${stateClasses}`}
    >
      {option.symbol && (
        <span className="text-2xl leading-none shrink-0" aria-hidden>
          {option.symbol.emoji}
        </span>
      )}
      <span className="flex-1 text-sm">{option.symbol ? option.symbol.name : option.label}</span>
      {Icon && <Icon size={18} className="shrink-0" />}
    </button>
  );
}
