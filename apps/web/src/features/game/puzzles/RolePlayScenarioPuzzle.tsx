import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { User, MessageSquare } from 'lucide-react';

interface DialogOption {
  id: string;
  text: string;
  nextStepId?: string;
}

interface Step {
  id: string;
  speaker: string;
  message: string;
  options: DialogOption[];
}

interface Props {
  content: { steps: Step[]; scenario: string };
  onSubmit: (answer: { choices: string[] }) => void;
}

export default function RolePlayScenarioPuzzle({ content, onSubmit }: Props) {
  const steps = content.steps || [];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [history, setHistory] = useState<{ speaker: string; message: string }[]>([]);

  const currentStep = steps[currentStepIndex];
  const isComplete = !currentStep;

  const handleChoice = (option: DialogOption) => {
    setChoices(prev => [...prev, option.id]);
    setHistory(prev => [
      ...prev,
      { speaker: currentStep.speaker, message: currentStep.message },
      { speaker: 'You', message: option.text },
    ]);
    if (option.nextStepId) {
      const nextIdx = steps.findIndex(s => s.id === option.nextStepId);
      setCurrentStepIndex(nextIdx >= 0 ? nextIdx : currentStepIndex + 1);
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-cyber-muted">{content.scenario}</p>

      <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border border-cyber-border bg-cyber-surface p-4">
        {history.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.speaker === 'You' ? 'justify-end' : ''}`}>
            {msg.speaker !== 'You' && <User className="mt-1 h-5 w-5 text-cyber-muted" />}
            <div className={`max-w-[70%] rounded-lg p-3 text-sm ${
              msg.speaker === 'You' ? 'bg-cyber-primary/20 text-cyber-primary' : 'bg-cyber-card'
            }`}>
              <p className="text-xs font-semibold text-cyber-muted">{msg.speaker}</p>
              <p>{msg.message}</p>
            </div>
          </div>
        ))}

        {currentStep && (
          <div className="flex gap-2">
            <User className="mt-1 h-5 w-5 text-cyber-muted" />
            <div className="rounded-lg bg-cyber-card p-3 text-sm">
              <p className="text-xs font-semibold text-cyber-muted">{currentStep.speaker}</p>
              <p>{currentStep.message}</p>
            </div>
          </div>
        )}
      </div>

      {currentStep && (
        <div className="space-y-2">
          {currentStep.options.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleChoice(opt)}
              className="w-full rounded-lg border border-cyber-border p-3 text-left text-sm hover:bg-cyber-surface"
            >
              <MessageSquare className="mr-2 inline h-4 w-4 text-cyber-primary" />
              {opt.text}
            </button>
          ))}
        </div>
      )}

      {isComplete && (
        <Button onClick={() => onSubmit({ choices })} className="w-full">Submit Responses</Button>
      )}
    </div>
  );
}
