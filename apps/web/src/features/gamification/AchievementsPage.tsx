import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tier: string;
  earned: boolean;
  earnedAt?: string;
  secret: boolean;
}

export default function AchievementsPage() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/api/gamification/badges').then(r => setBadges(r.data)).catch(() => {});
  }, []);

  const categories = ['all', ...new Set(badges.map(b => b.category))];
  const filtered = filter === 'all' ? badges : badges.filter(b => b.category === filter);
  const earned = filtered.filter(b => b.earned);
  const locked = filtered.filter(b => !b.earned);

  const tierColor = (tier: string) => {
    switch (tier) { case 'PLATINUM': return 'text-purple-400'; case 'GOLD': return 'text-yellow-400'; case 'SILVER': return 'text-gray-400'; default: return 'text-amber-600'; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Achievements</h1>
        <Badge variant="success">{earned.length}/{badges.length} Earned</Badge>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          {categories.map(c => <TabsTrigger key={c} value={c}>{c === 'all' ? 'All' : c}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {earned.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-cyber-accent">Earned</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {earned.map((badge, i) => (
              <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="text-center">
                  <CardContent>
                    <div className={`mx-auto mb-2 text-4xl ${tierColor(badge.tier)}`}>{badge.icon || '🏆'}</div>
                    <h3 className="font-semibold text-sm">{badge.name}</h3>
                    <p className="text-xs text-cyber-muted mt-1">{badge.description}</p>
                    <Badge variant="muted" className="mt-2">{badge.tier}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-cyber-muted">Locked</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {locked.map(badge => (
              <Card key={badge.id} className="opacity-50 text-center">
                <CardContent>
                  <Lock className="mx-auto mb-2 h-8 w-8 text-cyber-muted" />
                  <h3 className="font-semibold text-sm">{badge.secret ? 'Secret Badge' : badge.name}</h3>
                  <p className="text-xs text-cyber-muted mt-1">{badge.secret ? '???' : badge.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
