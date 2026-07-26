import { useState } from 'react';
import CardImage from './CardImage.jsx';
import AnswerOption from './AnswerOption.jsx';
import PareamentoBoard from './PareamentoBoard.jsx';

function QuestionText({ prompt }) {
  if (!prompt.question) return null;
  return (
    <p className="text-center text-base font-medium text-text-primary px-2 pt-4 -mb-2">
      {prompt.question}
    </p>
  );
}

function PromptHeader({ prompt }) {
  if (prompt.kind === 'symbol') {
    return (
      <div className="flex flex-col items-center gap-2 py-6">
        <span className="text-6xl" aria-hidden>
          {prompt.symbol.emoji}
        </span>
        <span className="text-text-secondary text-sm">{prompt.symbol.name}</span>
      </div>
    );
  }
  if (prompt.kind === 'color') {
    return (
      <div className="flex flex-col items-center gap-2 py-6">
        <span
          className="w-16 h-16 rounded-full border border-white/10"
          style={{ backgroundColor: prompt.color.hex }}
        />
        <span className="text-text-secondary text-sm">{prompt.color.name}</span>
      </div>
    );
  }
  if (prompt.kind === 'card') {
    return (
      <div className="w-32 mx-auto py-4">
        <CardImage card={prompt.card} />
      </div>
    );
  }
  if (prompt.kind === 'text') {
    return (
      <div className="py-6 px-2 text-center text-lg text-text-primary leading-snug">{prompt.text}</div>
    );
  }
  if (prompt.kind === 'naipe') {
    return (
      <div className="flex flex-col items-center gap-2 py-8">
        <span className="text-2xl font-semibold text-text-primary">{prompt.suit.name}</span>
      </div>
    );
  }
  if (prompt.kind === 'naipe-pair') {
    return (
      <div className="flex items-center justify-center gap-4 py-8">
        <span className="text-xl font-semibold text-text-primary">{prompt.suitA.name}</span>
        <span className="text-text-muted text-sm">vs</span>
        <span className="text-xl font-semibold text-text-primary">{prompt.suitB.name}</span>
      </div>
    );
  }
  if (prompt.kind === 'numero') {
    return (
      <div className="flex flex-col items-center gap-2 py-8">
        <span className="text-6xl font-bold text-primary">{prompt.numero}</span>
      </div>
    );
  }
  if (prompt.kind === 'card-text') {
    return (
      <div>
        <div className="w-28 mx-auto py-3">
          <CardImage card={prompt.card} />
        </div>
        <div className="mt-2 px-3 py-4 bg-surface rounded-2xl text-center text-text-primary text-base leading-snug">
          {prompt.text}
        </div>
      </div>
    );
  }
  if (prompt.kind === 'emoji-combo') {
    return (
      <div className="flex items-center justify-center gap-4 py-8 flex-wrap">
        {prompt.emojis.map((emoji, i) => (
          <span key={i} className="text-5xl" aria-hidden>
            {emoji}
          </span>
        ))}
      </div>
    );
  }
  return null;
}

export default function QuestionCard({ question, phase, onAnswer }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const revealed = phase === 'feedback';
  const disabled = revealed;

  function handleSingleClick(option) {
    if (disabled || selectedIds.length > 0) return;
    setSelectedIds([option.id]);
    onAnswer(option.correct);
  }

  function handleMultiToggle(option) {
    if (disabled) return;
    setSelectedIds((prev) => {
      if (prev.includes(option.id)) return prev.filter((id) => id !== option.id);
      if (prev.length >= question.expectedCorrectCount) return prev;
      return [...prev, option.id];
    });
  }

  function handleMultiConfirm() {
    if (disabled) return;
    const allCorrect = selectedIds.every((id) => question.options.find((o) => o.id === id)?.correct);
    onAnswer(allCorrect && selectedIds.length === question.expectedCorrectCount);
  }

  if (question.mode === 'pairs') {
    return (
      <div>
        <p className="text-center text-text-secondary text-sm mb-4 px-2">
          Toque num símbolo e depois no significado correspondente
        </p>
        <PareamentoBoard question={question} onComplete={onAnswer} disabled={disabled} />
      </div>
    );
  }

  return (
    <div>
      <QuestionText prompt={question.prompt} />
      <PromptHeader prompt={question.prompt} />
      <div className="flex flex-col gap-2">
        {question.options.map((option) => (
          <AnswerOption
            key={option.id}
            option={option}
            selected={selectedIds.includes(option.id)}
            revealed={revealed}
            disabled={disabled}
            onClick={() =>
              question.mode === 'multi' ? handleMultiToggle(option) : handleSingleClick(option)
            }
          />
        ))}
      </div>
      {question.mode === 'multi' && !revealed && (
        <button
          type="button"
          onClick={handleMultiConfirm}
          disabled={selectedIds.length !== question.expectedCorrectCount}
          className="w-full min-h-[44px] mt-4 rounded-2xl bg-primary text-white font-medium disabled:opacity-30"
        >
          Confirmar
        </button>
      )}
    </div>
  );
}
