'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Folder, CheckSquare, MessageSquare, Terminal, Lightbulb, X, Sparkles } from 'lucide-react';
import { useProjectFlowStore } from '@/store/projectStore';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const { projects, tasks, setTheme, theme, logActivity } = useProjectFlowStore();

  // Listen to keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter commands, projects, and tasks
  const commands = [
    { id: 't-theme', title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, category: 'Actions', icon: Terminal, action: () => { setTheme(theme === 'dark' ? 'light' : 'dark'); setIsOpen(false); } },
    { id: 't-chat', title: 'Open Team Chat', category: 'Navigation', icon: MessageSquare, action: () => { router.push('/dashboard/chat'); setIsOpen(false); } },
    { id: 't-create-p', title: 'Create New Project', category: 'Actions', icon: Folder, action: () => { router.push('/dashboard/projects?create=true'); setIsOpen(false); } },
  ];

  const filteredProjects = projects
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .map((p) => ({
      id: p.id,
      title: p.name,
      category: 'Projects',
      icon: Folder,
      action: () => {
        router.push(`/dashboard/projects/${p.id}`);
        setIsOpen(false);
      },
    }));

  const filteredTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .map((t) => ({
      id: t.id,
      title: t.title,
      category: 'Tasks',
      icon: CheckSquare,
      action: () => {
        router.push(`/dashboard/projects/${t.projectId}?taskId=${t.id}`);
        setIsOpen(false);
      },
    }));

  const allItems = [...commands, ...filteredProjects, ...filteredTasks].slice(0, 10);

  // Handle arrow navigations
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
      <div 
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className="w-full max-w-xl glass-premium border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col text-foreground"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 border-b border-border/80 h-12 shrink-0">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            placeholder="Search projects, tasks, or actions... (Esc to close)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground py-2"
          />
          <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded-md font-mono text-muted-foreground shrink-0">ESC</span>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto max-h-[350px] p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Lightbulb className="w-8 h-8 text-muted-foreground mb-2 animate-bounce" />
              <p className="text-sm font-medium">No results found for &quot;{search}&quot;</p>
              <p className="text-xs text-muted-foreground mt-1">Try typing a task title or &quot;mode&quot;</p>
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-primary text-white shadow-md' 
                      : 'hover:bg-secondary/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-primary'}`} />
                    <span className="font-medium truncate">{item.title}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="border-t border-border/80 h-10 px-4 flex items-center justify-between bg-secondary/20 text-[10px] text-muted-foreground font-mono shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="border border-border bg-card px-1 rounded-sm">↑↓</span> Navigate</span>
            <span className="flex items-center gap-1"><span className="border border-border bg-card px-1 rounded-sm">Enter</span> Select</span>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>ProjectFlow Intelligent Bar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
