import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { fetchUsers } from '@/store/slices/adminSlice';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Upload, Search, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UserManagement() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { users, totalUsers } = useSelector((s: RootState) => s.admin);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchUsers({ page, search }));
  }, [page, search, dispatch]);

  const roleColor = (role: string) => {
    switch (role) { case 'ORG_ADMIN': return 'danger'; case 'GROUP_MANAGER': return 'warning'; default: return 'muted'; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.users')}</h1>
        <div className="flex gap-2">
          <Button variant="secondary"><Upload className="mr-2 h-4 w-4" />{t('admin.importCSV')}</Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-muted" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('common.search')}
            className="h-10 w-full rounded-lg border border-cyber-border bg-cyber-surface pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-cyber-primary"
          />
        </div>
        <Badge variant="muted">{totalUsers} users</Badge>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-cyber-muted">{user.email}</TableCell>
                <TableCell><Badge variant={roleColor(user.role) as any}>{user.role}</Badge></TableCell>
                <TableCell><Badge variant={user.status === 'ACTIVE' ? 'success' : 'muted'}>{user.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <Link to={`/admin/users/${user.id}`}>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex justify-between">
        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <span className="text-sm text-cyber-muted">Page {page}</span>
        <Button variant="ghost" onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
