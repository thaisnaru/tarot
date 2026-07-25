import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ProgressBar from './ProgressBar.jsx';

// Card maior colapsável: cabeçalho (ícone + nome + progresso geral) sempre
// visível, conteúdo (sub-cards do mundo) só quando aberto.
export default function MundoCard({ icon, badge, name, overall, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl bg-surface border border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-[44px] flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="w-11 h-11 rounded-xl bg-bg/50 flex items-center justify-center text-xl shrink-0">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          {badge && <p className="text-[11px] text-text-muted">{badge}</p>}
          <p className="text-sm font-semibold text-text-primary truncate">{name}</p>
          <div className="mt-1.5">
            <ProgressBar value={overall} max={100} />
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}
