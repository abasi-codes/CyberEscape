import { formatDuration } from '@/lib/utils';

interface Props {
  seconds: number;
}

export default function Timer({ seconds }: Props) {
  const urgent = seconds < 60;
  const pct = Math.max(0, Math.min(100, (seconds / 1800) * 100));

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-2 w-32 overflow-hidden rounded-full bg-cyber-surface">
        <div
          className={`h-full rounded-full transition-all ${urgent ? 'bg-cyber-danger' : 'bg-cyber-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`font-mono text-lg font-bold ${urgent ? 'text-cyber-danger animate-pulse' : 'text-cyber-text'}`}>
        {formatDuration(seconds)}
      </span>
    </div>
  );
}
