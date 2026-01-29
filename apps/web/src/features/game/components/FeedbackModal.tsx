import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Flame } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import ScoreCounter from '@/components/effects/ScoreCounter';

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
  streak?: number;
}

export default function FeedbackModal({ correct, message, scoreBreakdown, streak = 0 }: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={reducedMotion ? false : { scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className={`w-full max-w-md rounded-xl border bg-cyber-card p-8 text-center ${
          correct
            ? 'border-cyber-accent/50 shadow-[0_0_30px_rgba(0,255,136,0.2)]'
            : 'border-cyber-danger/50 shadow-[0_0_30px_rgba(255,51,85,0.2)]'
        }`}
      >
        {/* Icon with animation */}
        <motion.div
          initial={reducedMotion ? false : { scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.1 }}
        >
          {correct ? (
            <CheckCircle className="mx-auto h-16 w-16 text-cyber-accent" />
          ) : (
            <XCircle className="mx-auto h-16 w-16 text-cyber-danger" />
          )}
        </motion.div>

        <h3 className={`mt-4 text-2xl font-bold ${correct ? 'text-cyber-accent' : 'text-cyber-danger'}`}>
          {correct ? 'Correct!' : 'Incorrect'}
        </h3>
        <p className="mt-2 text-cyber-muted">{message}</p>

        {/* Streak indicator for correct answers */}
        {correct && streak >= 2 && (
          <motion.div
            initial={reducedMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="mt-4 flex items-center justify-center gap-2"
          >
            <Flame className={`h-6 w-6 ${streak >= 5 ? 'text-cyber-danger' : 'text-cyber-warning'} ${
              !reducedMotion ? 'animate-streak-fire' : ''
            }`} />
            <span className={`text-lg font-bold ${streak >= 5 ? 'text-cyber-danger' : 'text-cyber-warning'}`}>
              {streak}x Streak!
            </span>
          </motion.div>
        )}

        {correct && scoreBreakdown && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 space-y-2 text-left text-sm"
          >
            <div className="flex justify-between">
              <span className="text-cyber-muted">Base Points</span>
              <span>+{scoreBreakdown.basePoints}</span>
            </div>
            {scoreBreakdown.timeBonus > 0 && (
              <div className="flex justify-between">
                <span className="text-cyber-muted">Time Bonus</span>
                <span className="text-cyber-accent">+{scoreBreakdown.timeBonus}</span>
              </div>
            )}
            {scoreBreakdown.accuracyPenalty > 0 && (
              <div className="flex justify-between">
                <span className="text-cyber-muted">Accuracy Penalty</span>
                <span className="text-cyber-danger">-{scoreBreakdown.accuracyPenalty}</span>
              </div>
            )}
            {scoreBreakdown.hintPenalty > 0 && (
              <div className="flex justify-between">
                <span className="text-cyber-muted">Hint Penalty</span>
                <span className="text-cyber-danger">-{scoreBreakdown.hintPenalty}</span>
              </div>
            )}
            {scoreBreakdown.streakMultiplier > 1 && (
              <div className="flex justify-between">
                <span className="text-cyber-muted">Streak Bonus</span>
                <span className="text-cyber-primary">x{scoreBreakdown.streakMultiplier}</span>
              </div>
            )}
            <motion.div
              initial={reducedMotion ? false : { scale: 1 }}
              animate={reducedMotion ? false : { scale: [1, 1.05, 1] }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="flex justify-between border-t border-cyber-border pt-2 text-base font-bold"
            >
              <span>Total</span>
              <span className="text-cyber-primary">
                +<ScoreCounter value={scoreBreakdown.totalPoints} duration={400} />
              </span>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
