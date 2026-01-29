import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

interface Props {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function ScoreCounter({
  value,
  duration = 600,
  prefix = '',
  suffix = '',
  className = '',
}: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValue = useRef(value);

  useEffect(() => {
    if (reducedMotion || value === previousValue.current) {
      setDisplayValue(value);
      previousValue.current = value;
      return;
    }

    const startValue = previousValue.current;
    const diff = value - startValue;
    const startTime = Date.now();

    setIsAnimating(true);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + diff * eased);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        previousValue.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, reducedMotion]);

  return (
    <span className={`inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={isAnimating ? 'animating' : 'static'}
          initial={isAnimating && !reducedMotion ? { scale: 1.2 } : false}
          animate={{ scale: 1 }}
          className={isAnimating && !reducedMotion ? 'text-cyber-accent' : ''}
        >
          {prefix}{displayValue.toLocaleString()}{suffix}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
