import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIState {
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  activeModal: string | null;
  toasts: Toast[];
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'dark',
  activeModal: null,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen; },
    setTheme(state, action: PayloadAction<'dark' | 'light'>) { state.theme = action.payload; },
    openModal(state, action: PayloadAction<string>) { state.activeModal = action.payload; },
    closeModal(state) { state.activeModal = null; },
    addToast(state, action: PayloadAction<Toast>) { state.toasts.push(action.payload); },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
  },
});

export const { toggleSidebar, setTheme, openModal, closeModal, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
