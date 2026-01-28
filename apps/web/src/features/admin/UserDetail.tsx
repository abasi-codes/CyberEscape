import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress';
import { ArrowLeft, Trophy, Clock, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';

export default function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (id) api.get(`/api/v1/users/${id}`).then(r => setUser(r.data)).catch(() => {});
  }, [id]);

  if (!user) return <div className="py-8 text-center text-cyber-muted">Loading...</div>;

  const roomScores = user.roomScores || [];

  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="flex items-center gap-2 text-sm text-cyber-muted hover:text-cyber-text">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Link>

      <Card>
        <CardContent className="flex items-center gap-4">
          <Avatar fallback={user.name?.charAt(0)} className="h-16 w-16 text-xl" />
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-cyber-muted">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={user.status === 'ACTIVE' ? 'success' : 'muted'}>{user.status}</Badge>
            <Badge>{user.role}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="text-center">
          <Trophy className="mx-auto h-6 w-6 text-cyber-accent" />
          <p className="mt-2 text-2xl font-bold">{user.stats?.totalPoints || 0}</p>
          <p className="text-xs text-cyber-muted">Total Points</p>
        </CardContent></Card>
        <Card><CardContent className="text-center">
          <Target className="mx-auto h-6 w-6 text-cyber-primary" />
          <p className="mt-2 text-2xl font-bold">{user.stats?.roomsCompleted || 0}/6</p>
          <p className="text-xs text-cyber-muted">Rooms Completed</p>
        </CardContent></Card>
        <Card><CardContent className="text-center">
          <Clock className="mx-auto h-6 w-6 text-cyber-warning" />
          <p className="mt-2 text-2xl font-bold">{user.stats?.totalPlayTime || 0}m</p>
          <p className="text-xs text-cyber-muted">Play Time</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardTitle>Room Scores</CardTitle>
        <CardContent className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roomScores}>
              <XAxis dataKey="roomName" stroke="#8892a8" />
              <YAxis stroke="#8892a8" />
              <Tooltip contentStyle={{ backgroundColor: '#1a2236', border: '1px solid #2a3550' }} />
              <Bar dataKey="score" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
