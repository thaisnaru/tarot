import MascotImage from '../components/MascotImage.jsx';

export default function FimDeLicaoScreen({ correct, total, lessonName, onFinish }) {
  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col items-center justify-center px-6 text-center gap-4">
      <MascotImage state="comemorando" className="w-32 h-32" />
      <h1 className="text-xl font-semibold">Lição concluída!</h1>
      <p className="text-text-muted">{lessonName}</p>
      <p className="text-3xl font-bold text-accent-warm">
        {correct}/{total}
      </p>
      <p className="text-text-secondary text-sm">
        {correct === total ? 'Lição perfeita ✦' : 'O que você errou volta em lições futuras.'}
      </p>
      <button
        type="button"
        onClick={onFinish}
        className="w-full min-h-[44px] mt-4 rounded-2xl bg-primary text-white font-medium max-w-xs"
      >
        Voltar à Jornada
      </button>
    </div>
  );
}
