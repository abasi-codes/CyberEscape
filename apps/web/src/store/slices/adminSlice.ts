import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

interface OrgStats {
  totalUsers: number;
  activeUsers: number;
  completionRate: number;
  avgScore: number;
  activeCampaigns: number;
  readinessScore: number;
}

interface AdminAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  acknowledged: boolean;
  createdAt: string;
}

interface AdminState {
  orgStats: OrgStats | null;
  users: any[];
  totalUsers: number;
  alerts: AdminAlert[];
  loading: boolean;
}

const initialState: AdminState = {
  orgStats: null,
  users: [],
  totalUsers: 0,
  alerts: [],
  loading: false,
};

export const fetchOrgStats = createAsyncThunk('admin/fetchOrgStats', async () => {
  const res = await api.get('/api/v1/admin/stats/overview');
  return res.data;
});

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params: { page?: number; search?: string }) => {
    const res = await api.get('/api/v1/users', { params });
    return res.data;
  },
);

export const fetchAlerts = createAsyncThunk('admin/fetchAlerts', async () => {
  const res = await api.get('/api/v1/admin/alerts');
  return res.data;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    acknowledgeAlert(state, action) {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) alert.acknowledged = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrgStats.fulfilled, (state, action) => { state.orgStats = action.payload; })
      .addCase(fetchUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.totalUsers = action.payload.total;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => { state.alerts = action.payload; });
  },
});

export const { acknowledgeAlert } = adminSlice.actions;
export default adminSlice.reducer;
