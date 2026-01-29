import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { getRoomNarrative } from '@/lib/roomNarratives';
import { CheckCircle, XCircle, BookOpen, Award } from 'lucide-react';

interface Badge {
  name: string;
  icon?: string;
}

interface Props {
  roomName: string;
  success: boolean;
  score: number;
  badgesEarned?: Badge[];
  onContinue: () => void;
}

export default function RoomDebrief({ roomName, success, score, badgesEarned = [], onContinue }: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);
  const narrative = getRoomNarrative(roomName);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-2xl space-y-6 p-8"
    >
      {/* Status icon */}
      <div className="text-center">
        {success ? (
          <motion.div
            initial={reducedMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <CheckCircle className="mx-auto h-20 w-20 text-cyber-accent" />
          </motion.div>
        ) : (
          <motion.div
            initial={reducedMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <XCircle className="mx-auto h-20 w-20 text-cyber-danger" />
          </motion.div>
        )}
      </div>

      {/* Debrief message */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-cyber-border bg-cyber-card p-6 text-center"
      >
        <h2 className={`text-2xl font-bold mb-4 ${success ? 'text-cyber-accent' : 'text-cyber-danger'}`}>
          {success ? 'Mission Complete' : 'Mission Failed'}
        </h2>
        <p className="text-cyber-text leading-relaxed">
          {success ? narrative.debrief.success : narrative.debrief.failure}
        </p>
        <p className="mt-4 text-3xl font-bold text-cyber-primary">
          {score.toLocaleString()} points
        </p>
      </motion.div>

      {/* Badges earned */}
      {badgesEarned.length > 0 && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-cyber-accent/30 bg-cyber-accent/5 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-cyber-accent" />
            <h3 className="font-semibold text-cyber-accent">Badges Earned</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {badgesEarned.map((badge, index) => (
              <motion.div
                key={badge.name}
                initial={reducedMotion ? false : { scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
                className="flex items-center gap-2 rounded-full border border-cyber-accent/50 bg-cyber-accent/10 px-4 py-2"
              >
                <Award className="h-4 w-4 text-cyber-accent" />
                <span className="text-sm font-medium text-cyber-text">{badge.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Skills learned */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-xl border border-cyber-border bg-cyber-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-cyber-primary" />
          <h3 className="font-semibold text-cyber-text">What You Learned</h3>
        </div>
        <ul className="space-y-2">
          {narrative.debrief.learned.map((item, index) => (
            <motion.li
              key={index}
              initial={reducedMotion ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex items-start gap-2 text-sm text-cyber-muted"
            >
              <span className="text-cyber-primary mt-1">•</span>
              {item}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Continue button */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <button
          onClick={onContinue}
          className="rounded-lg bg-cyber-primary px-8 py-3 font-medium text-cyber-bg hover:bg-cyber-primary/80 transition-colors shadow-[0_0_20px_rgba(0,212,255,0.3)]"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}
