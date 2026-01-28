import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  content: {
    items: { id: string; label: string }[];
    categories: { id: string; label: string }[];
  };
  onSubmit: (answer: { placements: Record<string, string> }) => void;
}

export default function DragDropClassificationPuzzle({ content, onSubmit }: Props) {
  const items = content.items || [];
  const categories = content.categories || [];
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [dragItem, setDragItem] = useState<string | null>(null);

  const unplaced = items.filter(i => !placements[i.id]);
  const allPlaced = items.every(i => placements[i.id]);

  const handleDrop = (categoryId: string) => {
    if (dragItem) {
      setPlacements(prev => ({ ...prev, [dragItem]: categoryId }));
      setDragItem(null);
    }
  };

  const removeItem = (itemId: string) => {
    setPlacements(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-cyber-muted">Drag each item into the correct category.</p>

      <div className="flex flex-wrap gap-2">
        {unplaced.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDragItem(item.id)}
            className="cursor-grab rounded-lg border border-cyber-primary/50 bg-cyber-primary/10 px-3 py-2 text-sm font-medium text-cyber-primary active:cursor-grabbing"
          >
            {item.label}
          </div>
        ))}
        {unplaced.length === 0 && <p className="text-sm text-cyber-accent">All items placed!</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {categories.map(cat => (
          <div
            key={cat.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(cat.id)}
            className="min-h-[120px] rounded-lg border-2 border-dashed border-cyber-border bg-cyber-surface p-4"
          >
            <h4 className="mb-2 font-semibold text-cyber-text">{cat.label}</h4>
            <div className="flex flex-wrap gap-1">
              {items.filter(i => placements[i.id] === cat.id).map(item => (
                <button
                  key={item.id}
                  onClick={() => removeItem(item.id)}
                  className="rounded bg-cyber-accent/20 px-2 py-1 text-xs text-cyber-accent hover:bg-cyber-danger/20 hover:text-cyber-danger"
                >
                  {item.label} &times;
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={() => onSubmit({ placements })} disabled={!allPlaced} className="w-full">
        Submit Classification
      </Button>
    </div>
  );
}
