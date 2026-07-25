import { Home, Route, Sparkles, User } from 'lucide-react';
import { useNavigation } from '../navigation.jsx';

const TABS = [
  { screen: 'inicio', label: 'Início', Icon: Home },
  { screen: 'jornada', label: 'Jornada', Icon: Route },
  { screen: 'tiragem', label: 'Tiragem', Icon: Sparkles },
  { screen: 'perfil', label: 'Perfil', Icon: User },
];

export default function BottomNav() {
  const { current, goToRoot } = useNavigation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-[430px] bg-surface-overlay border-t border-white/5 flex justify-around py-2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {TABS.map(({ screen, label, Icon }) => {
        const active = current.screen === screen;
        return (
          <button
            key={screen}
            type="button"
            onClick={() => goToRoot(screen)}
            className="flex flex-col items-center gap-1 py-1 px-3 min-w-[44px] min-h-[44px] justify-center"
          >
            <Icon size={22} className={active ? 'text-primary' : 'text-text-muted'} />
            <span className={`text-xs ${active ? 'text-primary font-medium' : 'text-text-muted'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
