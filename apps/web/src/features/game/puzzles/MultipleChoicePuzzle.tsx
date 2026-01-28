import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Circle } from 'lucide-react';

interface Props {
  content: {
    question: string;
    options: { id: string; text: string }[];
    multiple?: boolean;
  };
  onSubmit: (answer: { selectedIds: string[] }) => void;
}

export default function MultipleChoicePuzzle({ content, onSubmit }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const isMultiple = content.multiple;

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (isMultiple) {
        next.has(id) ? next.delete(id) : next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-lg text-cyber-text">{content.question}</p>
      {isMultiple && <p className="text-sm text-cyber-muted">Select all that apply.</p>}

      <div className="space-y-2">
        {(content.options || []).map(opt => (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
              selected.has(opt.id) ? 'border-cyber-primary bg-cyber-primary/10' : 'border-cyber-border hover:bg-cyber-surface'
            }`}
          >
            {selected.has(opt.id) ? <CheckCircle className="h-5 w-5 text-cyber-primary" /> : <Circle className="h-5 w-5 text-cyber-muted" />}
            <span>{opt.text}</span>
          </button>
        ))}
      </div>

      <Button onClick={() => onSubmit({ selectedIds: Array.from(selected) })} disabled={selected.size === 0} className="w-full">
        Submit Answer
      </Button>
    </div>
  );
}
