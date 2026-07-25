import { User } from 'lucide-react';
import { useNavigation } from '../navigation.jsx';
import { useLongPress } from '../hooks/useLongPress.js';

export default function PerfilScreen() {
  const { navigate } = useNavigation();
  const longPress = useLongPress(() => navigate('assetCheck'));

  return (
    <div className="min-h-screen bg-bg text-text-primary pb-24">
      <header
        {...longPress}
        className="px-4 pt-6 pb-4 select-none"
        title="Toque e segure para verificação de assets"
      >
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <User size={20} className="text-primary" /> Perfil
        </h1>
      </header>

      <div className="px-4">
        <div className="bg-surface rounded-2xl p-6 text-center text-text-muted">
          Estatísticas, conquistas e configurações chegam numa fase futura.
        </div>
      </div>
    </div>
  );
}
