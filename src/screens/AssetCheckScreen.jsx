import cards from '../data/cards.json';
import CardImage from '../components/CardImage.jsx';
import MascotImage from '../components/MascotImage.jsx';
import { MASCOT_STATES } from '../assets.js';
import { useNavigation } from '../navigation.jsx';
import { ChevronLeft } from 'lucide-react';

// Tela oculta (toque longo no cabeçalho do Perfil): grade com as 78 cartas,
// cada uma mostrando a imagem carregada, o nome esperado do arquivo e o
// nome da carta. Imagem faltando vira placeholder vermelho automaticamente
// via CardImage/assets.js — não precisa checagem extra aqui.
export default function AssetCheckScreen() {
  const { goBack } = useNavigation();

  return (
    <div className="min-h-screen bg-bg text-text-primary pb-10">
      <header className="sticky top-0 bg-bg/95 backdrop-blur px-4 py-4 flex items-center gap-2 border-b border-white/5">
        <button
          type="button"
          onClick={goBack}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
        >
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1 className="text-lg font-semibold">Verificação de assets</h1>
          <p className="text-xs text-text-muted">{cards.length} cartas · 5 estados da mascote</p>
        </div>
      </header>

      <section className="px-4 py-4">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Mascote</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {MASCOT_STATES.map((state) => (
            <div key={state} className="flex flex-col items-center gap-1 shrink-0">
              <MascotImage state={state} className="w-16 h-16 object-contain bg-surface rounded-xl" />
              <span className="text-xs text-text-muted">{state}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-2">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Cartas</h2>
        <div className="grid grid-cols-3 gap-3">
          {cards.map((card) => (
            <div key={card.id} className="flex flex-col gap-1">
              <CardImage card={card} className="rounded-lg" />
              <span className="text-[10px] text-text-muted leading-tight break-all">{card.image}</span>
              <span className="text-[11px] text-text-secondary leading-tight">{card.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
