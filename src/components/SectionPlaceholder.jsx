import { Lock } from 'lucide-react';

export default function SectionPlaceholder({ title, subtitle, locked = false, className = '' }) {
  return (
    <div
      className={`rounded-2xl bg-surface px-4 py-4 flex items-center gap-3 opacity-70 ${className}`}
    >
      {locked && <Lock size={16} className="text-text-muted shrink-0" />}
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
