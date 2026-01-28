import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Shield, LayoutDashboard, Trophy, Medal, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './ui/DropdownMenu';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/achievements', label: 'Achievements', icon: Trophy },
  { path: '/leaderboard', label: 'Leaderboard', icon: Medal },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'ORG_ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-cyber-bg">
      <header className="sticky top-0 z-40 border-b border-cyber-border bg-cyber-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-cyber-primary">
            <Shield className="h-6 w-6" />
            <span className="text-lg font-bold">CyberSafe Escape</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  location.pathname === path
                    ? 'bg-cyber-primary/10 text-cyber-primary'
                    : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-card'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-cyber-primary/10 text-cyber-primary'
                    : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-card'
                }`}
              >
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-cyber-card">
              <Avatar fallback={user?.name?.charAt(0) || 'U'} className="h-8 w-8" />
              <span className="hidden sm:inline text-sm text-cyber-text">{user?.name}</span>
              <ChevronDown className="h-4 w-4 text-cyber-muted" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2"><User className="h-4 w-4" />Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-cyber-danger flex items-center gap-2">
                <LogOut className="h-4 w-4" />Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
