import { useRef } from 'react';

// Toque longo (~600ms) — usado no cabeçalho do Perfil pra abrir a
// verificação oculta de assets.
export function useLongPress(onLongPress, delay = 600) {
  const timerRef = useRef(null);
  const firedRef = useRef(false);

  const start = () => {
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress();
    }, delay);
  };

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
  };
}
