import { getMascotImageSrc, handleMascotImgError } from '../assets.js';

export default function MascotImage({ state = 'idle', className = '', alt }) {
  return (
    <img
      src={getMascotImageSrc(state)}
      onError={handleMascotImgError}
      alt={alt ?? `Mística — ${state}`}
      className={className}
      draggable={false}
    />
  );
}
