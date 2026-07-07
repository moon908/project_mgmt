'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid, Folder, MessageSquare, Calendar, BarChart3, Settings,
  Sun, Moon, Menu, ChevronLeft, ChevronRight, Timer, Sparkles, Bell,
  Hash, ShieldAlert, LogOut, ChevronDown, CheckSquare, Search
} from 'lucide-react';
import { useProjectFlowStore } from '@/store/projectStore';
import PomodoroTimer from './pomodoro';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser, projects, chatRooms, notifications,
    theme, setTheme, sidebarOpen, setSidebarOpen, chatMessages
  } = useProjectFlowStore();

  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Compute unread chat messages (or standard mock unreads)
  const unreadChats = chatRooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(path);
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { label: 'Projects', icon: Folder, path: '/dashboard/projects' },
    { label: 'Team Chat', icon: MessageSquare, path: '/dashboard/chat', badge: unreadChats },
    { label: 'Calendar', icon: Calendar, path: '/dashboard/calendar' },
    { label: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
    { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  const handleLogout = () => {
    // For demo/auth, reset route to landing
    router.push('/landing');
  };

  return (
    <>
      <aside
        className={`h-screen border-r border-border bg-card flex flex-col transition-all duration-300 relative z-30 ${sidebarOpen ? 'w-64' : 'w-20'
          }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full border border-border bg-card hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer z-40"
        >
          {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Brand / Logo */}
        <div className="h-16 px-6 border-b border-border flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-brand-400">
              ProjectFlow AI
            </span>
          )}
        </div>

        {/* Workspace Dropdown */}
        {sidebarOpen ? (
          <div className="p-4">
            <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/60 flex items-center justify-between hover:bg-secondary/70 transition-all cursor-pointer">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-md bg-purple-900/30 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-purple-400">PF</span>
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-xs font-semibold truncate leading-tight">My Workspace</span>
                  <span className="text-[9px] text-muted-foreground">Free Tier</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>
        ) : (
          <div className="py-4 flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-purple-900/30 border border-purple-500/30 flex items-center justify-center cursor-pointer hover:bg-purple-900/50">
              <span className="text-xs font-bold text-purple-400">PF</span>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 px-3 space-y-1 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium transition-all group relative cursor-pointer ${active
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-primary' : ''}`} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}

                {/* Badge alert */}
                {item.badge && item.badge > 0 ? (
                  <span className={`absolute ${sidebarOpen ? 'right-3' : 'right-1.5 top-1.5'} w-5 h-5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center animate-pulse`}>
                    {item.badge}
                  </span>
                ) : null}

                {/* Collapsed Tooltip */}
                {!sidebarOpen && (
                  <div className="absolute left-16 bg-card border border-border py-1 px-2.5 rounded-md text-xs font-semibold shadow-xl opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all pointer-events-none z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}

          <div className="h-px bg-border my-4" />

          {/* Quick Actions (Pomodoro) */}
          <button
            onClick={() => setShowPomodoro(!showPomodoro)}
            className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium transition-all group relative cursor-pointer ${showPomodoro
              ? 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
          >
            <Timer className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${showPomodoro ? 'text-amber-500' : ''}`} />
            {sidebarOpen && <span>Focus Timer</span>}
            {!sidebarOpen && (
              <div className="absolute left-16 bg-card border border-border py-1 px-2.5 rounded-md text-xs font-semibold shadow-xl opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all pointer-events-none z-50 whitespace-nowrap">
                Focus Timer
              </div>
            )}
          </button>
        </nav>

        {/* Footer Settings & Theme & Profile */}
        <div className="p-3 border-t border-border flex flex-col gap-2">
          {/* Theme & Notifications actions */}
          <div className={`flex items-center gap-1 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {sidebarOpen && (
              <Link
                href="/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  // Simulate open command palette
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-[10px] font-mono text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all cursor-pointer"
              >
                <Search className="w-3 h-3" />
                <span>Ctrl K</span>
              </Link>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-full flex items-center gap-3 p-1.5 rounded-lg hover:bg-secondary transition-colors text-left overflow-hidden cursor-pointer"
            >
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-primary/20 object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-card" />
              </div>
              {sidebarOpen && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold truncate leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate capitalize">{currentUser.role.toLowerCase()}</span>
                </div>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className={`absolute bottom-12 ${sidebarOpen ? 'left-0 w-full' : 'left-12 w-48'} bg-card border border-border p-1.5 rounded-xl shadow-2xl z-50`}>
                <div className="px-2.5 py-1.5 border-b border-border/60 mb-1">
                  <p className="text-[10px] text-muted-foreground leading-none">Signed in as</p>
                  <p className="text-xs font-bold truncate mt-1">{currentUser.email}</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-destructive/10 text-red-500 hover:text-red-400 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Floating/Drawer Pomodoro Panel */}
      {showPomodoro && (
        <div className="fixed bottom-6 left-24 z-50 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <PomodoroTimer onClose={() => setShowPomodoro(false)} />
        </div>
      )}
    </>
  );
}
