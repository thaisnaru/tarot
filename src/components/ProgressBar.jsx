export default function ProgressBar({ value, max, className = '' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`h-2 w-full rounded-full bg-surface overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-accent-warm transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
