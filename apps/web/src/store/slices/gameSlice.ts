import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type GamePhase = 'IDLE' | 'LOADING' | 'BRIEFING' | 'INTRO' | 'PUZZLE_ACTIVE' | 'PUZZLE_FEEDBACK' | 'ROOM_COMPLETE' | 'ROOM_FAILED' | 'DEBRIEF';

interface PuzzleState {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  hints: { index: number; text: string; cost: number }[];
  points: number;
}

interface GameState {
  roomId: string | null;
  roomName: string;
  roomType: string;
  phase: GamePhase;
  currentPuzzle: PuzzleState | null;
  currentPuzzleIndex: number;
  totalPuzzles: number;
  score: number;
  hintsUsed: number;
  hintsRevealed: string[];
  attempts: number;
  timeRemaining: number;
  timeLimit: number;
  completedPuzzleIds: string[];
  feedbackMessage: string;
  feedbackCorrect: boolean;
  currentStreak: number;
  bestStreak: number;
  lastScoreBreakdown: {
    basePoints: number;
    timeBonus: number;
    accuracyPenalty: number;
    hintPenalty: number;
    streakMultiplier: number;
    totalPoints: number;
  } | null;
}

const initialState: GameState = {
  roomId: null,
  roomName: '',
  roomType: 'default',
  phase: 'IDLE',
  currentPuzzle: null,
  currentPuzzleIndex: 0,
  totalPuzzles: 0,
  score: 0,
  hintsUsed: 0,
  hintsRevealed: [],
  attempts: 0,
  timeRemaining: 0,
  timeLimit: 0,
  completedPuzzleIds: [],
  feedbackMessage: '',
  feedbackCorrect: false,
  currentStreak: 0,
  bestStreak: 0,
  lastScoreBreakdown: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startRoom(state, action: PayloadAction<{ roomId: string; roomName: string; roomType?: string; timeLimit: number; totalPuzzles: number }>) {
      state.roomId = action.payload.roomId;
      state.roomName = action.payload.roomName;
      state.roomType = action.payload.roomType || 'default';
      state.timeLimit = action.payload.timeLimit;
      state.timeRemaining = action.payload.timeLimit;
      state.totalPuzzles = action.payload.totalPuzzles;
      state.phase = 'LOADING';
      state.score = 0;
      state.hintsUsed = 0;
      state.hintsRevealed = [];
      state.completedPuzzleIds = [];
      state.currentPuzzleIndex = 0;
      state.currentStreak = 0;
      state.bestStreak = 0;
    },
    setBriefing(state) { state.phase = 'BRIEFING'; },
    setIntro(state) { state.phase = 'INTRO'; },
    startPuzzle(state, action: PayloadAction<PuzzleState>) {
      state.currentPuzzle = action.payload;
      state.phase = 'PUZZLE_ACTIVE';
      state.attempts = 0;
      state.hintsRevealed = [];
    },
    submitAnswer(state) { state.attempts += 1; },
    showFeedback(state, action: PayloadAction<{ correct: boolean; message: string; scoreBreakdown: GameState['lastScoreBreakdown'] }>) {
      state.phase = 'PUZZLE_FEEDBACK';
      state.feedbackCorrect = action.payload.correct;
      state.feedbackMessage = action.payload.message;
      state.lastScoreBreakdown = action.payload.scoreBreakdown;
      if (action.payload.correct) {
        state.currentStreak += 1;
        if (state.currentStreak > state.bestStreak) {
          state.bestStreak = state.currentStreak;
        }
        if (action.payload.scoreBreakdown) {
          state.score += action.payload.scoreBreakdown.totalPoints;
        }
      } else {
        state.currentStreak = 0;
      }
    },
    completePuzzle(state) {
      if (state.currentPuzzle) {
        state.completedPuzzleIds.push(state.currentPuzzle.id);
      }
      state.currentPuzzleIndex += 1;
      if (state.currentPuzzleIndex >= state.totalPuzzles) {
        state.phase = 'ROOM_COMPLETE';
      }
    },
    revealHint(state, action: PayloadAction<string>) {
      state.hintsRevealed.push(action.payload);
      state.hintsUsed += 1;
    },
    tickTimer(state) {
      if (state.timeRemaining > 0) state.timeRemaining -= 1;
      if (state.timeRemaining <= 0 && state.phase === 'PUZZLE_ACTIVE') {
        state.phase = 'ROOM_FAILED';
      }
    },
    failRoom(state) { state.phase = 'ROOM_FAILED'; },
    completeRoom(state) { state.phase = 'ROOM_COMPLETE'; },
    goToDebrief(state) { state.phase = 'DEBRIEF'; },
    resetGame() { return initialState; },
  },
});

export const {
  startRoom, setBriefing, setIntro, startPuzzle, submitAnswer, showFeedback,
  completePuzzle, revealHint, tickTimer, failRoom, completeRoom,
  goToDebrief, resetGame,
} = gameSlice.actions;
export default gameSlice.reducer;
