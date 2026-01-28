import { useState, useEffect } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import { Progress } from '@/components/ui/Progress';
import { Megaphone, Plus, Calendar, Users } from 'lucide-react';
import { api } from '@/lib/api';

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', dueDate: '' });

  useEffect(() => {
    api.get('/api/v1/admin/campaigns').then(r => setCampaigns(r.data)).catch(() => {});
  }, []);

  const statusColor = (s: string) => {
    switch (s) { case 'ACTIVE': return 'success'; case 'DRAFT': return 'muted'; case 'COMPLETED': return 'default'; default: return 'warning'; }
  };

  const create = async () => {
    await api.post('/api/v1/admin/campaigns', {
      ...form,
      targetGroups: [],
      settings: { requiredRooms: [1, 2, 3], reminderDays: [7, 3, 1], allowLateCompletion: false },
    });
    setShowCreate(false);
    api.get('/api/v1/admin/campaigns').then(r => setCampaigns(r.data));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Button onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> Create Campaign</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {campaigns.map(c => (
          <Card key={c.id}>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-cyber-primary" />
                  <h3 className="font-semibold">{c.name}</h3>
                </div>
                <Badge variant={statusColor(c.status) as any}>{c.status}</Badge>
              </div>
              <div className="mt-3 flex gap-4 text-sm text-cyber-muted">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Due: {new Date(c.dueDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {c.targetGroups?.length || 0} groups</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-cyber-muted">Completion</span>
                  <span>{c.completionRate || 0}%</span>
                </div>
                <Progress value={c.completionRate || 0} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogTitle>Create Campaign</DialogTitle>
          <div className="mt-4 space-y-4">
            <Input label="Campaign Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={create}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
