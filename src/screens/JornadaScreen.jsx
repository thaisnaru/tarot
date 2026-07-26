import { mundos } from '../engine/deck.js';
import { getMundoItems } from '../engine/sessionBuilder.js';
import { getItemAverage, getSkillsForCard, isDominado } from '../engine/mastery.js';
import { useNavigation } from '../navigation.jsx';
import MundoCard from '../components/MundoCard.jsx';
import MasteryRow from '../components/MasteryRow.jsx';
import CardImage from '../components/CardImage.jsx';

const SUIT_EMOJI = { paus: '🔥', copas: '💧', espadas: '💨', ouros: '🪙' };

const MUNDO_ICON = {
  'arcanos-maiores': '🌟',
  simbologia: '✨',
  cores: '🎨',
  numerologia: '🔢',
  naipes: '🧭',
  copas: '💧',
  ouros: '🪙',
  espadas: '💨',
  paus: '🔥',
  cortes: '👑',
};

const CATEGORY_LABELS = {
  celestial: 'Corpos celestes',
  fauna: 'Fauna',
  flora: 'Flora',
  'figura-humana': 'Figuras humanas',
  objeto: 'Objetos',
  vestimenta: 'Vestimentas',
  arquitetura: 'Arquitetura',
  paisagem: 'Paisagem',
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

const RANK_LABELS = { page: 'Pajens', knight: 'Cavaleiros', queen: 'Rainhas', king: 'Reis' };
const RANK_ORDER = ['page', 'knight', 'queen', 'king'];

// Agrupa os itens de um mundo em Submundos, quando o mundo define
// `groupBy` (categoria de símbolo, ou rank pras Cortes). Sem `groupBy`,
// devolve um grupo único sem rótulo — comportamento igual ao de antes.
function groupItems(mundo, items) {
  if (mundo.groupBy === 'category') {
    const byCat = {};
    items.forEach((item) => {
      const cat = item.category ?? 'outro';
      (byCat[cat] ??= []).push(item);
    });
    return CATEGORY_ORDER.filter((c) => byCat[c]).map((c) => ({ label: CATEGORY_LABELS[c], items: byCat[c] }));
  }
  if (mundo.groupBy === 'rank') {
    const byRank = {};
    items.forEach((item) => {
      const rank = item.rank ?? 'outro';
      (byRank[rank] ??= []).push(item);
    });
    return RANK_ORDER.filter((r) => byRank[r]).map((r) => ({ label: RANK_LABELS[r], items: byRank[r] }));
  }
  return [{ label: null, items }];
}

function skillsFor(mundo, item) {
  if (mundo.itemType === 'card') return getSkillsForCard(item);
  return mundo.skills;
}

function ItemIcon({ mundo, item }) {
  if (mundo.itemType === 'card') {
    return <CardImage card={item} className="w-full h-full object-cover" />;
  }
  if (mundo.itemType === 'symbol') {
    return <span className="text-lg">{item.emoji}</span>;
  }
  if (mundo.itemType === 'color') {
    return <span className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: item.hex }} />;
  }
  if (mundo.itemType === 'suit') {
    return <span className="text-lg">{SUIT_EMOJI[item.id] ?? '✦'}</span>;
  }
  return <span className="text-xs text-text-muted">{item.name}</span>;
}

// Nó da trilha: bolinha de status (dominado/em progresso/novo) ligada por
// uma linha vertical, com o sub-card do item à direita.
function TimelineNode({ score, isLast, children }) {
  const dominado = isDominado(score);
  const started = score > 0;
  const dotClasses = dominado
    ? 'bg-success border-success'
    : started
    ? 'bg-primary border-primary'
    : 'bg-transparent border-text-muted';

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center w-3 shrink-0">
        <span className={`w-3 h-3 rounded-full border-2 ${dotClasses}`} />
        {!isLast && <span className="flex-1 w-px bg-white/10 my-1" />}
      </div>
      <div className="flex-1 pb-3 -mt-0.5">{children}</div>
    </div>
  );
}

function MundoSection({ mundo, index }) {
  const { navigate } = useNavigation();
  const items = getMundoItems(mundo);
  const groups = groupItems(mundo, items);

  const scores = items.map((item) => getItemAverage(item.id, skillsFor(mundo, item)) ?? 0);
  const overall = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <MundoCard
      icon={MUNDO_ICON[mundo.id] ?? '✦'}
      badge={`Mundo ${index + 1}`}
      name={mundo.name}
      overall={overall}
    >
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={() => navigate('licao', { mundoId: mundo.id })}
          className="min-h-[36px] px-4 rounded-full bg-primary text-white text-xs font-medium"
        >
          Praticar
        </button>
      </div>
      {groups.map((group, gi) => (
        <div key={group.label ?? gi} className={gi > 0 ? 'mt-4' : ''}>
          {group.label && (
            <p className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">{group.label}</p>
          )}
          <div className="flex flex-col">
            {group.items.map((item, i) => {
              const score = getItemAverage(item.id, skillsFor(mundo, item)) ?? 0;
              return (
                <TimelineNode key={item.id} score={score} isLast={i === group.items.length - 1}>
                  <MasteryRow
                    icon={<ItemIcon mundo={mundo} item={item} />}
                    name={item.name}
                    score={score}
                    onClick={() => navigate('licao', { mundoId: mundo.id, focusItemId: item.id })}
                  />
                </TimelineNode>
              );
            })}
          </div>
        </div>
      ))}
    </MundoCard>
  );
}

export default function JornadaScreen() {
  return (
    <div className="min-h-screen bg-bg text-text-primary pb-24 px-4 pt-6">
      <h1 className="text-xl font-semibold mb-1">Jornada</h1>
      <p className="text-text-muted text-sm mb-6">Escolha um mundo e comece a estudar</p>

      <div className="flex flex-col gap-3">
        {mundos.map((mundo, index) => (
          <MundoSection key={mundo.id} mundo={mundo} index={index} />
        ))}
      </div>
    </div>
  );
}
