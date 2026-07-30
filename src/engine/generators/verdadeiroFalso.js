import { pickOne } from '../shuffle.js';

// Não é um gerador independente (não entra em GENERATORS_BY_ID) — é uma
// transformação aplicada por cima de uma pergunta de escolha única já
// pronta, de QUALQUER gerador. É assim que funciona em todos os Mundos e
// Submundos sem precisar reescrever cada um: pega a pergunta original,
// mostra uma resposta candidata (certa ou errada, sorteado) como afirmação,
// e troca as opções por Verdadeiro/Falso lado a lado.
export const VF_PROBABILITY = 0.25;

export function canWrapAsBoolean(question) {
  return question?.mode === 'single' && (question.options?.length ?? 0) > 2;
}

export function wrapAsBoolean(question) {
  const correctOption = question.options.find((o) => o.correct);
  const wrongOptions = question.options.filter((o) => !o.correct);
  if (!correctOption || wrongOptions.length === 0) return question;

  const showCorrect = Math.random() < 0.5;
  const statementOption = showCorrect ? correctOption : pickOne(wrongOptions);
  const statementLabel = statementOption.label ?? statementOption.symbol?.name;
  if (!statementLabel) return question;

  return {
    ...question,
    mode: 'boolean',
    prompt: { ...question.prompt, statement: statementLabel },
    options: [
      { id: 'verdadeiro', label: 'Verdadeiro', correct: showCorrect },
      { id: 'falso', label: 'Falso', correct: !showCorrect },
    ],
  };
}
