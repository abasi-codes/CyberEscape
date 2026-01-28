import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Issue {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface Props {
  content: {
    imageUrl: string;
    description: string;
    issues: Issue[];
    requiredFinds: number;
  };
  onSubmit: (answer: { foundIssues: string[] }) => void;
}

export default function SpotTheDifferencePuzzle({ content, onSubmit }: Props) {
  const [found, setFound] = useState<Set<string>>(new Set());
  const issues = content.issues || [];
  const required = content.requiredFinds || issues.length;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const threshold = 8;
    for (const issue of issues) {
      if (Math.abs(x - issue.x) < threshold && Math.abs(y - issue.y) < threshold) {
        setFound(prev => new Set(prev).add(issue.id));
        break;
      }
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-cyber-muted">{content.description || 'Click on the security issues you spot in the image below.'}</p>
      <div className="flex items-center gap-2">
        <Badge variant={found.size >= required ? 'success' : 'default'}>
          {found.size}/{required} found
        </Badge>
      </div>

      <div className="relative cursor-crosshair overflow-hidden rounded-lg border border-cyber-border" onClick={handleClick}>
        {content.imageUrl ? (
          <img src={content.imageUrl} alt="Spot the issues" className="w-full" />
        ) : (
          <div className="flex h-64 items-center justify-center bg-cyber-surface text-cyber-muted">
            Clean Desk Audit Scene
          </div>
        )}
        {issues.filter(i => found.has(i.id)).map(issue => (
          <div
            key={issue.id}
            className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyber-accent bg-cyber-accent/20 animate-pulse"
            style={{ left: `${issue.x}%`, top: `${issue.y}%` }}
            title={issue.label}
          />
        ))}
      </div>

      {found.size > 0 && (
        <div className="flex flex-wrap gap-2">
          {issues.filter(i => found.has(i.id)).map(i => (
            <Badge key={i.id} variant="success">{i.label}</Badge>
          ))}
        </div>
      )}

      <Button onClick={() => onSubmit({ foundIssues: Array.from(found) })} disabled={found.size < required} className="w-full">
        Submit Findings
      </Button>
    </div>
  );
}
