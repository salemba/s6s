import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GitBranch, Lock, FileText, Settings, LogOut } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: GitBranch, label: 'Workflows', path: '/workflows' },
    { icon: Lock, label: 'Credentials', path: '/credentials' },
    { icon: FileText, label: 'Logs', path: '/logs' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 h-screen bg-[#0d1117] border-r border-[#30363d] flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <img src="/s6s_icon.png" alt="S6S" className="w-8 h-8 rounded-lg" />
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">S6S</h1>
            <p className="text-[#8b949e] text-xs">Workflow Automation</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1f6feb] text-white'
                    : 'text-[#c9d1d9] hover:bg-[#161b22] hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-[#30363d]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-[#c9d1d9] hover:text-white text-sm font-medium transition-colors w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};
