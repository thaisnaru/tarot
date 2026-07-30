import { useState } from 'react';
import { Check } from 'lucide-react';

// Tap-to-pair: toca um símbolo à esquerda, depois um significado à direita.
// Par certo trava em verde; par errado pisca vermelho e libera os dois de novo.
export default function PareamentoBoard({ question, onComplete, disabled }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matched, setMatched] = useState({}); // leftId -> rightId
  const [wrongFlash, setWrongFlash] = useState(null); // { leftId, rightId }
  const [mistakes, setMistakes] = useState(0);

  const isDone = Object.keys(matched).length === question.leftItems.length;

  function handleLeftClick(leftId) {
    if (disabled || matched[leftId]) return;
    setSelectedLeft(leftId);
  }

  function handleRightClick(rightId) {
    if (disabled || !selectedLeft) return;
    const alreadyMatched = Object.values(matched).includes(rightId);
    if (alreadyMatched) return;

    const isCorrect = question.correctPairs[selectedLeft] === rightId;
    if (isCorrect) {
      const nextMatched = { ...matched, [selectedLeft]: rightId };
      setMatched(nextMatched);
      setSelectedLeft(null);
      if (Object.keys(nextMatched).length === question.leftItems.length) {
        onComplete(mistakes === 0);
      }
    } else {
      setMistakes((m) => m + 1);
      setWrongFlash({ leftId: selectedLeft, rightId });
      setTimeout(() => setWrongFlash(null), 400);
      setSelectedLeft(null);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-2">
        {question.leftItems.map((item) => {
          const isMatched = Boolean(matched[item.id]);
          const isSelected = selectedLeft === item.id;
          const isWrong = wrongFlash?.leftId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={isMatched || disabled}
              onClick={() => handleLeftClick(item.id)}
              className={`min-h-[44px] rounded-2xl border px-3 py-3 flex items-center gap-2 text-left transition-colors ${
                isMatched
                  ? 'border-success bg-success/10 text-success'
                  : isWrong
                  ? 'border-danger bg-danger/10 text-danger'
                  : isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-white/10 bg-surface'
              }`}
            >
              {item.symbol && (
                <span className="text-xl" aria-hidden>
                  {item.symbol.emoji}
                </span>
              )}
              <span className="text-sm flex-1">{item.symbol ? item.symbol.name : item.label}</span>
              {isMatched && <Check size={16} />}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        {question.rightItems.map((item) => {
          const isMatched = Object.values(matched).includes(item.id);
          const isWrong = wrongFlash?.rightId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={isMatched || disabled || !selectedLeft}
              onClick={() => handleRightClick(item.id)}
              className={`min-h-[44px] rounded-2xl border px-3 py-3 text-left text-sm transition-colors ${
                isMatched
                  ? 'border-success bg-success/10 text-success'
                  : isWrong
                  ? 'border-danger bg-danger/10 text-danger'
                  : 'border-white/10 bg-surface text-text-secondary'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {isDone && (
        <p className="col-span-2 text-center text-xs text-text-muted mt-1">
          {mistakes === 0 ? 'Todos os pares certos de primeira! ✨' : `Concluído com ${mistakes} tentativa(s) errada(s).`}
        </p>
      )}
    </div>
  );
}
