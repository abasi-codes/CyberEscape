import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Mail, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  isPhishing: boolean;
  indicators?: string[];
}

interface Props {
  content: { emails: Email[] };
  onSubmit: (answer: { classifications: Record<string, 'phishing' | 'legitimate'> }) => void;
}

export default function PhishingInboxPuzzle({ content, onSubmit }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [classifications, setClassifications] = useState<Record<string, string>>({});

  const emails = content.emails || [];
  const selectedEmail = emails.find(e => e.id === selected);
  const allClassified = emails.every(e => classifications[e.id]);

  const classify = (id: string, type: string) => {
    setClassifications(prev => ({ ...prev, [id]: type }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="space-y-2">
        <h4 className="font-semibold text-cyber-muted">Inbox ({emails.length} emails)</h4>
        {emails.map(email => (
          <button
            key={email.id}
            onClick={() => setSelected(email.id)}
            className={`w-full rounded-lg border p-3 text-left transition-colors ${
              selected === email.id ? 'border-cyber-primary bg-cyber-primary/10' : 'border-cyber-border hover:bg-cyber-surface'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyber-muted" />
                <span className="text-sm font-medium">{email.from}</span>
              </div>
              {classifications[email.id] && (
                <Badge variant={classifications[email.id] === 'phishing' ? 'danger' : 'success'}>
                  {classifications[email.id]}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm font-semibold">{email.subject}</p>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-cyber-border bg-cyber-surface p-4">
        {selectedEmail ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-cyber-muted">From: <span className="text-cyber-text">{selectedEmail.from}</span></p>
              <p className="text-sm text-cyber-muted">Subject: <span className="font-semibold text-cyber-text">{selectedEmail.subject}</span></p>
            </div>
            <div className="whitespace-pre-wrap text-sm">{selectedEmail.body}</div>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={() => classify(selectedEmail.id, 'phishing')}>
                <AlertTriangle className="mr-1 h-4 w-4" /> Phishing
              </Button>
              <Button variant="accent" size="sm" onClick={() => classify(selectedEmail.id, 'legitimate')}>
                <CheckCircle className="mr-1 h-4 w-4" /> Legitimate
              </Button>
            </div>
          </div>
        ) : (
          <p className="py-20 text-center text-cyber-muted">Select an email to inspect</p>
        )}
      </div>

      {allClassified && (
        <div className="lg:col-span-2">
          <Button className="w-full" onClick={() => onSubmit({ classifications: classifications as any })}>
            Submit Classifications
          </Button>
        </div>
      )}
    </div>
  );
}
