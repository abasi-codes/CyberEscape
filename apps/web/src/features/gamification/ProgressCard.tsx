import { Progress } from '@/components/ui/Progress';
import { Flame, Star, Trophy } from 'lucide-react';
import { xpForNextLevel, formatPoints } from '@/lib/utils';

interface Props {
  totalXP: number;
  currentLevel: number;
  totalPoints: number;
  currentStreak: number;
}

export default function ProgressCard({ totalXP, currentLevel, totalPoints, currentStreak }: Props) {
  const { current, needed } = xpForNextLevel(totalXP);

  return (
    <div className="rounded-xl border border-cyber-border bg-cyber-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-cyber-accent" />
          <span className="font-bold">Level {currentLevel}</span>
        </div>
        <span className="text-sm text-cyber-muted">{current}/{needed} XP</span>
      </div>
      <Progress value={current} max={needed} />
      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-1"><Star className="h-4 w-4 text-cyber-primary" /> {formatPoints(totalPoints)} pts</div>
        <div className="flex items-center gap-1"><Flame className="h-4 w-4 text-cyber-warning" /> {currentStreak}d streak</div>
      </div>
    </div>
  );
}
