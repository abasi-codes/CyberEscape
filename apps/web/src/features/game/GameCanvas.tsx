import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGameState } from '@/hooks/useGameState';
import { useCountdown } from '@/hooks/useCountdown';
import { useAudio } from '@/hooks/useAudio';
import { useUrgency } from '@/hooks/useUrgency';
import { api } from '@/lib/api';
import { getRoomTheme } from '@/lib/roomThemes';
import { getPuzzleContext } from '@/lib/roomNarratives';
import GameHeader from './components/GameHeader';
import PuzzleRenderer from './components/PuzzleRenderer';
import HintPanel from './components/HintPanel';
import FeedbackModal from './components/FeedbackModal';
import RoomIntro from './components/RoomIntro';
import RoomDebrief from './components/RoomDebrief';
import PuzzleContext from './components/PuzzleContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import VideoGrid from '@/features/multiplayer/components/VideoGrid';
import TextChat from '@/features/multiplayer/components/TextChat';
import ScanlineOverlay from '@/components/effects/ScanlineOverlay';
import ParticleField from '@/components/effects/ParticleField';
import Vignette from '@/components/effects/Vignette';
import WarningFlash from '@/components/effects/WarningFlash';
import Confetti from '@/components/effects/Confetti';
import ScreenShake from '@/components/effects/ScreenShake';
import { motion, AnimatePresence } from 'framer-motion';

interface RawPuzzle {
  id: string;
  type: string;
  title: string;
  config: unknown;
  hints: unknown;
  basePoints?: number;
}

function parsePuzzle(p: RawPuzzle) {
  const rawHints: string[] = typeof p.hints === 'string' ? JSON.parse(p.hints) : (p.hints || []);
  const hints = rawHints.map((h: string, i: number) => ({ index: i, text: h, cost: (i + 1) * 10 }));
  const content = typeof p.config === 'string' ? JSON.parse(p.config) : (p.config || {});
  return {
    id: p.id,
    type: p.type,
    title: p.title,
    content,
    hints,
    points: p.basePoints || 100,
  };
}

