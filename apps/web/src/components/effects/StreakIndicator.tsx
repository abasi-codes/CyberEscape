import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

interface Props {
  streak: number;
  className?: string;
}

export default function StreakIndicator({ streak, className = '' }: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);

  if (streak < 2) return null;

  const isOnFire = streak >= 3;
  const isSuperStreak = streak >= 5;

  return (
    <AnimatePresence>
      <motion.div
        initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`flex items-center gap-1.5 ${className}`}
      >
        <div className={`relative ${isOnFire && !reducedMotion ? 'animate-streak-fire' : ''}`}>
          {isOnFire ? (
            <Flame
              className={`h-5 w-5 ${
                isSuperStreak ? 'text-cyber-danger' : 'text-cyber-warning'
              }`}
            />
          ) : (
            <Zap className="h-5 w-5 text-cyber-primary" />
          )}
        </div>
        <span
          className={`font-bold ${
            isSuperStreak
              ? 'text-cyber-danger'
              : isOnFire
              ? 'text-cyber-warning'
              : 'text-cyber-primary'
          }`}
        >
          {streak}x
        </span>
        {isSuperStreak && !reducedMotion && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs font-bold uppercase text-cyber-danger"
          >
            FIRE!
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
