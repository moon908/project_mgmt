'use client';

import React, { useState } from 'react';
import { useProjectFlowStore } from '@/store/projectStore';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, 
  MapPin, Clock, X, Info, Sparkles, AlertCircle 
} from 'lucide-react';
import { CalendarEvent } from '@/types';

export default function CalendarPage() {
  const { calendarEvents, users, projects } = useProjectFlowStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<'all' | 'task' | 'meeting' | 'milestone'>('all');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Modal event creator state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventType, setNewEventType] = useState<'task' | 'meeting' | 'milestone'>('meeting');
  const [newEventDesc, setNewEventDesc] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get days in month
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  // Get first day of month (0-6)
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Generate calendar grid array
  const gridCells: (number | null)[] = [];
  // Pad beginning with nulls for first week offset
  for (let i = 0; i < firstDayIndex; i++) {
    gridCells.push(null);
  }
  // Add days
  for (let i = 1; i <= daysInMonth; i++) {
    gridCells.push(i);
  }
  // Pad end to make full weeks
  while (gridCells.length % 7 !== 0) {
    gridCells.push(null);
  }

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const clickedDate = new Date(year, month, day);
    const dateStr = clickedDate.toISOString().split('T')[0];
    setNewEventDate(dateStr);
    setShowCreateModal(true);
  };

  // Filter events
  const filteredEvents = calendarEvents.filter(e => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  // Get events on a specific day
  const getEventsForDay = (day: number) => {
    return filteredEvents.filter(e => {
      const eventDate = new Date(e.start);
      return eventDate.getFullYear() === year &&
             eventDate.getMonth() === month &&
             eventDate.getDate() === day;
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Interactive Calendar</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Keep track of team milestones, Zoom meetings, and task deadlines.</p>
        </div>
        <button
          onClick={() => {
            setNewEventDate(new Date().toISOString().split('T')[0]);
            setShowCreateModal(true);
          }}
          className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/95 transition-all shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Schedule Event
        </button>
      </div>

      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-card/40 border border-border p-4 rounded-xl">
        <div className="flex items-center gap-3 justify-between sm:justify-start">
          <h2 className="text-sm font-bold text-foreground min-w-36">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-1">
            <button 
              onClick={prevMonth}
              className="p-1.5 rounded bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextMonth}
              className="p-1.5 rounded bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {(['all', 'task', 'meeting', 'milestone'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`py-1 px-3.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-primary text-white shadow-sm'
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {type}s
            </button>
          ))}
        </div>
      </div>

      {/* Month Grid */}
      <div className="border border-border rounded-2xl overflow-hidden bg-card/25 shadow-sm">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-border bg-secondary/10 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2 shrink-0">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar days cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border/60 bg-transparent min-h-[480px]">
          {gridCells.map((day, idx) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const isToday = day && 
                            new Date().getDate() === day && 
                            new Date().getMonth() === month && 
                            new Date().getFullYear() === year;

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(day)}
                className={`p-2 flex flex-col justify-between group min-h-[80px] hover:bg-secondary/10 transition-colors relative cursor-pointer ${
                  day ? 'bg-transparent' : 'bg-secondary/5 pointer-events-none'
                }`}
              >
                {/* Day number */}
                {day && (
                  <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mt-1 ml-1 ${
                    isToday ? 'bg-primary text-white font-bold shadow-md shadow-primary/20' : 'text-muted-foreground group-hover:text-foreground'
                  }`}>
                    {day}
                  </span>
                )}

                {/* Day events tags */}
                <div className="flex-1 mt-2.5 space-y-1 overflow-y-auto max-h-[90px] scrollbar-none">
                  {dayEvents.map(event => (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      className={`w-full text-[9px] font-bold text-left px-1.5 py-0.5 rounded truncate border flex items-center gap-1 ${
                        event.type === 'meeting' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        event.type === 'milestone' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        event.type === 'meeting' ? 'bg-blue-400' :
                        event.type === 'milestone' ? 'bg-red-400' : 'bg-purple-400'
                      }`} />
                      <span className="truncate">{event.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL OVERLAY: EVENT DETAILS VIEW */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm glass-premium border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col text-foreground">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/15">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                selectedEvent.type === 'meeting' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                selectedEvent.type === 'milestone' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                'bg-purple-500/10 text-purple-400 border-purple-500/20'
              }`}>
                {selectedEvent.type}
              </span>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <h3 className="text-sm font-bold">{selectedEvent.title}</h3>
                {selectedEvent.description && (
                  <p className="text-muted-foreground leading-relaxed mt-1">{selectedEvent.description}</p>
                )}
              </div>

              <div className="space-y-2 border-t border-border/60 pt-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Time: {new Date(selectedEvent.start).toLocaleString()}</span>
                </div>
                {selectedEvent.projectId && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Info className="w-4 h-4 text-primary" />
                    <span>Project: ProjectFlow Workspace</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-2 border-t border-border/60">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="py-1.5 px-4 rounded bg-secondary hover:bg-secondary/80 border border-border font-semibold cursor-pointer"
                >
                  Close details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL OVERLAY: EVENT SCHEDULER CREATOR */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm glass-premium border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col text-foreground">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/15 shrink-0">
              <span className="font-semibold text-xs text-primary flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                Schedule Event
              </span>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded hover:bg-secondary text-muted-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Event Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. API Architecture Standup"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full p-2 bg-secondary border border-border rounded"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Date</label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full p-2 bg-secondary border border-border rounded text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Type</label>
                <select
                  value={newEventType}
                  onChange={(e: any) => setNewEventType(e.target.value)}
                  className="w-full p-2 bg-secondary border border-border rounded text-foreground"
                >
                  <option value="meeting">Meeting</option>
                  <option value="milestone">Milestone</option>
                  <option value="task">Task Deadline</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details/Zoom Link..."
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  className="w-full p-2 bg-secondary border border-border rounded resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-border/60">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="py-1.5 px-3 rounded bg-secondary hover:bg-secondary/80 border border-border font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newEventTitle.trim()) return;
                    // Append event in-memory simulator or pop up
                    alert(`Scheduled event "${newEventTitle}" successfully!`);
                    setShowCreateModal(false);
                    setNewEventTitle('');
                    setNewEventDesc('');
                  }}
                  className="py-1.5 px-4 rounded bg-primary text-white font-bold hover:bg-primary/95"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
