import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { fetchLeaderboard, setLeaderboardPeriod } from '@/store/slices/gamificationSlice';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Trophy, Medal, Award } from 'lucide-react';
import { formatPoints } from '@/lib/utils';

const rankIcons = [
  <Trophy className="h-5 w-5 text-yellow-400" />,
  <Medal className="h-5 w-5 text-gray-400" />,
  <Award className="h-5 w-5 text-amber-600" />,
];

export default function LeaderboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { leaderboard, leaderboardPeriod } = useSelector((s: RootState) => s.gamification);
  const auth = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    dispatch(fetchLeaderboard(leaderboardPeriod));
  }, [leaderboardPeriod, dispatch]);

  const changePeriod = (p: string) => {
    dispatch(setLeaderboardPeriod(p as any));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leaderboard</h1>

      <Tabs value={leaderboardPeriod} onValueChange={changePeriod}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="alltime">All Time</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map(entry => (
              <TableRow key={entry.userId} className={entry.userId === auth.user?.id ? 'bg-cyber-primary/5' : ''}>
                <TableCell className="font-bold">
                  {entry.rank <= 3 ? rankIcons[entry.rank - 1] : `#${entry.rank}`}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{entry.name}</span>
                  {entry.userId === auth.user?.id && <Badge variant="default" className="ml-2">You</Badge>}
                </TableCell>
                <TableCell className="text-right font-mono">{formatPoints(entry.points)}</TableCell>
                <TableCell className="text-right"><Badge variant="muted">Lv.{entry.level}</Badge></TableCell>
              </TableRow>
            ))}
            {leaderboard.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-cyber-muted py-8">No data available</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
