import { ChevronLeft, Check } from 'lucide-react';
import { useNavigation } from '../navigation.jsx';
import { cardsById, suitsById, findSymbolByName, findColorByName } from '../engine/deck.js';
import { getMastery, getItemAverage, getSkillsForCard, isDominado, SKILL_LABELS } from '../engine/mastery.js';
import CardImage from '../components/CardImage.jsx';
import AccordionRow from '../components/AccordionRow.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

export default function CardDetailScreen({ cardId }) {
  const { goBack } = useNavigation();
  const card = cardsById[cardId];

  if (!card) {
    return (
      <div className="min-h-screen bg-bg text-text-primary flex flex-col items-center justify-center gap-4">
        <p className="text-text-muted">Carta não encontrada.</p>
        <button type="button" onClick={goBack} className="text-primary min-h-[44px]">
          Voltar
        </button>
      </div>
    );
  }

  const suit = card.suit ? suitsById[card.suit] : null;
  const skills = getSkillsForCard(card);
  const overall = getItemAverage(card.id, skills) ?? 0;
  const dominado = isDominado(overall);

  return (
    <div className="min-h-screen bg-bg text-text-primary pb-12">
      <header className="sticky top-0 bg-bg/95 backdrop-blur px-4 pt-4 pb-2 flex items-center gap-2 z-10">
        <button type="button" onClick={goBack} className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold">{card.name}</h1>
      </header>

      <div className="px-4">
        <div className="w-40 mx-auto my-4">
          <CardImage card={card} />
        </div>

        <p className="text-center text-xs text-text-muted mb-4">
          {card.arcana === 'maior' ? 'Arcano Maior' : `Arcano Menor · ${suit?.name ?? card.suit}`}
          {card.numerology != null && ` · ${card.numerology}`}
        </p>

        {card.keywords?.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-center mb-5">
            {card.keywords.map((kw) => (
              <span key={kw} className="text-xs bg-surface rounded-full px-3 py-1 text-text-secondary">
                {kw}
              </span>
            ))}
          </div>
        )}

        <section className="mb-4">
          <h2 className="text-sm font-semibold text-text-secondary mb-1">Normal</h2>
          <p className="text-sm text-text-primary/90 leading-relaxed whitespace-pre-line">
            {card.meaning_upright_full ?? card.meaning_upright}
          </p>
        </section>

        <section className="mb-4">
          <h2 className="text-sm font-semibold text-text-secondary mb-1">Invertida</h2>
          <p className="text-sm text-text-primary/90">{card.meaning_reversed}</p>
        </section>

        <section className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-3 py-1 ${
                dominado ? 'bg-success/15 text-success' : 'bg-surface text-text-muted'
              }`}
            >
              {dominado && <Check size={12} />}
              {dominado ? 'Dominado' : 'Em progresso'}
            </span>
            <span className="text-xs text-text-muted">{overall}% de domínio</span>
          </div>
          <ProgressBar value={overall} max={100} />

          <h2 className="text-sm font-semibold text-text-secondary mt-4 mb-2">Domínio por habilidade</h2>
          <div className="flex flex-col gap-2">
            {skills.map((skill) => {
              const score = getMastery(card.id, skill);
              return (
                <div key={skill}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-secondary">{SKILL_LABELS[skill] ?? skill}</span>
                    <span className="text-xs text-text-muted">{score}%</span>
                  </div>
                  <ProgressBar value={score} max={100} />
                </div>
              );
            })}
          </div>
        </section>

        {card.symbols?.length > 0 && (
          <section className="mb-4">
            <h2 className="text-sm font-semibold text-text-secondary mb-2">Símbolos</h2>
            <div className="flex flex-col gap-2">
              {card.symbols.map((name) => {
                const symbol = findSymbolByName(name);
                return (
                  <AccordionRow
                    key={name}
                    header={
                      <>
                        <span className="text-lg" aria-hidden>
                          {symbol?.emoji ?? '✦'}
                        </span>
                        <span className="text-sm text-text-primary">{symbol?.name ?? name}</span>
                      </>
                    }
                  >
                    {symbol?.meaning ?? 'Significado ainda não catalogado para este símbolo.'}
                  </AccordionRow>
                );
              })}
            </div>
          </section>
        )}

        {card.dominant_colors?.length > 0 && (
          <section className="mb-4">
            <h2 className="text-sm font-semibold text-text-secondary mb-2">Cores</h2>
            <div className="flex flex-col gap-2">
              {card.dominant_colors.map((name) => {
                const color = findColorByName(name);
                return (
                  <AccordionRow
                    key={name}
                    header={
                      <>
                        <span
                          className="w-4 h-4 rounded-full border border-white/10 shrink-0"
                          style={{ backgroundColor: color?.hex ?? 'transparent' }}
                        />
                        <span className="text-sm text-text-primary">{name}</span>
                      </>
                    }
                  >
                    {color?.meaning ?? 'Significado ainda não catalogado para esta cor.'}
                  </AccordionRow>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
