import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Navegação em pilha (não troca única de tela). Empilhar uma tela nova
// (ex: CardDetail sobre a Lição) não desmonta as telas por baixo — é isso
// que permite abrir a Enciclopédia a partir do feedback de uma lição sem
// perder o estado da sessão em andamento.

const NavigationContext = createContext(null);

const ROOT_SCREENS = ['inicio', 'jornada', 'tiragem', 'perfil'];

export function NavigationProvider({ children }) {
  const [stack, setStack] = useState([{ screen: 'inicio', params: {} }]);

  const navigate = useCallback((screen, params = {}) => {
    setStack((prev) => [...prev, { screen, params }]);
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const goToRoot = useCallback((screen, params = {}) => {
    setStack([{ screen, params }]);
  }, []);

  const value = useMemo(
    () => ({
      stack,
      current: stack[stack.length - 1],
      isRoot: stack.length === 1 && ROOT_SCREENS.includes(stack[0].screen),
      navigate,
      goBack,
      goToRoot,
    }),
    [stack, navigate, goBack, goToRoot]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation precisa estar dentro de NavigationProvider');
  return ctx;
}

export { ROOT_SCREENS };
