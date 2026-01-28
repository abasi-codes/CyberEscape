import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { setTeam, addMember, removeMember, setMemberReady } from '@/store/slices/teamSlice';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Copy, Check, Users, Crown } from 'lucide-react';
import { api } from '@/lib/api';
import VideoGrid from './VideoGrid';
import TextChat from './TextChat';

export default function TeamLobby() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const team = useSelector((s: RootState) => s.team);
  const auth = useSelector((s: RootState) => s.auth);
  const { emit, on } = useSocket();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      api.get(`/api/v1/teams/${id}`).then(r => {
        dispatch(setTeam({ teamId: r.data.id, name: r.data.name, joinCode: r.data.joinCode, roomId: r.data.roomId }));
      }).catch(() => {});
      emit('team:join', { teamId: id });
    }

    const unsubs = [
      on('team:member:joined', (m: any) => dispatch(addMember(m))),
      on('team:member:left', (id: string) => dispatch(removeMember(id))),
      on('team:member:ready', (d: any) => dispatch(setMemberReady(d))),
      on('game:joined', () => navigate(`/rooms/${team.roomId}`)),
    ];
    return () => unsubs.forEach(u => u());
  }, [id]);

  const copyCode = () => {
    navigator.clipboard.writeText(team.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleReady = () => emit('team:ready', { ready: true });
  const startGame = () => emit('game:state:update', { action: 'start' });
  const isHost = team.members.find(m => m.userId === auth.user?.id)?.isHost;
  const allReady = team.members.every(m => m.ready);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Team Lobby</CardTitle>
          <CardContent>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-cyber-muted">Join Code:</span>
              <code className="rounded bg-cyber-surface px-3 py-1 font-mono text-lg text-cyber-primary">{team.joinCode}</code>
              <button onClick={copyCode} className="text-cyber-muted hover:text-cyber-text">
                {copied ? <Check className="h-4 w-4 text-cyber-accent" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {team.members.map(member => (
                <div key={member.userId} className="flex items-center justify-between rounded-lg border border-cyber-border p-3">
                  <div className="flex items-center gap-2">
                    {member.isHost && <Crown className="h-4 w-4 text-cyber-warning" />}
                    <span>{member.name}</span>
                    {member.role && <Badge variant="muted">{member.role}</Badge>}
                  </div>
                  <Badge variant={member.ready ? 'success' : 'warning'}>
                    {member.ready ? 'Ready' : 'Not Ready'}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Button onClick={toggleReady} variant="secondary">Toggle Ready</Button>
              {isHost && <Button onClick={startGame} disabled={!allReady || team.members.length < 2}>Start Game</Button>}
            </div>
          </CardContent>
        </Card>

        <VideoGrid roomId={team.teamId} />
      </div>

      <div>
        <TextChat teamId={team.teamId || ''} />
      </div>
    </div>
  );
}
