// Calcula o recorte percentual de um símbolo em cima da imagem inteira da carta.
// `crop` vem do symbols.json: { card, x, y, w, h } em porcentagem (0-100).
export function getCropStyle(crop) {
  if (!crop) return null;

  const { x, y, w, h } = crop;

  const containerStyle = {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    aspectRatio: `${w} / ${h}`,
  };

  const imgStyle = {
    position: 'absolute',
    width: `${(100 / w) * 100}%`,
    height: `${(100 / h) * 100}%`,
    left: `${-(x / w) * 100}%`,
    top: `${-(y / h) * 100}%`,
    maxWidth: 'none',
  };

  return { containerStyle, imgStyle };
}
