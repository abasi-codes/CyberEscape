import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { AlertCircle } from 'lucide-react';

interface Props {
  context: string | null;
}

export default function PuzzleContext({ context }: Props) {
  const reducedMotion = useSelector((state: RootState) => state.settings.reducedMotion);

  if (!context) return null;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 flex items-start gap-3 rounded-lg border border-cyber-border/50 bg-cyber-surface/50 p-4"
    >
      <AlertCircle className="h-5 w-5 text-cyber-primary flex-shrink-0 mt-0.5" />
      <p className="text-sm text-cyber-muted italic leading-relaxed">
        {context}
      </p>
    </motion.div>
  );
}
