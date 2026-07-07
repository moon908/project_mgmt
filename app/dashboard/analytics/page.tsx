'use client';

import React from 'react';
import { useProjectFlowStore } from '@/store/projectStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';
import { 
  Sparkles, FileText, Download, TrendingUp, CheckSquare, 
  Clock, Activity, Award, Briefcase, BarChart2 
} from 'lucide-react';

export default function AnalyticsPage() {
  const { projects, tasks, users } = useProjectFlowStore();

  // Metrics calculation
  const totalTasksCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const remainingCount = totalTasksCount - completedCount;
  const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const completedStoryPoints = tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  // Burndown Chart Data (Ideal vs Actual story points over a 10-day sprint)
  const burndownData = [
    { day: 'Day 1', Ideal: 45, Actual: 45 },
    { day: 'Day 2', Ideal: 40, Actual: 43 },
    { day: 'Day 3', Ideal: 35, Actual: 39 },
    { day: 'Day 4', Ideal: 30, Actual: 35 },
    { day: 'Day 5', Ideal: 25, Actual: 30 },
    { day: 'Day 6', Ideal: 20, Actual: 25 },
    { day: 'Day 7', Ideal: 15, Actual: 18 },
    { day: 'Day 8', Ideal: 10, Actual: 12 },
    { day: 'Day 9', Ideal: 5, Actual: 5 },
    { day: 'Day 10', Ideal: 0, Actual: 0 },
  ];

  // Velocity Chart Data (Story points completed per sprint)
  const velocityData = [
    { name: 'Sprint 1', planned: 30, completed: 28 },
    { name: 'Sprint 2', planned: 40, completed: 38 },
    { name: 'Sprint 3', planned: 35, completed: 35 },
    { name: 'Sprint 4', planned: 45, completed: 42 }, // Current Active Sprint
  ];

  // Task Status distribution Pie Chart
  const statusData = [
    { name: 'Backlog', value: tasks.filter(t => t.status === 'backlog').length, color: '#4b5563' },
    { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length, color: '#6366f1' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#f59e0b' },
    { name: 'Review/Test', value: tasks.filter(t => t.status === 'review' || t.status === 'testing').length, color: '#ec4899' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
  ].filter(d => d.value > 0);

  // CSV Exporter Action: Trigger client side file download
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Task ID,Task Title,Status,Priority,Story Points,Due Date,Assignee\n';

    tasks.forEach(t => {
      const assigneeName = t.assignee ? t.assignee.name : 'Unassigned';
      const row = `"${t.id}","${t.title.replace(/"/g, '""')}","${t.status}","${t.priority}","${t.storyPoints || 0}","${t.dueDate || 'N/A'}","${assigneeName}"`;
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ProjectFlow_Sprints_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* Title Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Advanced Workspace Reports</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Verify overall velocities, sprint remaining burndowns, and task distribution ratios.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/95 transition-all shadow-md cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            Export Sprint CSV
          </button>
          <button
            onClick={() => alert("Mock PDF report compile triggered. Downloading file shortly...")}
            className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border border-border bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition-all cursor-pointer shrink-0"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/20 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Story Points Velocity</p>
            <h3 className="text-lg font-bold">{completedStoryPoints} / {totalStoryPoints} pts</h3>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/20 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><CheckSquare className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Completed Tasks</p>
            <h3 className="text-lg font-bold">{completedCount} resolved</h3>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/20 flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Clock className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Remaining Work</p>
            <h3 className="text-lg font-bold">{remainingCount} cards left</h3>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/20 flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Award className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Team Active Developers</p>
            <h3 className="text-lg font-bold">{users.filter(u => u.role === 'DEVELOPER').length} members</h3>
          </div>
        </div>
      </div>

      {/* Main Charts Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sprint Burndown chart */}
        <div className="p-5 rounded-2xl glass border border-border space-y-4">
          <div>
            <h3 className="text-sm font-bold">Sprint Burndown Chart</h3>
            <p className="text-[10px] text-muted-foreground">Ideal remaining story points vs actual remaining points</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burndownData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="day" stroke="#555" fontSize={10} tickLine={false} />
                <YAxis stroke="#555" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121215', border: '1px solid #222', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="Ideal" stroke="#71717a" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Ideal Burndown" />
                <Line type="monotone" dataKey="Actual" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3 }} name="Actual Remaining" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Velocity Chart */}
        <div className="p-5 rounded-2xl glass border border-border space-y-4">
          <div>
            <h3 className="text-sm font-bold">Sprint Velocity History</h3>
            <p className="text-[10px] text-muted-foreground">Story points planned vs story points completed per sprint</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} />
                <YAxis stroke="#555" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121215', border: '1px solid #222', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="planned" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Planned Story Points" />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed Story Points" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="p-5 rounded-2xl glass border border-border space-y-4 lg:col-span-2">
          <div>
            <h3 className="text-sm font-bold">Sprint Task Status Allocations</h3>
            <p className="text-[10px] text-muted-foreground">Percentage of active workflow statuses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
            <div className="h-56 w-full md:col-span-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121215', border: '1px solid #222', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legends */}
            <div className="space-y-3">
              {statusData.map(entry => (
                <div key={entry.name} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name}</span>
                  </div>
                  <span className="text-muted-foreground">{entry.value} cards</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
