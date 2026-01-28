import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tier: string;
  earned: boolean;
  earnedAt?: string;
  secret: boolean;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  level: number;
}

interface GamificationState {
  totalXP: number;
  currentLevel: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  roomsCompleted: number;
  badges: Badge[];
  leaderboard: LeaderboardEntry[];
  leaderboardPeriod: 'daily' | 'weekly' | 'alltime';
  loading: boolean;
}

const initialState: GamificationState = {
  totalXP: 0,
  currentLevel: 1,
  totalPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  roomsCompleted: 0,
  badges: [],
  leaderboard: [],
  leaderboardPeriod: 'alltime',
  loading: false,
};

export const fetchProgress = createAsyncThunk('gamification/fetchProgress', async () => {
  const res = await api.get('/api/v1/gamification/progress');
  return res.data;
});

export const fetchBadges = createAsyncThunk('gamification/fetchBadges', async () => {
  const res = await api.get('/api/v1/gamification/badges');
  return res.data;
});

export const fetchLeaderboard = createAsyncThunk(
  'gamification/fetchLeaderboard',
  async (period: string) => {
    const res = await api.get(`/api/v1/gamification/leaderboard?period=${period}`);
    return res.data;
  },
);

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    addPoints(state, action: PayloadAction<number>) {
      state.totalPoints += action.payload;
      state.totalXP += action.payload;
      state.currentLevel = Math.floor(state.totalXP / 500) + 1;
    },
    incrementStreak(state) { state.currentStreak += 1; if (state.currentStreak > state.longestStreak) state.longestStreak = state.currentStreak; },
    resetStreak(state) { state.currentStreak = 0; },
    setLeaderboardPeriod(state, action: PayloadAction<'daily' | 'weekly' | 'alltime'>) {
      state.leaderboardPeriod = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgress.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(fetchBadges.fulfilled, (state, action) => {
        state.badges = action.payload;
      })
      .addCase(fetchLeaderboard.pending, (state) => { state.loading = true; })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = action.payload;
      });
  },
});

export const { addPoints, incrementStreak, resetStreak, setLeaderboardPeriod } = gamificationSlice.actions;
export default gamificationSlice.reducer;
