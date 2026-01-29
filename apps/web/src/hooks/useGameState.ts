import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import {
  startRoom, setBriefing, setIntro, startPuzzle, submitAnswer, showFeedback,
  completePuzzle, revealHint, tickTimer, failRoom, completeRoom,
  goToDebrief, resetGame,
} from '@/store/slices/gameSlice';

export function useGameState() {
  const dispatch = useDispatch<AppDispatch>();
  const game = useSelector((state: RootState) => state.game);

  return {
    ...game,
    startRoom: (data: Parameters<typeof startRoom>[0]) => dispatch(startRoom(data)),
    setBriefing: () => dispatch(setBriefing()),
    setIntro: () => dispatch(setIntro()),
    startPuzzle: (data: Parameters<typeof startPuzzle>[0]) => dispatch(startPuzzle(data)),
    submitAnswer: () => dispatch(submitAnswer()),
    showFeedback: (data: Parameters<typeof showFeedback>[0]) => dispatch(showFeedback(data)),
    completePuzzle: () => dispatch(completePuzzle()),
    revealHint: (hint: string) => dispatch(revealHint(hint)),
    tickTimer: () => dispatch(tickTimer()),
    failRoom: () => dispatch(failRoom()),
    completeRoom: () => dispatch(completeRoom()),
    goToDebrief: () => dispatch(goToDebrief()),
    resetGame: () => dispatch(resetGame()),
  };
}
