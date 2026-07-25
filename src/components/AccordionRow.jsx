import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Linha expansível genérica: fechada mostra só o header, toque expande o
// conteúdo. Usada nas listas de Símbolos e Cores (CardDetailScreen e
// EnciclopediaScreen) pra não mostrar tudo aberto de uma vez.
export default function AccordionRow({ header, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-surface rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-[44px] flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex-1 flex items-center gap-3">{header}</div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-4 pb-3 text-sm text-text-muted">{children}</div>}
    </div>
  );
}
