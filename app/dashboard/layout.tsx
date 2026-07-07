'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/sidebar';
import CommandPalette from '@/components/command-palette';
import { useProjectFlowStore } from '@/store/projectStore';
import { Bell, Search, Sparkles, Check, CheckSquare, Trash2, Sun, Moon } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { 
    notifications, markAllNotificationsRead, clearNotifications,
    sidebarOpen, chatRooms, theme, setTheme 
  } = useProjectFlowStore();

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggleNotifications = () => setShowNotifications(!showNotifications);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold tracking-tight capitalize">
              Workspace Overview
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Clickable search triggers command palette */}
            <button
              onClick={() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/80 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all w-48 text-left cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search workspace...</span>
              <span className="ml-auto text-[9px] border border-border bg-card px-1 py-0.5 rounded font-mono">Ctrl K</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary relative transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-500 hover:text-amber-400 transition-colors" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-indigo-400 hover:text-indigo-300 transition-colors" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={handleToggleNotifications}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary relative transition-colors cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-border/80 flex items-center justify-between bg-secondary/30">
                    <span className="text-xs font-bold">Notifications</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={markAllNotificationsRead}
                        className="text-[10px] text-primary hover:text-primary/80 font-medium cursor-pointer"
                      >
                        Mark all read
                      </button>
                      <span className="text-muted-foreground/30 text-xs">|</span>
                      <button 
                        onClick={clearNotifications}
                        className="text-[10px] text-red-500 hover:text-red-400 font-medium cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto divide-y divide-border/60">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                        <CheckSquare className="w-6 h-6 text-muted-foreground/45" />
                        <span>All caught up! No notifications.</span>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-3 text-xs flex flex-col gap-1 transition-all ${
                            n.isRead ? 'opacity-75 bg-transparent' : 'bg-primary/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground capitalize flex items-center gap-1">
                              {n.type === 'task_assigned' && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />}
                              {n.type === 'mention' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                              {n.type === 'deadline' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                              {n.type === 'comment' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                              {n.title}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-normal">{n.message}</p>
                          {(n.projectId || n.taskId) && (
                            <Link
                              href={`/dashboard/projects/${n.projectId || 'p-1'}${n.taskId ? `?taskId=${n.taskId}` : ''}`}
                              onClick={() => setShowNotifications(false)}
                              className="text-[10px] text-primary hover:underline mt-1 font-medium"
                            >
                              View details
                            </Link>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>

      {/* Command Palette Overlay */}
      <CommandPalette />
    </div>
  );
}
