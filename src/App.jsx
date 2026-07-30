import { useLayoutEffect, useRef } from 'react';
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
  const { stack, isRoot, current } = useNavigation();
  const shellRef = useRef(null);

  // Telas ficam todas montadas (navegação em pilha, todas absolutamente
  // posicionadas dentro da shell abaixo) — quem rola de verdade não é a
  // janela, é essa própria div: `overflow-x-hidden` sozinho faz o CSS
  // computar `overflow-y` como `auto` por baixo dos panos (regra da spec:
  // se só um eixo tem overflow não-visible, o outro vira auto), então ela
  // virou o container de scroll real. `window.scrollTo` nunca resolvia
  // nada — o reset precisa mirar essa div (via ref), não a janela.
  useLayoutEffect(() => {
    if (shellRef.current) shellRef.current.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [stack.length, current.screen]);

  return (
    <div ref={shellRef} className="relative min-h-screen max-w-[430px] mx-auto bg-bg overflow-x-hidden overflow-y-auto">
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
