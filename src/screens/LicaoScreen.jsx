import { useMemo, useReducer } from 'react';
import { X } from 'lucide-react';
import { useNavigation } from '../navigation.jsx';
import { mundosById } from '../engine/deck.js';
import { buildAdaptiveSession, getMundoItems } from '../engine/sessionBuilder.js';
import { sessionReducer, initialSessionState, sessionSummary } from '../engine/sessionReducer.js';
import { recordAnswer } from '../engine/mastery.js';
import ProgressBar from '../components/ProgressBar.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import FeedbackPanel from '../components/FeedbackPanel.jsx';
import FimDeLicaoScreen from './FimDeLicaoScreen.jsx';

const SESSION_SIZE = 10;

export default function LicaoScreen({ mundoId, focusItemId }) {
  const { goBack, goToRoot } = useNavigation();

  const mundo = mundosById[mundoId];
  const focusItem = useMemo(() => {
    if (!mundo || !focusItemId) return null;
    return getMundoItems(mundo).find((i) => i.id === focusItemId) ?? null;
  }, [mundo, focusItemId]);

  const questions = useMemo(() => {
    if (!mundo) return [];
    return buildAdaptiveSession(mundo, { focusItemId }, SESSION_SIZE);
  }, [mundo, focusItemId]);

  const [state, dispatch] = useReducer(sessionReducer, questions, initialSessionState);

  if (!mundo || questions.length === 0) {
    return (
      <div className="min-h-screen bg-bg text-text-primary flex flex-col items-center justify-center px-6 text-center gap-4">
        <p className="text-text-muted">Não foi possível montar essa sessão de prática.</p>
        <button type="button" onClick={goBack} className="text-primary min-h-[44px]">
          Voltar
        </button>
      </div>
    );
  }

  if (state.phase === 'done') {
    const { correct, total } = sessionSummary(state);
    return (
      <FimDeLicaoScreen
        correct={correct}
        total={total}
        lessonName={focusItem ? focusItem.name : mundo.name}
        onFinish={() => goToRoot('jornada')}
      />
    );
  }

  const question = state.questions[state.index];

  function handleAnswer(correct) {
    if (question.masteryTarget) {
      recordAnswer(question.masteryTarget.itemId, question.masteryTarget.skill, correct);
    }
    dispatch({ type: 'CONFIRM', correct });
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary pb-64">
      <header className="sticky top-0 bg-bg/95 backdrop-blur px-4 pt-4 pb-3 flex items-center gap-3 z-10">
        <button type="button" onClick={goBack} className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center">
          <X size={20} />
        </button>
        <ProgressBar value={state.index} max={state.questions.length} />
      </header>

      <main className="px-4">
        <QuestionCard key={question.id} question={question} phase={state.phase} onAnswer={handleAnswer} />
      </main>

      {state.phase === 'feedback' && (
        <FeedbackPanel
          question={question}
          correct={state.answers[state.answers.length - 1]?.correct}
          onNext={() => dispatch({ type: 'NEXT' })}
        />
      )}
    </div>
  );
}
