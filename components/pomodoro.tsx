'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, X } from 'lucide-react';

export default function PomodoroTimer({ onClose }: { onClose?: () => void }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');

  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            setIsActive(false);
            playCompletionSound();
            // Auto switch modes
            if (mode === 'focus') {
              setMode('short_break');
              setMinutes(5);
            } else {
              setMode('focus');
              setMinutes(25);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, mode]);

  const playCompletionSound = () => {
    // Standard visual feedback since Audio objects might fail in sandboxes or headless browsers
    if (typeof window !== 'undefined') {
      alert(`Pomodoro Session Complete! Time for a ${mode === 'focus' ? 'short break' : 'focus session'}.`);
    }
  };

  const toggle = () => setIsActive(!isActive);

  const reset = () => {
    setIsActive(false);
    setSeconds(0);
    if (mode === 'focus') setMinutes(25);
    else if (mode === 'short_break') setMinutes(5);
    else setMinutes(15);
  };

  const changeMode = (newMode: typeof mode) => {
    setIsActive(false);
    setMode(newMode);
    setSeconds(0);
    if (newMode === 'focus') setMinutes(25);
    else if (newMode === 'short_break') setMinutes(5);
    else setMinutes(15);
  };

  return (
    <div className="p-4 rounded-xl glass border border-border flex flex-col gap-3 relative shadow-2xl max-w-sm">
      {onClose && (
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      <div className="flex items-center gap-2 text-primary font-medium text-sm">
        <Timer className="w-4 h-4" />
        <span>Focus Mode (Pomodoro)</span>
      </div>

      <div className="flex justify-between items-center gap-1 bg-secondary/50 p-1 rounded-lg">
        <button 
          onClick={() => changeMode('focus')}
          className={`flex-1 text-xs py-1 px-2 rounded-md font-medium transition-all ${
            mode === 'focus' 
              ? 'bg-primary text-white shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Focus (25m)
        </button>
        <button 
          onClick={() => changeMode('short_break')}
          className={`flex-1 text-xs py-1 px-2 rounded-md font-medium transition-all ${
            mode === 'short_break' 
              ? 'bg-primary text-white shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Short Break
        </button>
        <button 
          onClick={() => changeMode('long_break')}
          className={`flex-1 text-xs py-1 px-2 rounded-md font-medium transition-all ${
            mode === 'long_break' 
              ? 'bg-primary text-white shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Long Break
        </button>
      </div>

      <div className="flex flex-col items-center py-4 bg-secondary/20 rounded-xl border border-border/40">
        <div className="text-4xl font-mono font-bold tracking-wider mb-2">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-xs text-muted-foreground capitalize flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
          {mode.replace('_', ' ')}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={toggle}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg font-medium text-sm transition-all cursor-pointer ${
            isActive 
              ? 'bg-amber-600 hover:bg-amber-500 text-white' 
              : 'bg-primary hover:bg-primary/95 text-white'
          }`}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isActive ? 'Pause' : 'Start Focus'}
        </button>
        <button
          onClick={reset}
          className="flex items-center justify-center p-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
