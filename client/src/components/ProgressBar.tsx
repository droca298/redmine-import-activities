interface ProgressBarProps {
  processed: number;
  total: number;
}

export function ProgressBar({ processed, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  return (
    <div className="progress-bar">
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-bar__label">
        {processed} / {total} ({pct}%)
      </span>
    </div>
  );
}
