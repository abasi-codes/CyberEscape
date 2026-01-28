import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { fetchOrgStats, fetchAlerts } from '@/store/slices/adminSlice';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, CheckCircle, TrendingUp, Megaphone, AlertTriangle, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { orgStats, alerts } = useSelector((s: RootState) => s.admin);

  useEffect(() => {
    dispatch(fetchOrgStats());
    dispatch(fetchAlerts());
  }, [dispatch]);

  const stats = orgStats || { totalUsers: 0, activeUsers: 0, completionRate: 0, avgScore: 0, activeCampaigns: 0, readinessScore: 0 };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-cyber-primary' },
    { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: CheckCircle, color: 'text-cyber-accent' },
    { label: 'Avg Score', value: stats.avgScore, icon: TrendingUp, color: 'text-cyber-warning' },
    { label: 'Readiness', value: `${stats.readinessScore}%`, icon: Shield, color: 'text-cyber-primary' },
  ];

  const mockChartData = [
    { name: 'Week 1', completions: 12 }, { name: 'Week 2', completions: 28 },
    { name: 'Week 3', completions: 45 }, { name: 'Week 4', completions: 63 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4">
              <Icon className={`h-8 w-8 ${color}`} />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-cyber-muted">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Completions Over Time</CardTitle>
          <CardContent className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <XAxis dataKey="name" stroke="#8892a8" />
                <YAxis stroke="#8892a8" />
                <Tooltip contentStyle={{ backgroundColor: '#1a2236', border: '1px solid #2a3550' }} />
                <Line type="monotone" dataKey="completions" stroke="#00d4ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardTitle className="flex items-center justify-between">
            Alerts
            <Badge variant="danger">{alerts.filter(a => !a.acknowledged).length} new</Badge>
          </CardTitle>
          <CardContent className="mt-4 space-y-2 max-h-56 overflow-y-auto">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className={`rounded-lg border p-3 text-sm ${
                alert.severity === 'CRITICAL' ? 'border-cyber-danger bg-cyber-danger/5' : 'border-cyber-border'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{alert.title}</span>
                  <Badge variant={alert.severity === 'CRITICAL' ? 'danger' : alert.severity === 'WARNING' ? 'warning' : 'muted'}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="mt-1 text-cyber-muted">{alert.message}</p>
              </div>
            ))}
            {alerts.length === 0 && <p className="text-cyber-muted text-center py-4">No alerts</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
