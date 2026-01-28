import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { api } from '@/lib/api';

const COLORS = ['#00d4ff', '#00ff88', '#ffaa00', '#ff3355', '#8b5cf6', '#06b6d4'];

export default function AnalyticsPage() {
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState<any>({});

  useEffect(() => {
    api.get(`/api/v1/admin/stats/${tab}`).then(r => setData(r.data)).catch(() => {});
  }, [tab]);

  const roomData = data.byRoom || [
    { name: 'Password', avgScore: 78, completions: 120 },
    { name: 'Phishing', avgScore: 65, completions: 85 },
    { name: 'Data Protection', avgScore: 82, completions: 95 },
    { name: 'Network', avgScore: 58, completions: 60 },
    { name: 'Insider Threat', avgScore: 45, completions: 30 },
    { name: 'Incident Response', avgScore: 40, completions: 25 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-group">By Group</TabsTrigger>
          <TabsTrigger value="by-room">By Room</TabsTrigger>
          <TabsTrigger value="by-topic">By Topic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardTitle>Score Distribution by Room</CardTitle>
              <CardContent className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roomData}>
                    <XAxis dataKey="name" stroke="#8892a8" fontSize={12} />
                    <YAxis stroke="#8892a8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a2236', border: '1px solid #2a3550' }} />
                    <Bar dataKey="avgScore" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardTitle>Completion by Room</CardTitle>
              <CardContent className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roomData} dataKey="completions" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {roomData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a2236', border: '1px solid #2a3550' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-group">
          <Card><CardContent className="py-12 text-center text-cyber-muted">Select groups to compare performance</CardContent></Card>
        </TabsContent>
        <TabsContent value="by-room">
          <Card><CardContent className="py-12 text-center text-cyber-muted">Detailed room analytics with time, hints, and accuracy metrics</CardContent></Card>
        </TabsContent>
        <TabsContent value="by-topic">
          <Card><CardContent className="py-12 text-center text-cyber-muted">Topic mastery heat map across all rooms</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
