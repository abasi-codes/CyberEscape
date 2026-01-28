import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

interface ScoreBreakdown {
  basePoints: number;
  timeBonus: number;
  accuracyPenalty: number;
  hintPenalty: number;
  streakMultiplier: number;
  totalPoints: number;
}

interface Props {
  correct: boolean;
  message: string;
  scoreBreakdown: ScoreBreakdown | null;
}

export default function FeedbackModal({ correct, message, scoreBreakdown }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-xl border border-cyber-border bg-cyber-card p-8 text-center">
        {correct ? (
          <CheckCircle className="mx-auto h-16 w-16 text-cyber-accent" />
        ) : (
          <XCircle className="mx-auto h-16 w-16 text-cyber-danger" />
        )}
        <h3 className={`mt-4 text-2xl font-bold ${correct ? 'text-cyber-accent' : 'text-cyber-danger'}`}>
          {correct ? 'Correct!' : 'Incorrect'}
        </h3>
        <p className="mt-2 text-cyber-muted">{message}</p>

        {correct && scoreBreakdown && (
          <div className="mt-6 space-y-2 text-left text-sm">
            <div className="flex justify-between"><span className="text-cyber-muted">Base Points</span><span>+{scoreBreakdown.basePoints}</span></div>
            {scoreBreakdown.timeBonus > 0 && <div className="flex justify-between"><span className="text-cyber-muted">Time Bonus</span><span className="text-cyber-accent">+{scoreBreakdown.timeBonus}</span></div>}
            {scoreBreakdown.accuracyPenalty > 0 && <div className="flex justify-between"><span className="text-cyber-muted">Accuracy Penalty</span><span className="text-cyber-danger">-{scoreBreakdown.accuracyPenalty}</span></div>}
            {scoreBreakdown.hintPenalty > 0 && <div className="flex justify-between"><span className="text-cyber-muted">Hint Penalty</span><span className="text-cyber-danger">-{scoreBreakdown.hintPenalty}</span></div>}
            {scoreBreakdown.streakMultiplier > 1 && <div className="flex justify-between"><span className="text-cyber-muted">Streak Bonus</span><span className="text-cyber-primary">x{scoreBreakdown.streakMultiplier}</span></div>}
            <div className="flex justify-between border-t border-cyber-border pt-2 text-base font-bold">
              <span>Total</span><span className="text-cyber-primary">+{scoreBreakdown.totalPoints}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
