import PasswordStrengthPuzzle from '../puzzles/PasswordStrengthPuzzle';
import PhishingInboxPuzzle from '../puzzles/PhishingInboxPuzzle';
import DragDropClassificationPuzzle from '../puzzles/DragDropClassificationPuzzle';
import MatchingPuzzle from '../puzzles/MatchingPuzzle';
import MultipleChoicePuzzle from '../puzzles/MultipleChoicePuzzle';
import SpotTheDifferencePuzzle from '../puzzles/SpotTheDifferencePuzzle';
import NetworkMazePuzzle from '../puzzles/NetworkMazePuzzle';
import RolePlayScenarioPuzzle from '../puzzles/RolePlayScenarioPuzzle';
import IncidentResponseDashboard from '../puzzles/IncidentResponseDashboard';

interface PuzzleData {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  hints: { index: number; text: string; cost: number }[];
  points: number;
}

interface Props {
  puzzle: PuzzleData;
  onSubmit: (answer: Record<string, unknown>) => void;
}

const puzzleComponents: Record<string, React.ComponentType<{ content: any; onSubmit: (answer: any) => void }>> = {
  PASSWORD_STRENGTH: PasswordStrengthPuzzle,
  PHISHING_INBOX: PhishingInboxPuzzle,
  DRAG_DROP_CLASSIFICATION: DragDropClassificationPuzzle,
  MATCHING: MatchingPuzzle,
  MULTIPLE_CHOICE: MultipleChoicePuzzle,
  SPOT_DIFFERENCE: SpotTheDifferencePuzzle,
  NETWORK_MAZE: NetworkMazePuzzle,
  ROLE_PLAY_SCENARIO: RolePlayScenarioPuzzle,
  INCIDENT_RESPONSE: IncidentResponseDashboard,
};

export default function PuzzleRenderer({ puzzle, onSubmit }: Props) {
  const Component = puzzleComponents[puzzle.type];

  if (!Component) {
    return (
      <div className="rounded-xl border border-cyber-border bg-cyber-card p-8 text-center">
        <p className="text-cyber-muted">Unknown puzzle type: {puzzle.type}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-cyber-border bg-cyber-card p-6">
      <h3 className="mb-4 text-xl font-semibold text-cyber-text">{puzzle.title}</h3>
      <Component content={puzzle.content} onSubmit={(answer: any) => onSubmit({ answer })} />
    </div>
  );
}
