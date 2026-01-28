import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Shield, Wifi, Server, Monitor } from 'lucide-react';

interface NetworkNode {
  id: string;
  type: 'firewall' | 'router' | 'server' | 'workstation';
  label: string;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
  secure: boolean;
}

interface Props {
  content: {
    nodes: NetworkNode[];
    connections: Connection[];
    tasks: { id: string; description: string }[];
  };
  onSubmit: (answer: { completedTasks: string[]; firewallRules: Record<string, string> }) => void;
}

const iconMap = { firewall: Shield, router: Wifi, server: Server, workstation: Monitor };

export default function NetworkMazePuzzle({ content, onSubmit }: Props) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [firewallRules, setFirewallRules] = useState<Record<string, string>>({});
  const nodes = content.nodes || [];
  const tasks = content.tasks || [];

  const toggleTask = (id: string) => {
    setCompletedTasks(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-cyber-muted">Navigate the network and complete security tasks.</p>

      <div className="relative h-64 rounded-lg border border-cyber-border bg-cyber-surface">
        {nodes.map(node => {
          const Icon = iconMap[node.type] || Monitor;
          return (
            <div
              key={node.id}
              className="absolute flex flex-col items-center"
              style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="rounded-lg border border-cyber-border bg-cyber-card p-2">
                <Icon className="h-6 w-6 text-cyber-primary" />
              </div>
              <span className="mt-1 text-xs text-cyber-muted">{node.label}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">Security Tasks</h4>
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm ${
              completedTasks.has(task.id) ? 'border-cyber-accent bg-cyber-accent/10' : 'border-cyber-border hover:bg-cyber-surface'
            }`}
          >
            <div className={`h-4 w-4 rounded border ${completedTasks.has(task.id) ? 'border-cyber-accent bg-cyber-accent' : 'border-cyber-muted'}`} />
            {task.description}
          </button>
        ))}
      </div>

      <Button onClick={() => onSubmit({ completedTasks: Array.from(completedTasks), firewallRules })} className="w-full">
        Submit Configuration
      </Button>
    </div>
  );
}
