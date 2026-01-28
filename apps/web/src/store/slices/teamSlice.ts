import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TeamMember {
  userId: string;
  name: string;
  role?: string;
  ready: boolean;
  isHost: boolean;
}

interface TeamState {
  teamId: string | null;
  name: string;
  joinCode: string;
  roomId: string | null;
  members: TeamMember[];
  status: 'LOBBY' | 'READY' | 'IN_GAME' | 'FINISHED' | 'DISBANDED';
  currentUserId: string | null;
}

const initialState: TeamState = {
  teamId: null,
  name: '',
  joinCode: '',
  roomId: null,
  members: [],
  status: 'LOBBY',
  currentUserId: null,
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setTeam(state, action: PayloadAction<{ teamId: string; name: string; joinCode: string; roomId: string }>) {
      Object.assign(state, action.payload);
      state.status = 'LOBBY';
    },
    addMember(state, action: PayloadAction<TeamMember>) {
      if (!state.members.find(m => m.userId === action.payload.userId)) {
        state.members.push(action.payload);
      }
    },
    removeMember(state, action: PayloadAction<string>) {
      state.members = state.members.filter(m => m.userId !== action.payload);
    },
    setMemberReady(state, action: PayloadAction<{ userId: string; ready: boolean }>) {
      const member = state.members.find(m => m.userId === action.payload.userId);
      if (member) member.ready = action.payload.ready;
    },
    assignRole(state, action: PayloadAction<{ userId: string; role: string }>) {
      const member = state.members.find(m => m.userId === action.payload.userId);
      if (member) member.role = action.payload.role;
    },
    setStatus(state, action: PayloadAction<TeamState['status']>) {
      state.status = action.payload;
    },
    setCurrentUserId(state, action: PayloadAction<string>) {
      state.currentUserId = action.payload;
    },
    leaveTeam() { return initialState; },
  },
});

export const { setTeam, addMember, removeMember, setMemberReady, assignRole, setStatus, setCurrentUserId, leaveTeam } = teamSlice.actions;
export default teamSlice.reducer;
