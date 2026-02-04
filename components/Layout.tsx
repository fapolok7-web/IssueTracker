
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Calendar,
  BarChart3,
  Clock,
  History,
  Menu,
  X,
  Sun,
  Moon,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { type: 'divider', label: 'Issues' },
    { path: '/issue-entry', icon: PlusCircle, label: 'Issue Entry' },
    { path: '/issue-reports', icon: FileText, label: 'Issue Reports' },
    { type: 'divider', label: 'Monitoring' },
    { path: '/uptime-monitoring', icon: ShieldCheck, label: 'Uptime Monitoring' },
    { type: 'divider', label: 'Monthly Tracking' },
    { path: '/monthly-entry', icon: Calendar, label: 'Monthly Entry' },
    { path: '/monthly-reports', icon: BarChart3, label: 'Monthly Reports' },
    { type: 'divider', label: 'Infrastructure' },
    { path: '/downtime-entry', icon: Clock, label: 'Downtime Entry' },
    { path: '/downtime-reports', icon: History, label: 'Downtime Reports' },
    { type: 'divider', label: 'Config' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6">
            <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Issue Tracker</h1>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest leading-none">INOVACE</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item, index) => {
              if (item.type === 'divider') {
                return (
                  <div key={`divider-${index}`} className="px-3 pt-6 pb-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                );
              }

              const Icon = item.icon!;

              return (
                <NavLink
                  key={item.path}
                  to={item.path!}
                  className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : ''} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User & Theme */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isDarkMode ? 'left-4.5' : 'left-0.5'}`} />
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 lg:hidden"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {navItems.find(i => i.path === location.pathname)?.label || 'Issue Tracker'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Removed System Online and Avatar */}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;