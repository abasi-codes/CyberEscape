import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Check, X } from 'lucide-react';

interface Props {
  content: { minLength?: number; requireUpper?: boolean; requireLower?: boolean; requireNumber?: boolean; requireSpecial?: boolean };
  onSubmit: (answer: { password: string }) => void;
}

export default function PasswordStrengthPuzzle({ content, onSubmit }: Props) {
  const [password, setPassword] = useState('');
  const minLen = content.minLength || 12;

  const checks = useMemo(() => [
    { label: `At least ${minLen} characters`, met: password.length >= minLen },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
    { label: 'No common patterns', met: !/^(password|123456|qwerty)/i.test(password) && password.length > 0 },
  ], [password, minLen]);

  const strength = checks.filter(c => c.met).length;
  const allMet = checks.every(c => c.met);
  const strengthPct = (strength / checks.length) * 100;
  const strengthColor = strengthPct < 40 ? 'bg-cyber-danger' : strengthPct < 70 ? 'bg-cyber-warning' : 'bg-cyber-accent';

  return (
    <div className="space-y-6">
      <p className="text-cyber-muted">Create a strong password that meets all the requirements below.</p>
      <Input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter a strong password..."
        className="font-mono text-lg"
      />

      <div className="h-2 w-full overflow-hidden rounded-full bg-cyber-surface">
        <div className={`h-full rounded-full transition-all ${strengthColor}`} style={{ width: `${strengthPct}%` }} />
      </div>

      <div className="space-y-2">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            {check.met ? <Check className="h-4 w-4 text-cyber-accent" /> : <X className="h-4 w-4 text-cyber-danger" />}
            <span className={check.met ? 'text-cyber-accent' : 'text-cyber-muted'}>{check.label}</span>
          </div>
        ))}
      </div>

      <Button onClick={() => onSubmit({ password })} disabled={!allMet} className="w-full">
        Submit Password
      </Button>
    </div>
  );
}
