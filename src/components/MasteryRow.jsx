import { Check } from 'lucide-react';
import ProgressBar from './ProgressBar.jsx';
import { isDominado } from '../engine/mastery.js';

// Linha genérica de progresso por item (carta, símbolo, cor, número ou
// naipe) — usada na Jornada. `icon` é qualquer node (CardImage pequena,
// emoji, swatch de cor...), quem monta decide conforme o itemType.
export default function MasteryRow({ icon, name, score, onClick }) {
  const dominado = isDominado(score);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full min-h-[44px] flex items-center gap-3 rounded-2xl border border-white/10 bg-surface px-3 py-2.5 text-left"
    >
      <div className="w-10 h-10 shrink-0 rounded-xl bg-bg/40 flex items-center justify-center overflow-hidden">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm text-text-primary truncate">{name}</span>
          <span className="text-xs text-text-muted shrink-0">{score}%</span>
        </div>
        <ProgressBar value={score} max={100} />
      </div>
      {dominado && (
        <span className="shrink-0 text-success" title="Dominado">
          <Check size={16} />
        </span>
      )}
    </button>
  );
}