export default function GameCanvas() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = useGameState();
  const teamId = useSelector((s: RootState) => s.team.teamId);
  const reducedMotion = useSelector((s: RootState) => s.settings.reducedMotion);
  const isMultiplayer = !!teamId;
  const puzzlesRef = useRef<RawPuzzle[]>([]);

  // Audio
  const { playSFX, playAmbient, stopAmbient } = useAudio();

  // Urgency
  const urgency = useUrgency(game.timeRemaining, game.timeLimit);

  // Visual effect states
  const [showConfetti, setShowConfetti] = useState(false);
  const [triggerShake, setTriggerShake] = useState(false);
  const [warningFlashTrigger, setWarningFlashTrigger] = useState(false);

  // Get room theme
  const roomTheme = getRoomTheme(game.roomName);

  // Handle time milestones
  const handleMilestone = useCallback((milestone: string) => {
    setWarningFlashTrigger(true);
    setTimeout(() => setWarningFlashTrigger(false), 100);

    if (milestone === '30s' || milestone === '10s' || milestone === '5s') {
      playSFX('warning-beep');
    }
  }, [playSFX]);

  useEffect(() => {
    if (!id) return;

    api.get(`/api/rooms/${id}`).then(res => {
      const room = res.data;
      const puzzles: RawPuzzle[] = room.puzzles || [];
      puzzlesRef.current = puzzles;

      game.startRoom({
        roomId: room.id,
        roomName: room.name,
        roomType: room.type || 'default',
        timeLimit: room.timeLimit,
        totalPuzzles: puzzles.length,
      });

      // Start game progress on backend
      api.post(`/api/rooms/${id}/start`).catch(() => {});

      // Show briefing/intro
      setTimeout(() => {
        game.setBriefing();
      }, 500);
    }).catch(() => {});

    return () => {
      stopAmbient();
    };
  }, [id]);

  // Play ambient sound when room loads and phase changes
  useEffect(() => {
    if (game.phase === 'PUZZLE_ACTIVE' || game.phase === 'BRIEFING' || game.phase === 'INTRO') {
      playAmbient(roomTheme.ambientSound);
    }
    if (game.phase === 'ROOM_COMPLETE' || game.phase === 'ROOM_FAILED') {
      stopAmbient();
    }
  }, [game.phase, roomTheme.ambientSound, playAmbient, stopAmbient]);

  // Play urgency sounds
  useEffect(() => {
    if (game.phase !== 'PUZZLE_ACTIVE') return;

    if (urgency.playAlarm) {
      playSFX('alarm');
    }
  }, [urgency.playAlarm, game.phase, playSFX]);

  useCountdown(
    game.timeRemaining,
    () => game.tickTimer(),
    () => game.failRoom(),
    game.phase === 'PUZZLE_ACTIVE',
    handleMilestone,
  );

  const handleIntroComplete = () => {
    game.setIntro();
    setTimeout(() => {
      if (puzzlesRef.current[0]) {
        game.startPuzzle(parsePuzzle(puzzlesRef.current[0]));
      }
    }, 500);
  };

  const handleSubmit = async (answer: Record<string, unknown>) => {
    game.submitAnswer();
    try {
      const res = await api.post(`/api/puzzles/${game.currentPuzzle?.id}/submit`, {
        roomId: id,
        answer: answer.answer ?? answer,
      });

      const { result, score } = res.data;
      const correct = result?.isCorrect ?? false;
      const message = result?.feedback || (correct ? 'Correct!' : 'Incorrect, try again.');

      if (correct) {
        playSFX('correct');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        playSFX('incorrect');
        setTriggerShake(true);
        setTimeout(() => setTriggerShake(false), 100);
      }

      game.showFeedback({
        correct,
        message,
        scoreBreakdown: correct ? {
          basePoints: score || 0,
          timeBonus: 0,
          accuracyPenalty: 0,
          hintPenalty: 0,
          streakMultiplier: game.currentStreak >= 3 ? 1.5 : 1,
          totalPoints: score || 0,
        } : null,
      });

      if (correct) {
        setTimeout(() => {
          game.completePuzzle();
          const nextIndex = game.currentPuzzleIndex + 1;
          if (nextIndex < game.totalPuzzles && puzzlesRef.current[nextIndex]) {
            game.startPuzzle(parsePuzzle(puzzlesRef.current[nextIndex]));
          } else {
            playSFX('victory');
          }
        }, 2000);
      } else {
        // After showing incorrect feedback, return to puzzle
        setTimeout(() => {
          game.startPuzzle(parsePuzzle(puzzlesRef.current[game.currentPuzzleIndex]));
        }, 2000);
      }
    } catch {
      playSFX('incorrect');
      game.showFeedback({ correct: false, message: 'Error submitting answer', scoreBreakdown: null });
      setTimeout(() => {
        game.startPuzzle(parsePuzzle(puzzlesRef.current[game.currentPuzzleIndex]));
      }, 2000);
    }
  };

  const handleHint = async () => {
    if (!game.currentPuzzle) return;
    const hints = game.currentPuzzle.hints || [];
    const hintIndex = game.hintsRevealed.length;
    if (hintIndex < hints.length) {
      playSFX('hint-reveal');
      game.revealHint(hints[hintIndex].text);
    }
  };

  const handleDebriefContinue = () => {
    navigate(`/rooms/${id}/results`);
  };

  if (game.phase === 'IDLE' || game.phase === 'LOADING') return <LoadingSpinner />;

  const puzzleContext = game.currentPuzzle
    ? getPuzzleContext(game.roomName, game.currentPuzzle.type)
    : null;

  return (
    <ScreenShake active={triggerShake}>
      <div className={`relative min-h-screen bg-gradient-to-b ${roomTheme.bgGradient}`}>
        {/* Atmospheric overlays */}
        {!reducedMotion && <ScanlineOverlay opacity={0.02} />}
        {!reducedMotion && <ParticleField count={20} color={roomTheme.particleColor} />}

        {/* Urgency effects */}
        {urgency.showVignette && (
          <Vignette
            intensity={urgency.vignetteIntensity}
            pulse={urgency.level === 'critical'}
          />
        )}
        <WarningFlash trigger={warningFlashTrigger} />

        {/* Confetti on correct answers */}
        <Confetti active={showConfetti} />

        {/* Main content */}
        <div className="relative z-10 flex flex-col gap-4 p-4">
          {game.phase !== 'BRIEFING' && (
            <GameHeader
              roomName={game.roomName}
              timeRemaining={game.timeRemaining}
              score={game.score}
              hintsUsed={game.hintsUsed}
              puzzleIndex={game.currentPuzzleIndex}
              totalPuzzles={game.totalPuzzles}
              currentStreak={game.currentStreak}
              urgencyLevel={urgency.level}
            />
          )}

          <AnimatePresence mode="wait">
            {game.phase === 'BRIEFING' && (
              <motion.div key="briefing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RoomIntro
                  roomName={game.roomName}
                  timeLimit={game.timeLimit}
                  onComplete={handleIntroComplete}
                />
              </motion.div>
            )}

            {game.phase === 'INTRO' && (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <h2 className="text-3xl font-bold text-cyber-primary">{game.roomName}</h2>
                <p className="mt-4 text-cyber-muted">Initializing puzzle...</p>
              </motion.div>
            )}

            {game.phase === 'PUZZLE_ACTIVE' && game.currentPuzzle && (
              <motion.div key={game.currentPuzzle.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                className={`grid grid-cols-1 gap-4 ${isMultiplayer ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}
              >
                <div className="lg:col-span-3">
                  <PuzzleContext context={puzzleContext} />
                  <PuzzleRenderer
                    puzzle={game.currentPuzzle}
                    onSubmit={handleSubmit}
                    roomTheme={roomTheme}
                  />
                </div>
                <div>
                  <HintPanel
                    hints={game.currentPuzzle.hints}
                    revealedHints={game.hintsRevealed}
                    onRequestHint={handleHint}
                  />
                </div>
                {isMultiplayer && (
                  <div className="space-y-4">
                    <VideoGrid roomId={teamId} />
                    <TextChat teamId={teamId} />
                  </div>
                )}
              </motion.div>
            )}

            {game.phase === 'DEBRIEF' && (
              <motion.div key="debrief" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RoomDebrief
                  roomName={game.roomName}
                  success={true}
                  score={game.score}
                  onContinue={handleDebriefContinue}
                />
              </motion.div>
            )}

            {(game.phase === 'ROOM_COMPLETE' || game.phase === 'ROOM_FAILED') && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <RoomDebrief
                  roomName={game.roomName}
                  success={game.phase === 'ROOM_COMPLETE'}
                  score={game.score}
                  onContinue={handleDebriefContinue}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {game.phase === 'PUZZLE_FEEDBACK' && (
            <FeedbackModal
              correct={game.feedbackCorrect}
              message={game.feedbackMessage}
              scoreBreakdown={game.lastScoreBreakdown}
              streak={game.currentStreak}
            />
          )}
        </div>
      </div>
    </ScreenShake>
  );
}
