export const initialSessionState = (questions) => ({
  questions,
  index: 0,
  answers: [], // { questionId, correct }
  phase: 'question', // 'question' | 'feedback'
  selection: null, // seleção atual antes de confirmar (single/multi/pairs)
});

export function sessionReducer(state, action) {
  switch (action.type) {
    case 'SELECT': {
      if (state.phase !== 'question') return state;
      return { ...state, selection: action.selection };
    }
    case 'CONFIRM': {
      if (state.phase !== 'question') return state;
      const question = state.questions[state.index];
      const correct = action.correct ?? false;
      return {
        ...state,
        phase: 'feedback',
        answers: [...state.answers, { questionId: question.id, correct }],
      };
    }
    case 'NEXT': {
      if (state.phase !== 'feedback') return state;
      const nextIndex = state.index + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, phase: 'done' };
      }
      return { ...state, index: nextIndex, phase: 'question', selection: null };
    }
    // Reinjeta uma pergunta de reforço mais adiante na fila da sessão atual
    // (item que o jogador acabou de errar) — nunca antes do índice atual,
    // pra não sobrepor a pergunta em andamento.
    case 'INSERT_FOLLOWUP': {
      const insertAt = Math.max(state.index + 1, Math.min(action.atIndex, state.questions.length));
      const questions = [...state.questions];
      questions.splice(insertAt, 0, action.question);
      return { ...state, questions };
    }
    default:
      return state;
  }
}

export function sessionSummary(state) {
  const total = state.answers.length;
  const correct = state.answers.filter((a) => a.correct).length;
  return { total, correct };
}
