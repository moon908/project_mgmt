'use client';

import React from 'react';
import { useProjectFlowStore } from '@/store/projectStore';
import { 
  Sparkles, CheckCircle2, AlertCircle, Calendar, Users, 
  ArrowUpRight, Clock, ShieldAlert, ArrowRight, UserPlus, Check 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import Link from 'next/link';

export default function DashboardHome() {
  const { 
    projects, tasks, users, activityLogs, 
    currentUser, updateTask, logActivity 
  } = useProjectFlowStore();

  // Metrics Calculations
  const activeProjectsCount = projects.filter(p => p.status === 'active').length;
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Upcoming Deadlines (tasks due in next 7 days)
  const upcomingTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'completed') return false;
    const dueTime = new Date(t.dueDate).getTime();
    const nowTime = Date.now();
    const diffDays = (dueTime - nowTime) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  });

  // Recharts Chart Data: Weekly Progress
  const chartData = [
    { name: 'Mon', completed: 4, generated: 6 },
    { name: 'Tue', completed: 6, generated: 8 },
    { name: 'Wed', completed: 5, generated: 7 },
    { name: 'Thu', completed: 8, generated: 9 },
    { name: 'Fri', completed: 10, generated: 11 },
    { name: 'Sat', completed: 3, generated: 4 },
    { name: 'Sun', completed: 2, generated: 3 },
  ];

  // Recharts Chart Data: Workload per Member
  const workloadData = users.map(user => {
    const userTasks = tasks.filter(t => t.assignee?.id === user.id && t.status !== 'completed');
    return {
      name: user.name.split(' ')[0],
      tasks: userTasks.length,
      color: user.id === 'u-current' ? '#f06a6a' : '#06b6d4'
    };
  }).filter(w => w.tasks > 0);

  // AI Assistant Suggestions Action Handlers
  const handleAssignToAlex = () => {
    // Find task t-4 (AI API integration) and assign to Alex (u-2)
    const taskT4 = tasks.find(t => t.id === 't-4');
    const alexUser = users.find(u => u.id === 'u-2');
    if (taskT4 && alexUser) {
      const updated = { ...taskT4, assignee: alexUser };
      updateTask(updated);
      logActivity('assigned task to Alex Rivera:', taskT4.title, 'task', taskT4.projectId);
      alert(`Assigned "${taskT4.title}" to Alex Rivera successfully!`);
    } else {
      alert("AI Suggestion already processed or task not found.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass border border-border relative overflow-hidden bg-secondary/15">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="space-y-1 z-10">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Welcome back, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Here is a snapshot of your workspace analytics, team assignments, and AI recommendations.
          </p>
        </div>
        <div className="flex items-center gap-1.5 py-1 px-3 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-semibold w-fit shrink-0 z-10">
          <Sparkles className="w-3.5 h-3.5" />
          AI Engine Active
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <div className="p-4 rounded-xl glass border border-border flex flex-col justify-between h-28 hover:border-border/80 transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Active Projects</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{activeProjectsCount}</span>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center">
              +12% vs last month
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            3 projects total in workspace
          </div>
        </div>

        {/* Task Completion Rate */}
        <div className="p-4 rounded-xl glass border border-border flex flex-col justify-between h-28 hover:border-border/80 transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Task Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">{taskCompletionRate}%</span>
              <span className="text-[10px] text-muted-foreground font-semibold">
                {completedTasks}/{totalTasks} tasks
              </span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${taskCompletionRate}%` }} />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground">
            Confidence rate: High
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="p-4 rounded-xl glass border border-border flex flex-col justify-between h-28 hover:border-border/80 transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Critical Deadlines</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{upcomingTasks.length}</span>
            <span className="text-[10px] text-red-500 font-bold">
              Due within 7 days
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground truncate">
            {upcomingTasks[0] ? `Next: ${upcomingTasks[0].title}` : 'No critical tasks'}
          </div>
        </div>

        {/* Weekly Productivity */}
        <div className="p-4 rounded-xl glass border border-border flex flex-col justify-between h-28 hover:border-border/80 transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>Active Sprint Velocity</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">42</span>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Story Points complete
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            Target velocity: 50 pts/sprint
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & AI Suggestion Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Chart Panel */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass border border-border flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold">Velocity Chart (Weekly Progress)</h3>
              <p className="text-[10px] text-muted-foreground">Task generation vs task completion rates</p>
            </div>
            <span className="text-xs bg-secondary border border-border py-1 px-2.5 rounded-lg text-muted-foreground">This Week</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f06a6a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f06a6a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGenerated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} />
                <YAxis stroke="#555" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121215', border: '1px solid #222', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#aaa', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="completed" stroke="#f06a6a" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" name="Completed Tasks" />
                <Area type="monotone" dataKey="generated" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#colorGenerated)" strokeDasharray="4 4" name="New Tasks" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Suggestions Card Panel */}
        <div className="p-5 rounded-2xl glass border border-border flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-border/80 pb-3">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold">ProjectFlow AI Assistant</h3>
              <p className="text-[10px] text-muted-foreground">Workspace optimization triggers</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3 justify-center">
            {/* Suggestion 1: Assign unassigned task */}
            <div className="p-3.5 rounded-xl border border-border bg-secondary/10 flex flex-col gap-2 relative">
              <span className="absolute top-3 right-3 text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 font-bold py-0.5 px-1.5 rounded">High Priority</span>
              <p className="text-xs font-semibold pr-16 leading-tight">Unassigned Urgent Task</p>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Task &quot;OpenAI Workspace API&quot; is marked Urgent but has no assignee. Alex Rivera has 3 open hours.
              </p>
              <button
                onClick={handleAssignToAlex}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/95 transition-all shadow-md cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Assign to Alex Rivera
              </button>
            </div>

            {/* Suggestion 2: Sprint deadline check */}
            <div className="p-3.5 rounded-xl border border-border bg-secondary/10 flex flex-col gap-2">
              <p className="text-xs font-semibold leading-tight">Sprint Timeline Suggestion</p>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Project &quot;SaaS Launch&quot; is at 68% progress. At the current team velocity, you will complete the milestones 2 days ahead of due date.
              </p>
              <Link
                href="/dashboard/projects/p-1"
                className="mt-1 flex items-center justify-center gap-1 text-[11px] text-primary hover:underline font-semibold"
              >
                View Project Timeline
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Grid: Workload Charts & Recent Activities & Team list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Workload Distribution Chart */}
        <div className="p-5 rounded-2xl glass border border-border flex flex-col gap-3">
          <h3 className="text-sm font-bold">Team Workload Distribution</h3>
          <p className="text-[10px] text-muted-foreground mb-2">Uncompleted tasks per workspace member</p>
          
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                <XAxis type="number" stroke="#555" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#555" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121215', border: '1px solid #222', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="tasks" radius={[0, 4, 4, 0]}>
                  {workloadData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="p-5 rounded-2xl glass border border-border flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold">Recent Activities</h3>
            <ActivityCircle />
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 max-h-44 divide-y divide-border/40 pr-1">
            {activityLogs.slice(0, 5).map((log, idx) => (
              <div key={log.id} className={`flex items-start gap-2.5 text-xs ${idx > 0 ? 'pt-2.5' : ''}`}>
                <img 
                  src={log.userAvatar} 
                  alt={log.userName} 
                  className="w-5 h-5 rounded-full object-cover border border-primary/20 shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    <strong className="text-foreground font-semibold">{log.userName}</strong> {log.action}{' '}
                    <strong className="text-foreground font-medium">{log.targetName}</strong>
                  </p>
                  <span className="text-[9px] text-muted-foreground/60 block mt-0.5">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members List */}
        <div className="p-5 rounded-2xl glass border border-border flex flex-col gap-3">
          <h3 className="text-sm font-bold">Workspace Members</h3>
          <p className="text-[10px] text-muted-foreground mb-1">Active status and assigned workspace roles</p>
          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-44 pr-1">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="relative shrink-0">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-6 h-6 rounded-full border border-primary/10 object-cover" 
                    />
                    <span className={`absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full border border-card ${
                      user.status === 'online' ? 'bg-emerald-500' :
                      user.status === 'away' ? 'bg-amber-500' :
                      user.status === 'busy' ? 'bg-red-500' : 'bg-zinc-500'
                    }`} />
                  </div>
                  <span className="font-semibold truncate">{user.name}</span>
                </div>
                <span className="text-[9px] bg-secondary border border-border px-2 py-0.5 rounded-full text-muted-foreground uppercase font-semibold shrink-0">
                  {user.role.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityCircle() {
  return (
    <span className="flex h-2 w-2 relative shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
    </span>
  );
}
