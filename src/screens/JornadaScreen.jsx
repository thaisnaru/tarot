import { mundos } from '../engine/deck.js';
import { getMundoItems } from '../engine/sessionBuilder.js';
import { getItemAverage, getSkillsForCard, isDominado } from '../engine/mastery.js';
import { CATEGORY_LABELS, CATEGORY_ORDER, RANK_LABELS, RANK_ORDER } from '../engine/groupLabels.js';
import { useNavigation } from '../navigation.jsx';
import MundoCard from '../components/MundoCard.jsx';
import MasteryRow from '../components/MasteryRow.jsx';
import CardImage from '../components/CardImage.jsx';

// Naipe do Tarot → naipe clássico de baralho: Paus/Wands=Paus♣️,
// Copas/Cups=Copas♥️, Espadas/Swords=Espadas♠️, Ouros/Pentacles=Ouros♦️.
const SUIT_EMOJI = { paus: '♣️', copas: '♥️', espadas: '♠️', ouros: '♦️' };

const NUMBER_EMOJI = {
  ace: '1️⃣',
  '2': '2️⃣',
  '3': '3️⃣',
  '4': '4️⃣',
  '5': '5️⃣',
  '6': '6️⃣',
  '7': '7️⃣',
  '8': '8️⃣',
  '9': '9️⃣',
  '10': '🔟',
  page: '🫅🏼',
  knight: '🧔🏽‍♂️',
  queen: '👸🏼',
  king: '🤴🏼',
};

const MUNDO_ICON = {
  'arcanos-maiores': '🌟',
  simbologia: '✨',
  numerologia: '🔢',
  naipes: '🧭',
  copas: SUIT_EMOJI.copas,
  ouros: SUIT_EMOJI.ouros,
  espadas: SUIT_EMOJI.espadas,
  paus: SUIT_EMOJI.paus,
  cortes: '👑',
};

// Agrupa os itens de um mundo em Submundos, quando o mundo define
// `groupBy` (categoria de símbolo, ou rank pras Cortes). Sem `groupBy`,
// devolve um grupo único sem rótulo — comportamento igual ao de antes.
// Cada grupo carrega `value` (o valor cru, ex: "celestial") além do
// `label` — é o que a sessão de prática por grupo usa pra filtrar.
function groupItems(mundo, items) {
  if (mundo.groupBy === 'category') {
    const byCat = {};
    items.forEach((item) => {
      const cat = item.category ?? 'outro';
      (byCat[cat] ??= []).push(item);
    });
    return CATEGORY_ORDER.filter((c) => byCat[c]).map((c) => ({ label: CATEGORY_LABELS[c], value: c, items: byCat[c] }));
  }
  if (mundo.groupBy === 'rank') {
    const byRank = {};
    items.forEach((item) => {
      const rank = item.rank ?? 'outro';
      (byRank[rank] ??= []).push(item);
    });
    return RANK_ORDER.filter((r) => byRank[r]).map((r) => ({ label: RANK_LABELS[r], value: r, items: byRank[r] }));
  }
  return [{ label: null, value: null, items }];
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
  if (mundo.itemType === 'suit') {
    return <span className="text-lg">{SUIT_EMOJI[item.id] ?? '✦'}</span>;
  }
  if (mundo.itemType === 'number') {
    return <span className="text-lg">{NUMBER_EMOJI[item.id] ?? '🔢'}</span>;
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
  // Símbolos são simples demais (1 habilidade só) pra justificar uma
  // sessão focada num item específico — isso é o que virava "submundo de
  // um símbolo só" (ver pedido do usuário). Grupo (categoria) é a unidade
  // de prática certa aqui; item individual só mostra progresso.
  const allowItemFocus = mundo.itemType !== 'symbol';

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
        <div key={group.value ?? gi} className={gi > 0 ? 'mt-4' : ''}>
          {group.label && (
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">{group.label}</p>
              <button
                type="button"
                onClick={() => navigate('licao', { mundoId: mundo.id, groupValue: group.value })}
                className="min-h-[28px] px-3 rounded-full bg-surface text-primary text-[11px] font-medium border border-primary/30"
              >
                Praticar grupo
              </button>
            </div>
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
                    onClick={allowItemFocus ? () => navigate('licao', { mundoId: mundo.id, focusItemId: item.id }) : undefined}
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
