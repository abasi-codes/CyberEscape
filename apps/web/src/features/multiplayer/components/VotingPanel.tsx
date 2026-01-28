import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/Button';
import { Vote } from 'lucide-react';

interface Props {
  teamId: string;
  puzzleId: string;
  options: { id: string; label: string }[];
  results?: Record<string, number>;
  hasVoted?: boolean;
}

export default function VotingPanel({ teamId, puzzleId, options, results, hasVoted }: Props) {
  const { emit } = useSocket();
  const [voted, setVoted] = useState(hasVoted);

  const handleVote = (answerId: string) => {
    emit('team:vote', { teamId, puzzleId, answer: answerId });
    setVoted(true);
  };

  const totalVotes = results ? Object.values(results).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="rounded-xl border border-cyber-border bg-cyber-card p-4">
      <h4 className="mb-3 flex items-center gap-2 font-semibold">
        <Vote className="h-5 w-5 text-cyber-primary" /> Team Vote
      </h4>
      <div className="space-y-2">
        {options.map(opt => (
          <div key={opt.id}>
            {voted || results ? (
              <div className="rounded-lg border border-cyber-border p-3">
                <div className="flex justify-between text-sm">
                  <span>{opt.label}</span>
                  <span className="text-cyber-muted">{results?.[opt.id] || 0} votes</span>
                </div>
                {totalVotes > 0 && (
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cyber-surface">
                    <div className="h-full rounded-full bg-cyber-primary" style={{ width: `${((results?.[opt.id] || 0) / totalVotes) * 100}%` }} />
                  </div>
                )}
              </div>
            ) : (
              <Button variant="secondary" className="w-full justify-start" onClick={() => handleVote(opt.id)}>
                {opt.label}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
