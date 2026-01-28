import { formatDuration, formatPoints } from '@/lib/utils';
import { Clock, Star, Lightbulb } from 'lucide-react';

interface Props {
  roomName: string;
  timeRemaining: number;
  score: number;
  hintsUsed: number;
  puzzleIndex: number;
  totalPuzzles: number;
}

export default function GameHeader({ roomName, timeRemaining, score, hintsUsed, puzzleIndex, totalPuzzles }: Props) {
  const urgent = timeRemaining < 60;
  const warning = timeRemaining < 300;

  return (
    <div className="flex flex-wrap items-center justify-between rounded-xl border border-cyber-border bg-cyber-card px-6 py-3">
      <div>
        <h2 className="text-lg font-bold text-cyber-text">{roomName}</h2>
        <p className="text-sm text-cyber-muted">Puzzle {puzzleIndex + 1} of {totalPuzzles}</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${urgent ? 'text-cyber-danger animate-pulse' : warning ? 'text-cyber-warning' : 'text-cyber-muted'}`} />
          <span className={`text-lg font-mono font-bold ${urgent ? 'text-cyber-danger' : ''}`}>
            {formatDuration(timeRemaining)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-cyber-primary" />
          <span className="font-bold">{formatPoints(score)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-cyber-warning" />
          <span className="text-sm text-cyber-muted">{hintsUsed} used</span>
        </div>
      </div>
    </div>
  );
}
