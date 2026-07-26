import { BookOpen, Sparkles as SparklesIcon } from 'lucide-react';
import { useNavigation } from '../navigation.jsx';
import SectionPlaceholder from '../components/SectionPlaceholder.jsx';

const EXPLORE_ITEMS = [
  { id: 'cartas', label: 'Cartas', subtitle: '78 cartas', screen: 'enciclopedia', Icon: BookOpen },
  {
    id: 'simbologias',
    label: 'Simbologias',
    subtitle: '78 símbolos',
    screen: 'enciclopedia',
    params: { initialTab: 'simbolos' },
    Icon: SparklesIcon,
  },
  // Tiragem é só placeholder por enquanto (Fase 5 ainda não implementada) —
  // ver CONTEXT.md/SPEC.md. Continua acessível pela aba do rodapé, só não
  // deve parecer pronta aqui no Início.
  { id: 'tiragens', label: 'Tiragens', subtitle: 'Em breve', screen: null, Icon: SparklesIcon },
  { id: 'combinacoes', label: 'Combinações', subtitle: 'Em breve', screen: null, Icon: SparklesIcon },
];

export default function InicioScreen() {
  const { navigate } = useNavigation();

  return (
    <div className="min-h-screen bg-bg text-text-primary pb-24 px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Mística ✦</h1>
        <div className="flex gap-2 text-xs">
          <span className="bg-surface rounded-full px-3 py-1 text-accent-warm">🔥 0</span>
          <span className="bg-surface rounded-full px-3 py-1 text-text-secondary">✦ Nv.1</span>
        </div>
      </div>

      <SectionPlaceholder title="Bem-vinda de volta" subtitle="Continue de onde parou na Jornada" className="mb-6" />

      <h2 className="text-sm font-semibold text-text-secondary mb-3">Explore</h2>
      <div className="grid grid-cols-2 gap-3">
        {EXPLORE_ITEMS.map(({ id, label, subtitle, screen, params, Icon }) => (
          <button
            key={id}
            type="button"
            disabled={!screen}
            onClick={() => {
              if (!screen) return;
              navigate(screen, params);
            }}
            className="rounded-2xl bg-surface p-4 text-left min-h-[44px] disabled:opacity-50"
          >
            <Icon size={20} className="text-primary mb-2" />
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-text-muted">{subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
