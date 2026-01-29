import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { getRoomNarrative } from '@/lib/roomNarratives';
import { useAudio } from '@/hooks/useAudio';
import { Shield, Target, Clock } from 'lucide-react';

interface Props {
  roomName: string;
  timeLimit: number;
  onComplete: () => void;
}

function TypewriterText({ text, delay = 0, speed = 30 }: { text: string; delay?: number; speed?: number }) {
  const [displayText, setDisplayText] = useState('');
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayText(text);
      return;
    }

    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= text.length) {
          setDisplayText(text.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay, speed, reducedMotion]);

  return (
    <span>
      {displayText}
      {!reducedMotion && displayText.length < text.length && (
        <span className="animate-blink-caret border-r-2 border-cyber-primary ml-0.5" />
      )}
    </span>
  );
}

export default function RoomIntro({ roomName, timeLimit, onComplete }: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);
  const { playSFX } = useAudio();
  const [phase, setPhase] = useState<'title' | 'situation' | 'objective' | 'ready'>('title');
  const narrative = getRoomNarrative(roomName);

  useEffect(() => {
    const timings = reducedMotion
      ? { title: 500, situation: 1000, objective: 1500, ready: 2000 }
      : { title: 1500, situation: 4000, objective: 6500, ready: 8500 };

    const timers = [
      setTimeout(() => setPhase('situation'), timings.title),
      setTimeout(() => setPhase('objective'), timings.situation),
      setTimeout(() => setPhase('ready'), timings.objective),
      setTimeout(() => {
        playSFX('click');
        onComplete();
      }, timings.ready),
    ];

    return () => timers.forEach(clearTimeout);
  }, [reducedMotion, onComplete, playSFX]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center"
    >
      {/* Scan line effect */}
      {!reducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-transparent via-cyber-primary to-transparent animate-scan-line" />
        </div>
      )}

      <div className="relative z-10 max-w-2xl space-y-8">
        {/* Title */}
        <motion.div
          initial={reducedMotion ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <Shield className="mx-auto h-16 w-16 text-cyber-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-cyber-primary tracking-wider">
            {narrative.intro.title}
          </h1>
          <p className="mt-2 text-cyber-muted text-lg">{roomName}</p>
        </motion.div>

        {/* Situation */}
        {(phase === 'situation' || phase === 'objective' || phase === 'ready') && (
          <motion.div
            initial={reducedMotion ? false : { y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-xl border border-cyber-border bg-cyber-card/50 p-6 backdrop-blur-sm"
          >
            <p className="text-lg text-cyber-text leading-relaxed">
              <TypewriterText text={narrative.intro.situation} speed={25} />
            </p>
          </motion.div>
        )}

        {/* Objective */}
        {(phase === 'objective' || phase === 'ready') && (
          <motion.div
            initial={reducedMotion ? false : { y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-start gap-4 rounded-xl border border-cyber-accent/30 bg-cyber-accent/5 p-6 text-left"
          >
            <Target className="h-6 w-6 text-cyber-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cyber-accent mb-1">
                Mission Objective
              </p>
              <p className="text-cyber-text">
                <TypewriterText text={narrative.intro.objective} delay={200} speed={20} />
              </p>
            </div>
          </motion.div>
        )}

        {/* Timer info */}
        {phase === 'ready' && (
          <motion.div
            initial={reducedMotion ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-2 text-cyber-warning"
          >
            <Clock className="h-5 w-5" />
            <span className="font-mono font-bold">
              {Math.floor(timeLimit / 60)}:{(timeLimit % 60).toString().padStart(2, '0')}
            </span>
            <span className="text-cyber-muted">remaining</span>
          </motion.div>
        )}

        {/* Loading indicator */}
        {phase !== 'ready' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-cyber-muted"
          >
            <div className="h-2 w-2 rounded-full bg-cyber-primary animate-pulse" />
            <span className="text-sm">Initializing...</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
