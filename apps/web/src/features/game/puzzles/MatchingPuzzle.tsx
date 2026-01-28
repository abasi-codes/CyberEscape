import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  content: {
    leftItems: { id: string; label: string }[];
    rightItems: { id: string; label: string }[];
  };
  onSubmit: (answer: { matches: Record<string, string> }) => void;
}

export default function MatchingPuzzle({ content, onSubmit }: Props) {
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const leftItems = content.leftItems || [];
  const rightItems = content.rightItems || [];
  const matchedRight = new Set(Object.values(matches));
  const allMatched = leftItems.every(l => matches[l.id]);

  const handleLeftClick = (id: string) => {
    if (matches[id]) {
      setMatches(prev => { const n = { ...prev }; delete n[id]; return n; });
    } else {
      setSelectedLeft(id);
    }
  };

  const handleRightClick = (id: string) => {
    if (selectedLeft && !matchedRight.has(id)) {
      setMatches(prev => ({ ...prev, [selectedLeft]: id }));
      setSelectedLeft(null);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-cyber-muted">Match each term on the left with its definition on the right.</p>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          {leftItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleLeftClick(item.id)}
              className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                matches[item.id] ? 'border-cyber-accent bg-cyber-accent/10 text-cyber-accent'
                : selectedLeft === item.id ? 'border-cyber-primary bg-cyber-primary/10 text-cyber-primary'
                : 'border-cyber-border hover:bg-cyber-surface'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rightItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleRightClick(item.id)}
              disabled={matchedRight.has(item.id)}
              className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                matchedRight.has(item.id) ? 'border-cyber-accent bg-cyber-accent/10 text-cyber-accent opacity-60'
                : 'border-cyber-border hover:bg-cyber-surface'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={() => onSubmit({ matches })} disabled={!allMatched} className="w-full">
        Submit Matches
      </Button>
    </div>
  );
}
