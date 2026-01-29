import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  active?: boolean;
  duration?: number;
}

export default function GlitchTransition({ children, active = false, duration = 0.3 }: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      {active ? (
        <motion.div
          key="glitch"
          initial={{ opacity: 1 }}
          animate={{
            opacity: [1, 0.8, 1, 0.9, 1],
            x: [0, -2, 2, -1, 0],
            filter: [
              'hue-rotate(0deg)',
              'hue-rotate(90deg)',
              'hue-rotate(-90deg)',
              'hue-rotate(45deg)',
              'hue-rotate(0deg)',
            ],
          }}
          transition={{ duration, ease: 'easeInOut' }}
          className="relative"
        >
          {children}
          {/* RGB split effect layers */}
          <div
            className="absolute inset-0 opacity-0 animate-glitch-r mix-blend-screen"
            style={{ color: 'red' }}
          />
          <div
            className="absolute inset-0 opacity-0 animate-glitch-b mix-blend-screen"
            style={{ color: 'blue' }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="normal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
