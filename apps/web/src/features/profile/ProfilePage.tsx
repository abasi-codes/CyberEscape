import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import ProgressCard from '@/features/gamification/ProgressCard';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [leaderboardOptOut, setLeaderboardOptOut] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/api/v1/users/me', { name, preferences: { leaderboardOptOut } });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t('profile.editProfile')}</h1>

      <Card>
        <CardContent className="flex items-center gap-4">
          <Avatar fallback={user?.name?.charAt(0) || 'U'} className="h-16 w-16 text-xl" />
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-cyber-muted">{user?.email}</p>
            <Badge variant="default">{user?.role}</Badge>
          </div>
        </CardContent>
      </Card>

      <ProgressCard totalXP={0} currentLevel={1} totalPoints={0} currentStreak={0} />

      <Card>
        <CardTitle>{t('profile.settings')}</CardTitle>
        <CardContent className="mt-4 space-y-4">
          <Input label={t('auth.name')} value={name} onChange={e => setName(e.target.value)} />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('profile.leaderboardOptOut')}</p>
              <p className="text-sm text-cyber-muted">{t('profile.privacy')}</p>
            </div>
            <button
              onClick={() => setLeaderboardOptOut(!leaderboardOptOut)}
              className={`relative h-6 w-11 rounded-full transition-colors ${leaderboardOptOut ? 'bg-cyber-primary' : 'bg-cyber-border'}`}
            >
              <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${leaderboardOptOut ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <Button onClick={handleSave} loading={saving}>{t('profile.save')}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
