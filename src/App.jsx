import { NavigationProvider, useNavigation } from './navigation.jsx';
import BottomNav from './components/BottomNav.jsx';
import InicioScreen from './screens/InicioScreen.jsx';
import JornadaScreen from './screens/JornadaScreen.jsx';
import TiragemScreen from './screens/TiragemScreen.jsx';
import PerfilScreen from './screens/PerfilScreen.jsx';
import AssetCheckScreen from './screens/AssetCheckScreen.jsx';
import LicaoScreen from './screens/LicaoScreen.jsx';
import EnciclopediaScreen from './screens/EnciclopediaScreen.jsx';
import CardDetailScreen from './screens/CardDetailScreen.jsx';

const SCREENS = {
  inicio: InicioScreen,
  jornada: JornadaScreen,
  tiragem: TiragemScreen,
  perfil: PerfilScreen,
  assetCheck: AssetCheckScreen,
  licao: LicaoScreen,
  enciclopedia: EnciclopediaScreen,
  cardDetail: CardDetailScreen,
};

function Shell() {
  const { stack, isRoot } = useNavigation();

  return (
    <div className="relative min-h-screen max-w-[430px] mx-auto bg-bg overflow-x-hidden">
      {stack.map((entry, index) => {
        const Screen = SCREENS[entry.screen];
        if (!Screen) return null;
        const isTop = index === stack.length - 1;
        return (
          <div
            key={`${entry.screen}-${index}`}
            className="absolute inset-0"
            style={{ zIndex: index, visibility: isTop ? 'visible' : 'hidden' }}
          >
            <Screen {...entry.params} />
          </div>
        );
      })}
      {isRoot && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <NavigationProvider>
      <Shell />
    </NavigationProvider>
  );
}
