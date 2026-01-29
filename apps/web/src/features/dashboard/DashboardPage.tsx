import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Lock, CheckCircle, Play, Flame, Star, Trophy } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPoints, calculateLevel } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RoomStatus {
  id: string;
  number: number;
  name: string;
  description: string;
  type: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED';
  score?: number;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [stats, setStats] = useState({ totalPoints: 0, currentLevel: 1, currentStreak: 0, roomsCompleted: 0 });

  useEffect(() => {
    api.get('/api/rooms').then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      setRooms(data.map((room: any) => ({
        id: room.id,
        number: room.order,
        name: room.name,
        description: room.description,
        type: room.type,
        status: 'NOT_STARTED' as const,
      })));
    }).catch(() => {});
    api.get('/api/gamification/progress').then(r => {
      const s = r.data?.stats || {};
      setStats({ totalPoints: s.totalScore ?? 0, currentLevel: calculateLevel(s.totalScore ?? 0), currentStreak: s.currentStreak ?? 0, roomsCompleted: s.roomsCompleted ?? 0 });
    }).catch(() => {});
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-5 w-5 text-cyber-accent" />;
      case 'IN_PROGRESS': return <Play className="h-5 w-5 text-cyber-primary" />;
      case 'LOCKED': return <Lock className="h-5 w-5 text-cyber-muted" />;
      default: return <Play className="h-5 w-5 text-cyber-muted" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.welcome', { name: user?.name })}</h1>
        <p className="text-cyber-muted">{t('dashboard.continueTraining')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Points', value: formatPoints(stats.totalPoints), icon: Star, color: 'text-cyber-primary' },
          { label: 'Level', value: stats.currentLevel, icon: Trophy, color: 'text-cyber-accent' },
          { label: 'Streak', value: `${stats.currentStreak}d`, icon: Flame, color: 'text-cyber-warning' },
          { label: 'Rooms', value: `${stats.roomsCompleted}/6`, icon: CheckCircle, color: 'text-cyber-accent' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-cyber-muted">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">{t('dashboard.rooms')}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, i) => (
            <motion.div key={room.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={room.status === 'LOCKED' ? 'opacity-50' : ''}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {statusIcon(room.status)}
                      <CardTitle>Room {room.number}: {room.name}</CardTitle>
                    </div>
                    <p className="mt-2 text-sm text-cyber-muted">{room.description}</p>
                  </div>
                  <Badge variant={room.type === 'TEAM' ? 'default' : 'muted'}>{room.type}</Badge>
                </div>
                <div className="mt-4">
                  {room.status === 'COMPLETED' ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-cyber-accent">Score: {room.score}</span>
                      <Link to={`/rooms/${room.id}/results`}><Button variant="ghost" size="sm">View Results</Button></Link>
                    </div>
                  ) : room.status !== 'LOCKED' ? (
                    <Link to={room.type === 'TEAM' ? `/team/lobby/${room.id}` : `/rooms/${room.id}`}>
                      <Button size="sm" className="w-full">{t('dashboard.startRoom')}</Button>
                    </Link>
                  ) : (
                    <p className="text-center text-sm text-cyber-muted">{t('dashboard.locked')}</p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
