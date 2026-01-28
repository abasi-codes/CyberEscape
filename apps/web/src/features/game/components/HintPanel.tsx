import { Button } from '@/components/ui/Button';
import { Lightbulb, Lock } from 'lucide-react';

interface Props {
  hints: { index: number; text: string; cost: number }[];
  revealedHints: string[];
  onRequestHint: () => void;
}

export default function HintPanel({ hints, revealedHints, onRequestHint }: Props) {
  const nextHintIndex = revealedHints.length;
  const hasMore = nextHintIndex < hints.length;
  const nextCost = hasMore ? hints[nextHintIndex].cost : 0;

  return (
    <div className="rounded-xl border border-cyber-border bg-cyber-card p-4">
      <h4 className="mb-3 flex items-center gap-2 font-semibold">
        <Lightbulb className="h-5 w-5 text-cyber-warning" /> Hints
      </h4>

      <div className="space-y-3">
        {revealedHints.map((hint, i) => (
          <div key={i} className="rounded-lg bg-cyber-warning/10 p-3 text-sm text-cyber-text">
            <span className="font-medium text-cyber-warning">Hint {i + 1}:</span> {hint}
          </div>
        ))}

        {hints.slice(revealedHints.length).map((_, i) => (
          <div key={`locked-${i}`} className="flex items-center gap-2 rounded-lg bg-cyber-surface p-3 text-sm text-cyber-muted">
            <Lock className="h-4 w-4" /> Hint {revealedHints.length + i + 1} (locked)
          </div>
        ))}
      </div>

      {hasMore && (
        <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={onRequestHint}>
          Reveal Hint (-{nextCost} pts)
        </Button>
      )}
    </div>
  );
}
