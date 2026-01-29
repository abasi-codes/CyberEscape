import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  masterVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  muted: boolean;
  reducedMotion: boolean;
}

const STORAGE_KEY = 'cyberescape-settings';

function loadSettings(): Partial<SettingsState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function saveSettings(state: SettingsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const storedSettings = loadSettings();

const initialState: SettingsState = {
  masterVolume: storedSettings.masterVolume ?? 0.7,
  sfxVolume: storedSettings.sfxVolume ?? 0.8,
  ambientVolume: storedSettings.ambientVolume ?? 0.5,
  muted: storedSettings.muted ?? false,
  reducedMotion: storedSettings.reducedMotion ??
    (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) ?? false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setMasterVolume(state, action: PayloadAction<number>) {
      state.masterVolume = Math.max(0, Math.min(1, action.payload));
      saveSettings(state);
    },
    setSfxVolume(state, action: PayloadAction<number>) {
      state.sfxVolume = Math.max(0, Math.min(1, action.payload));
      saveSettings(state);
    },
    setAmbientVolume(state, action: PayloadAction<number>) {
      state.ambientVolume = Math.max(0, Math.min(1, action.payload));
      saveSettings(state);
    },
    toggleMute(state) {
      state.muted = !state.muted;
      saveSettings(state);
    },
    setMuted(state, action: PayloadAction<boolean>) {
      state.muted = action.payload;
      saveSettings(state);
    },
    setReducedMotion(state, action: PayloadAction<boolean>) {
      state.reducedMotion = action.payload;
      saveSettings(state);
    },
    resetSettings() {
      const defaultState: SettingsState = {
        masterVolume: 0.7,
        sfxVolume: 0.8,
        ambientVolume: 0.5,
        muted: false,
        reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
      };
      saveSettings(defaultState);
      return defaultState;
    },
  },
});

export const {
  setMasterVolume,
  setSfxVolume,
  setAmbientVolume,
  toggleMute,
  setMuted,
  setReducedMotion,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
