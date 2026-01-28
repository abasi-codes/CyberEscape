import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import { FolderTree, Plus, Users, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Group {
  id: string;
  name: string;
  memberCount: number;
  managerId?: string;
}

export default function GroupManagement() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    api.get('/api/v1/groups').then(r => setGroups(r.data)).catch(() => {});
  }, []);

  const createGroup = async () => {
    if (!newName.trim()) return;
    await api.post('/api/v1/groups', { name: newName });
    setNewName('');
    setShowCreate(false);
    api.get('/api/v1/groups').then(r => setGroups(r.data));
  };

  const deleteGroup = async (id: string) => {
    await api.delete(`/api/v1/groups/${id}`);
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Groups</h1>
        <Button onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> Create Group</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map(group => (
          <Card key={group.id}>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5 text-cyber-primary" />
                  <h3 className="font-semibold">{group.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button className="rounded p-1 hover:bg-cyber-surface"><Edit className="h-4 w-4 text-cyber-muted" /></button>
                  <button onClick={() => deleteGroup(group.id)} className="rounded p-1 hover:bg-cyber-surface"><Trash2 className="h-4 w-4 text-cyber-danger" /></button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-cyber-muted">
                <Users className="h-4 w-4" /> {group.memberCount} members
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogTitle>Create Group</DialogTitle>
          <div className="mt-4 space-y-4">
            <Input label="Group Name" value={newName} onChange={e => setNewName(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={createGroup}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
