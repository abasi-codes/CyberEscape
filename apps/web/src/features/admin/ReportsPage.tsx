import { useState, useEffect } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { FileText, Download, Plus } from 'lucide-react';
import { api } from '@/lib/api';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [reportType, setReportType] = useState('COMPLETION');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get('/api/admin/reports').then(r => setReports(r.data)).catch(() => {});
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      await api.post('/api/admin/reports', { type: reportType, filters: {} });
      api.get('/api/admin/reports').then(r => setReports(r.data));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>

      <Card>
        <CardTitle>Generate Report</CardTitle>
        <CardContent className="mt-4 flex items-end gap-4">
          <div className="flex-1">
            <label className="text-sm text-cyber-muted">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPLETION">Completion Report</SelectItem>
                <SelectItem value="PERFORMANCE">Performance Report</SelectItem>
                <SelectItem value="GROUP_COMPARISON">Group Comparison</SelectItem>
                <SelectItem value="RISK_ASSESSMENT">Risk Assessment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} loading={generating}><Plus className="mr-2 h-4 w-4" /> Generate</Button>
        </CardContent>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Generated</TableHead>
              <TableHead className="text-right">Download</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium"><FileText className="mr-2 inline h-4 w-4 text-cyber-muted" />Report #{r.id.slice(0, 8)}</TableCell>
                <TableCell><Badge variant="muted">{r.type}</Badge></TableCell>
                <TableCell className="text-cyber-muted">{new Date(r.generatedAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  {r.fileUrl && <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
