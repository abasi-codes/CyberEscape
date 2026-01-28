import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FolderTree, BarChart3, FileText, Megaphone, Settings } from 'lucide-react';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/groups', label: 'Groups', icon: FolderTree },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/reports', label: 'Reports', icon: FileText },
  { path: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex gap-6">
      <aside className="hidden w-56 shrink-0 lg:block">
        <nav className="sticky top-24 space-y-1">
          {navItems.map(({ path, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === path : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? 'bg-cyber-primary/10 text-cyber-primary' : 'text-cyber-muted hover:bg-cyber-card hover:text-cyber-text'
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
