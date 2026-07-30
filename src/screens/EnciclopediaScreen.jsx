import { useMemo, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigation } from '../navigation.jsx';
import { cards, symbols, colors, suitsById } from '../engine/deck.js';
import { getItemAverage, getSkillsForCard, isDominado } from '../engine/mastery.js';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../engine/groupLabels.js';
import CardImage from '../components/CardImage.jsx';
import AccordionRow from '../components/AccordionRow.jsx';

const CARD_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'maior', label: 'Maiores' },
  { id: 'paus', label: 'Paus' },
  { id: 'copas', label: 'Copas' },
  { id: 'espadas', label: 'Espadas' },
  { id: 'ouros', label: 'Ouros' },
];

const TABS = [
  { id: 'cartas', label: 'Cartas' },
  { id: 'simbolos', label: 'Símbolos' },
  { id: 'cores', label: 'Cores' },
];

// Só os Arcanos Maiores não têm um "naipe" de onde puxar o texto geral —
// suits.json já cobre Paus/Copas/Espadas/Ouros com o campo `meaning`.
const MAIORES_MEANING =
  'Os 22 Arcanos Maiores contam a jornada do Louco (0) ao Mundo (21) — os grandes arquétipos e temas de vida: amor, poder, perda, transformação, fé.\n' +
  'Diferente dos Arcanos Menores, que descrevem situações e emoções do dia a dia dentro de um naipe, cada Maior marca uma força ou fase maior que atua além do controle cotidiano — por isso costumam pesar mais numa leitura.';

function GeneralMeaningBox({ filter }) {
  if (filter === 'todos') return null;
  const label = CARD_FILTERS.find((f) => f.id === filter)?.label;
  const text = filter === 'maior' ? MAIORES_MEANING : suitsById[filter]?.meaning;
  if (!text) return null;

  return (
    <div className="mb-4 p-4 rounded-2xl bg-surface border border-white/10">
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Sobre {label}</h2>
      <p className="text-sm text-text-primary/90 leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  );
}

function CartasTab() {
  const [filter, setFilter] = useState('todos');

  const filtered = useMemo(() => {
    if (filter === 'todos') return cards;
    if (filter === 'maior') return cards.filter((c) => c.arcana === 'maior');
    return cards.filter((c) => c.suit === filter);
  }, [filter]);

  const { navigate } = useNavigation();

  const dominadas = useMemo(
    () => cards.filter((c) => isDominado(getItemAverage(c.id, getSkillsForCard(c)))).length,
    []
  );

  return (
    <>
      <p className="text-xs text-text-muted mb-3">
        {cards.length} cartas · {dominadas} dominadas
      </p>
      <div className="flex gap-2 overflow-x-auto pb-3 px-4 -mx-4">
        {CARD_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`shrink-0 min-h-[36px] px-4 rounded-full text-xs font-medium ${
              filter === f.id ? 'bg-primary text-white' : 'bg-surface text-text-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <GeneralMeaningBox filter={filter} />
      <div className="grid grid-cols-3 gap-3">
        {filtered.map((card) => {
          const score = getItemAverage(card.id, getSkillsForCard(card)) ?? 0;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => navigate('cardDetail', { cardId: card.id })}
              className="flex flex-col gap-1 text-left"
            >
              <CardImage card={card} />
              <span className="text-[11px] text-text-secondary leading-tight">{card.name}</span>
              <span className="text-[10px] text-text-muted">{score}%</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function SimbolosTab() {
  const grouped = useMemo(() => {
    const byCategory = {};
    symbols.forEach((s) => {
      const cat = s.category ?? 'outro';
      (byCategory[cat] ??= []).push(s);
    });
    return CATEGORY_ORDER.filter((c) => byCategory[c]).map((c) => ({
      label: CATEGORY_LABELS[c],
      items: byCategory[c],
    }));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {grouped.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">{group.label}</p>
          <div className="flex flex-col gap-2">
            {group.items.map((s) => (
              <AccordionRow
                key={s.id}
                header={
                  <>
                    <span className="text-2xl shrink-0" aria-hidden>
                      {s.emoji}
                    </span>
                    <span className="text-sm font-medium text-text-primary">{s.name}</span>
                  </>
                }
              >
                {s.meaning}
              </AccordionRow>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CoresTab() {
  return (
    <div className="flex flex-col gap-2">
      {colors.map((c) => (
        <AccordionRow
          key={c.id}
          header={
            <>
              <span
                className="w-6 h-6 rounded-full border border-white/10 shrink-0"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-sm font-medium text-text-primary">{c.name}</span>
            </>
          }
        >
          {c.meaning}
        </AccordionRow>
      ))}
    </div>
  );
}

export default function EnciclopediaScreen({ initialTab = 'cartas' }) {
  const { goBack } = useNavigation();
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="min-h-screen bg-bg text-text-primary pb-10">
      <header className="sticky top-0 bg-bg/95 backdrop-blur px-4 pt-4 pb-2 z-10">
        <div className="flex items-center gap-2 mb-3">
          <button type="button" onClick={goBack} className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-lg font-semibold">Enciclopédia</h1>
        </div>
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`min-h-[36px] px-4 rounded-full text-sm font-medium ${
                tab === t.id ? 'bg-primary text-white' : 'bg-surface text-text-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 pt-3">
        {tab === 'cartas' && <CartasTab />}
        {tab === 'simbolos' && <SimbolosTab />}
        {tab === 'cores' && <CoresTab />}
      </div>
    </div>
  );
}
