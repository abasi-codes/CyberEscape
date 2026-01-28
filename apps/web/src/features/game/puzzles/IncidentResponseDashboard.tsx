import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { AlertTriangle, Shield, Clock } from 'lucide-react';

interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  timestamp: string;
}

interface Action {
  id: string;
  label: string;
  category: 'contain' | 'eradicate' | 'recover' | 'document';
}

interface Props {
  content: {
    scenario: string;
    alerts: Alert[];
    actions: Action[];
    timeline: { time: string; event: string }[];
  };
  onSubmit: (answer: { prioritizedAlerts: string[]; selectedActions: string[] }) => void;
}

export default function IncidentResponseDashboard({ content, onSubmit }: Props) {
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set());

  const alerts = content.alerts || [];
  const actions = content.actions || [];
  const timeline = content.timeline || [];

  const severityColor = (s: string) => {
    switch (s) { case 'critical': return 'danger'; case 'high': return 'warning'; default: return 'muted'; }
  };

  const toggleAction = (id: string) => {
    setSelectedActions(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleAlert = (id: string) => {
    setSelectedAlerts(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <p className="text-cyber-muted">{content.scenario}</p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-cyber-danger" /> Alerts</CardTitle>
          <CardContent className="mt-2 space-y-2">
            {alerts.map(alert => (
              <button key={alert.id} onClick={() => toggleAlert(alert.id)}
                className={`w-full rounded-lg border p-2 text-left text-sm ${
                  selectedAlerts.includes(alert.id) ? 'border-cyber-primary bg-cyber-primary/10' : 'border-cyber-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant={severityColor(alert.severity) as any}>{alert.severity}</Badge>
                  <span className="text-xs text-cyber-muted">{alert.timestamp}</span>
                </div>
                <p className="mt-1">{alert.title}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-cyber-primary" /> Timeline</CardTitle>
          <CardContent className="mt-2 space-y-2">
            {timeline.map((event, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="shrink-0 text-cyber-muted">{event.time}</span>
                <span>{event.event}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-cyber-accent" /> Response Actions</CardTitle>
          <CardContent className="mt-2 space-y-2">
            {actions.map(action => (
              <button key={action.id} onClick={() => toggleAction(action.id)}
                className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left text-sm ${
                  selectedActions.has(action.id) ? 'border-cyber-accent bg-cyber-accent/10' : 'border-cyber-border'
                }`}
              >
                <Badge variant="muted">{action.category}</Badge>
                {action.label}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Button className="w-full" onClick={() => onSubmit({ prioritizedAlerts: selectedAlerts, selectedActions: Array.from(selectedActions) })}>
        Submit Incident Response
      </Button>
    </div>
  );
}
