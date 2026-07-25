import { Check, Sparkles } from 'lucide-react';

export default function LessonNode({ lesson, done, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full min-h-[44px] flex items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
        done ? 'border-success/40 bg-success/5' : 'border-white/10 bg-surface'
      }`}
    >
      <span
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          done ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
        }`}
      >
        {done ? <Check size={18} /> : <Sparkles size={16} />}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-text-primary">{lesson.name}</span>
        <span className="block text-xs text-text-muted">{lesson.size} questões</span>
      </span>
    </button>
  );
}
