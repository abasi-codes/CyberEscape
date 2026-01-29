import { formatDuration } from '@/lib/utils';
import { Clock, Star, Lightbulb } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import type { UrgencyLevel } from '@/hooks/useUrgency';
import ScoreCounter from '@/components/effects/ScoreCounter';
import StreakIndicator from '@/components/effects/StreakIndicator';

interface Props {
  roomName: string;
  timeRemaining: number;
  score: number;
  hintsUsed: number;
  puzzleIndex: number;
  totalPuzzles: number;
  currentStreak?: number;
  urgencyLevel?: UrgencyLevel;
}

export default function GameHeader({
  roomName,
  timeRemaining,
  score,
  hintsUsed,
  puzzleIndex,
  totalPuzzles,
  currentStreak = 0,
  urgencyLevel = 'normal',
}: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);

  const timerClasses: Record<UrgencyLevel, string> = {
    normal: 'text-cyber-text',
    warning: 'text-cyber-warning',
    urgent: 'text-cyber-warning',
    critical: reducedMotion ? 'text-cyber-danger' : 'text-cyber-danger animate-pulse-urgent',
  };

  const timerIconClasses: Record<UrgencyLevel, string> = {
    normal: 'text-cyber-muted',
    warning: 'text-cyber-warning',
    urgent: 'text-cyber-warning',
    critical: reducedMotion ? 'text-cyber-danger' : 'text-cyber-danger animate-pulse',
  };

  return (
    <div className="flex flex-wrap items-center justify-between rounded-xl border border-cyber-border bg-cyber-card px-6 py-3">
      <div>
        <h2 className="text-lg font-bold text-cyber-text">{roomName}</h2>
        <p className="text-sm text-cyber-muted">Puzzle {puzzleIndex + 1} of {totalPuzzles}</p>
      </div>
      <div className="flex items-center gap-6">
        {/* Timer */}
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${timerIconClasses[urgencyLevel]}`} />
          <span className={`text-lg font-mono font-bold ${timerClasses[urgencyLevel]}`}>
            {formatDuration(timeRemaining)}
          </span>
        </div>

        {/* Score with animation */}
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-cyber-primary" />
          <ScoreCounter value={score} className="font-bold" />
        </div>

        {/* Streak indicator */}
        {currentStreak >= 2 && (
          <StreakIndicator streak={currentStreak} />
        )}

        {/* Hints used */}
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-cyber-warning" />
          <span className="text-sm text-cyber-muted">{hintsUsed} used</span>
        </div>
      </div>
    </div>
  );
}
