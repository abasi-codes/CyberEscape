import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Trophy, Clock, Lightbulb, Target } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDuration, formatPoints } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Results {
  roomName: string;
  totalPoints: number;
  timeSpent: number;
  hintsUsed: number;
  puzzlesCompleted: number;
  totalPuzzles: number;
  badgesEarned: { name: string; icon: string }[];
}

export default function ResultsScreen() {
  const { id } = useParams();
  const [results, setResults] = useState<Results | null>(null);

  useEffect(() => {
    if (id) api.get(`/api/rooms/${id}/results`).then(r => setResults(r.data)).catch(() => {});
  }, [id]);

  if (!results) return <div className="py-20 text-center text-cyber-muted">Loading results...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="text-center">
        <Trophy className="mx-auto h-16 w-16 text-cyber-accent" />
        <h1 className="mt-4 text-3xl font-bold">{results.roomName} Complete!</h1>
        <p className="mt-2 text-4xl font-bold text-cyber-primary">{formatPoints(results.totalPoints)} pts</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="text-center">
          <Clock className="mx-auto h-6 w-6 text-cyber-muted" />
          <p className="mt-2 text-lg font-bold">{formatDuration(results.timeSpent)}</p>
          <p className="text-xs text-cyber-muted">Time</p>
        </CardContent></Card>
        <Card><CardContent className="text-center">
          <Target className="mx-auto h-6 w-6 text-cyber-muted" />
          <p className="mt-2 text-lg font-bold">{results.puzzlesCompleted}/{results.totalPuzzles}</p>
          <p className="text-xs text-cyber-muted">Puzzles</p>
        </CardContent></Card>
        <Card><CardContent className="text-center">
          <Lightbulb className="mx-auto h-6 w-6 text-cyber-muted" />
          <p className="mt-2 text-lg font-bold">{results.hintsUsed}</p>
          <p className="text-xs text-cyber-muted">Hints Used</p>
        </CardContent></Card>
      </div>

      {results.badgesEarned.length > 0 && (
        <Card>
          <CardTitle>Badges Earned</CardTitle>
          <CardContent className="flex flex-wrap gap-2 mt-2">
            {results.badgesEarned.map(b => <Badge key={b.name} variant="success">{b.name}</Badge>)}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 justify-center">
        <Link to="/dashboard"><Button variant="secondary">Back to Dashboard</Button></Link>
        <Link to="/leaderboard"><Button>View Leaderboard</Button></Link>
      </div>
    </motion.div>
  );
}
