import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

interface Badge {
  name: string;
  description?: string;
  icon?: string;
}

interface Props {
  badge: Badge | null;
  onClose?: () => void;
  autoClose?: number;
}

export default function BadgeUnlock({ badge, onClose, autoClose = 5000 }: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (badge) {
      setVisible(true);
      if (autoClose > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
          onClose?.();
        }, autoClose);
        return () => clearTimeout(timer);
      }
    }
  }, [badge, autoClose, onClose]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {visible && badge && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="fixed bottom-8 right-8 z-50 max-w-sm"
        >
          <div className="relative overflow-hidden rounded-xl border border-cyber-accent/50 bg-cyber-card p-6 shadow-[0_0_30px_rgba(0,255,136,0.3)]">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-accent/10 to-transparent" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-2 top-2 p-1 text-cyber-muted hover:text-cyber-text transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative flex items-center gap-4">
              {/* Badge icon */}
              <motion.div
                initial={reducedMotion ? false : { rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-cyber-accent/20 text-cyber-accent"
              >
                <Award className="h-8 w-8" />
              </motion.div>

              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyber-accent">
                  Badge Unlocked!
                </p>
                <h3 className="mt-1 text-lg font-bold text-cyber-text">
                  {badge.name}
                </h3>
                {badge.description && (
                  <p className="mt-1 text-sm text-cyber-muted">
                    {badge.description}
                  </p>
                )}
              </div>
            </div>

            {/* Sparkle effects */}
            {!reducedMotion && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [0, (Math.random() - 0.5) * 100],
                      y: [0, (Math.random() - 0.5) * 100],
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.3 + i * 0.1,
                      ease: 'easeOut',
                    }}
                    className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-cyber-accent"
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
