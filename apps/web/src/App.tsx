import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const SSOCallback = lazy(() => import('./features/auth/SSOCallback'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const GameCanvas = lazy(() => import('./features/game/GameCanvas'));
const ResultsScreen = lazy(() => import('./features/game/components/ResultsScreen'));
const TeamLobby = lazy(() => import('./features/multiplayer/components/TeamLobby'));
const AchievementsPage = lazy(() => import('./features/gamification/AchievementsPage'));
const LeaderboardPage = lazy(() => import('./features/gamification/LeaderboardPage'));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'));
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./features/admin/UserManagement'));
const UserDetail = lazy(() => import('./features/admin/UserDetail'));
const GroupManagement = lazy(() => import('./features/admin/GroupManagement'));
const AnalyticsPage = lazy(() => import('./features/admin/AnalyticsPage'));
const ReportsPage = lazy(() => import('./features/admin/ReportsPage'));
const CampaignManagement = lazy(() => import('./features/admin/CampaignManagement'));
const OrgSettings = lazy(() => import('./features/admin/OrgSettings'));
const AdminLayout = lazy(() => import('./features/admin/AdminLayout'));

const fallback = <LoadingSpinner />;

export default function App() {
  return (
    <Suspense fallback={fallback}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<SSOCallback />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/rooms/:id" element={<GameCanvas />} />
            <Route path="/rooms/:id/results" element={<ResultsScreen />} />
            <Route path="/team/lobby/:id" element={<TeamLobby />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="groups" element={<GroupManagement />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="campaigns" element={<CampaignManagement />} />
              <Route path="settings" element={<OrgSettings />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
