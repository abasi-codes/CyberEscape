import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameState } from '@/hooks/useGameState';
import { useCountdown } from '@/hooks/useCountdown';
import { api } from '@/lib/api';
import GameHeader from './components/GameHeader';
import PuzzleRenderer from './components/PuzzleRenderer';
import HintPanel from './components/HintPanel';
import FeedbackModal from './components/FeedbackModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameCanvas() {
  const { id } = useParams<{ id: string }>();
  const game = useGameState();

  useEffect(() => {
    if (!id) return;
    api.get(`/api/v1/rooms/${id}`).then(res => {
      const room = res.data;
      game.startRoom({
        roomId: room.id,
        roomName: room.name,
        timeLimit: room.timeLimit,
        totalPuzzles: room.puzzles?.length || 4,
      });
      setTimeout(() => {
        game.setIntro();
        setTimeout(() => {
          if (room.puzzles?.[0]) {
            game.startPuzzle({
              id: room.puzzles[0].id,
              type: room.puzzles[0].type,
              title: room.puzzles[0].title,
              content: room.puzzles[0].content,
              hints: room.puzzles[0].hints,
              points: room.puzzles[0].points,
            });
          }
        }, 2000);
      }, 1000);
    }).catch(() => {});
  }, [id]);

  useCountdown(
    game.timeRemaining,
    () => game.tickTimer(),
    () => game.failRoom(),
    game.phase === 'PUZZLE_ACTIVE',
  );

  const handleSubmit = async (answer: Record<string, unknown>) => {
    game.submitAnswer();
    try {
      const res = await api.post(`/api/v1/rooms/${id}/puzzles/${game.currentPuzzle?.id}/submit`, { answer });
      game.showFeedback({
        correct: res.data.correct,
        message: res.data.explanation || (res.data.correct ? 'Correct!' : 'Incorrect, try again.'),
        scoreBreakdown: res.data.scoreBreakdown,
      });
      if (res.data.correct) {
        setTimeout(() => {
          game.completePuzzle();
          // Load next puzzle
          if (game.currentPuzzleIndex + 1 < game.totalPuzzles) {
            api.get(`/api/v1/rooms/${id}/puzzles/next?index=${game.currentPuzzleIndex + 1}`)
              .then(r => game.startPuzzle(r.data))
              .catch(() => {});
          }
        }, 2000);
      }
    } catch {
      game.showFeedback({ correct: false, message: 'Error submitting answer', scoreBreakdown: null });
    }
  };

  const handleHint = async () => {
    if (!game.currentPuzzle) return;
    const hintIndex = game.hintsRevealed.length;
    if (hintIndex < game.currentPuzzle.hints.length) {
      game.revealHint(game.currentPuzzle.hints[hintIndex].text);
    }
  };

  if (game.phase === 'IDLE' || game.phase === 'LOADING') return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-4">
      <GameHeader
        roomName={game.roomName}
        timeRemaining={game.timeRemaining}
        score={game.score}
        hintsUsed={game.hintsUsed}
        puzzleIndex={game.currentPuzzleIndex}
        totalPuzzles={game.totalPuzzles}
      />

      <AnimatePresence mode="wait">
        {game.phase === 'INTRO' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <h2 className="text-3xl font-bold text-cyber-primary">{game.roomName}</h2>
            <p className="mt-4 text-cyber-muted">Preparing your challenge...</p>
          </motion.div>
        )}

        {game.phase === 'PUZZLE_ACTIVE' && game.currentPuzzle && (
          <motion.div key={game.currentPuzzle.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="grid grid-cols-1 gap-4 lg:grid-cols-4"
          >
            <div className="lg:col-span-3">
              <PuzzleRenderer puzzle={game.currentPuzzle} onSubmit={handleSubmit} />
            </div>
            <div>
              <HintPanel
                hints={game.currentPuzzle.hints}
                revealedHints={game.hintsRevealed}
                onRequestHint={handleHint}
              />
            </div>
          </motion.div>
        )}

        {(game.phase === 'ROOM_COMPLETE' || game.phase === 'ROOM_FAILED') && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-20"
          >
            <h2 className={`text-4xl font-bold ${game.phase === 'ROOM_COMPLETE' ? 'text-cyber-accent' : 'text-cyber-danger'}`}>
              {game.phase === 'ROOM_COMPLETE' ? 'Room Complete!' : "Time's Up!"}
            </h2>
            <p className="mt-4 text-2xl">Score: {game.score}</p>
            <button onClick={() => game.goToDebrief()} className="mt-8 rounded-lg bg-cyber-primary px-6 py-3 text-cyber-bg font-medium">
              View Results
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {game.phase === 'PUZZLE_FEEDBACK' && (
        <FeedbackModal
          correct={game.feedbackCorrect}
          message={game.feedbackMessage}
          scoreBreakdown={game.lastScoreBreakdown}
        />
      )}
    </div>
  );
}
