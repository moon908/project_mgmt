'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectFlowStore } from '@/store/projectStore';
import { 
  Calendar, Users, CheckCircle2, MessageSquare, Timer, Activity, 
  FileText, Sparkles, Plus, Trash2, PlusCircle, X, ChevronDown, Check, 
  ExternalLink, File, Download, UploadCloud, UserMinus, UserPlus, Play, 
  Briefcase, AlertTriangle, Paperclip, Clock
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, User, Subtask, TaskComment } from '@/types';
import { generateAIContent } from '@/lib/openai';
import confetti from 'canvas-confetti';

interface ProjectDetailProps {
  params: Promise<{ id: string }>;
}

const KANBAN_COLUMNS: { label: string; status: TaskStatus; color: string }[] = [
  { label: 'Backlog', status: 'backlog', color: 'bg-zinc-700/35 text-zinc-400' },
  { label: 'Todo', status: 'todo', color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15' },
  { label: 'In Progress', status: 'in_progress', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/15' },
  { label: 'Review', status: 'review', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/15' },
  { label: 'Testing', status: 'testing', color: 'bg-pink-500/10 text-pink-400 border border-pink-500/15' },
  { label: 'Completed', status: 'completed', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' },
];

export default function ProjectDetailsPage({ params }: ProjectDetailProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();
  
  const { 
    projects, tasks, users, activityLogs, deleteProject,
    addTask, updateTask, deleteTask, moveTask, 
    toggleSubtask, addSubtask, deleteSubtask, addComment, logActivity
  } = useProjectFlowStore();

  const project = projects.find(p => p.id === projectId);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'timeline' | 'files' | 'team' | 'ai'>('tasks');

  // Selected Task for Details Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Quick Task Creation Inline
  const [showQuickTask, setShowQuickTask] = useState<TaskStatus | null>(null);
  const [quickTitle, setQuickTitle] = useState('');

  // Full Task Form State
  const [showFullTaskModal, setShowFullTaskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState<TaskStatus>('todo');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newPoints, setNewPoints] = useState(3);
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [newLabels, setNewLabels] = useState('');

  // Comment Form State
  const [commentContent, setCommentContent] = useState('');

  // Checklist Form State
  const [subtaskTitle, setSubtaskTitle] = useState('');

  // Time tracking increment state
  const [logTimeMinutes, setLogTimeMinutes] = useState(30);

  // Files Tab State
  const [mockFiles, setMockFiles] = useState([
    { id: 'f-1', name: 'Product_Requirements_V2.pdf', size: '1.4 MB', type: 'PDF', uploadedAt: '2026-07-01' },
    { id: 'f-2', name: 'Landing_Page_Wireframe.png', size: '2.8 MB', type: 'Image', uploadedAt: '2026-06-28' },
    { id: 'f-3', name: 'Sprint_Budget_Spreadsheet.xlsx', size: '512 KB', type: 'Excel', uploadedAt: '2026-06-25' }
  ]);
  const [dragOverFile, setDragOverFile] = useState(false);

  // AI Tab State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestedTasks, setAiSuggestedTasks] = useState<any[]>([]);

  // Team Tab State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<any>('DEVELOPER');

  // Trigger task details if taskId is in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlTaskId = searchParams.get('taskId');
      if (urlTaskId) {
        const task = tasks.find(t => t.id === urlTaskId);
        if (task) setSelectedTask(task);
      }
    }
  }, [tasks]);

  if (!project) {
    return (
      <div className="py-24 text-center glass border border-border rounded-xl max-w-xl mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
        <h3 className="text-sm font-bold">Project Not Found</h3>
        <p className="text-xs text-muted-foreground">The project ID does not exist or has been deleted from your workspace.</p>
        <button 
          onClick={() => router.push('/dashboard/projects')}
          className="py-2 px-4 rounded-lg bg-primary text-white text-xs font-semibold"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const projectTasks = tasks.filter(t => t.projectId === project.id);

  // ----------------------------------------------------
  // DRAG & DROP HANDLERS
  // ----------------------------------------------------
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTask(taskId, status);

      // confettis on complete!
      if (status === 'completed') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  // ----------------------------------------------------
  // INLINE TASK CREATION
  // ----------------------------------------------------
  const handleQuickCreateTask = (status: TaskStatus) => {
    if (!quickTitle.trim()) return;
    addTask({
      projectId: project.id,
      title: quickTitle,
      description: '',
      status,
      priority: 'medium',
      labels: ['Feature'],
      subtasks: [],
      estimatedTime: 120,
      timeSpent: 0
    });
    setQuickTitle('');
    setShowQuickTask(null);
  };

  // ----------------------------------------------------
  // FULL TASK MODAL CREATION
  // ----------------------------------------------------
  const handleFullCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const labelsArray = newLabels.split(',').map(l => l.trim()).filter(l => l !== '');
    const assigneeUser = users.find(u => u.id === newAssigneeId);

    addTask({
      projectId: project.id,
      title: newTitle,
      description: newDesc,
      status: newStatus,
      priority: newPriority,
      storyPoints: newPoints,
      dueDate: newDueDate || undefined,
      assignee: assigneeUser,
      labels: labelsArray.length > 0 ? labelsArray : ['Task'],
      subtasks: [],
      estimatedTime: 180,
      timeSpent: 0
    });

    setNewTitle('');
    setNewDesc('');
    setNewStatus('todo');
    setNewPriority('medium');
    setNewPoints(3);
    setNewDueDate('');
    setNewAssigneeId('');
    setNewLabels('');
    setShowFullTaskModal(false);
  };

  // ----------------------------------------------------
  // TASK DETAILS UPDATE ACTIONS
  // ----------------------------------------------------
  const handleAddSubtask = () => {
    if (!selectedTask || !subtaskTitle.trim()) return;
    addSubtask(selectedTask.id, subtaskTitle);
    
    // Refresh modal state
    const current = tasks.find(t => t.id === selectedTask.id);
    if (current) setSelectedTask(current);
    setSubtaskTitle('');
  };

  const handleToggleSub = (subId: string) => {
    if (!selectedTask) return;
    toggleSubtask(selectedTask.id, subId);
    
    const current = tasks.find(t => t.id === selectedTask.id);
    if (current) setSelectedTask(current);
  };

  const handleDeleteSub = (subId: string) => {
    if (!selectedTask) return;
    deleteSubtask(selectedTask.id, subId);
    
    const current = tasks.find(t => t.id === selectedTask.id);
    if (current) setSelectedTask(current);
  };

  const handleAddComment = () => {
    if (!selectedTask || !commentContent.trim()) return;
    addComment(selectedTask.id, commentContent);
    
    const current = tasks.find(t => t.id === selectedTask.id);
    if (current) setSelectedTask(current);
    setCommentContent('');
  };

  const handleLogTime = () => {
    if (!selectedTask) return;
    const currentSpent = selectedTask.timeSpent || 0;
    const updated = {
      ...selectedTask,
      timeSpent: currentSpent + logTimeMinutes
    };
    updateTask(updated);
    setSelectedTask(updated);
    logActivity('logged time spent on', selectedTask.title, 'task', project.id);
    alert(`Logged ${logTimeMinutes} minutes spent on task!`);
  };

  // ----------------------------------------------------
  // AI INTEGRATION ACTIONS
  // ----------------------------------------------------
  const handleGenerateAI = async (typePrompt: string) => {
    setAiLoading(true);
    setAiOutput('');
    setAiSuggestedTasks([]);
    
    try {
      const response = await generateAIContent(typePrompt, {
        name: project.name,
        description: project.description,
        tasks: projectTasks
      });
      setAiOutput(response.content);
      if (response.suggestedTasks) {
        setAiSuggestedTasks(response.suggestedTasks);
      }
    } catch (e) {
      console.error(e);
      setAiOutput("Error generating content. Please retry.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddAISuggestedTasks = () => {
    aiSuggestedTasks.forEach((item) => {
      addTask({
        projectId: project.id,
        title: item.title,
        description: item.description,
        status: 'todo',
        priority: item.priority,
        storyPoints: item.storyPoints,
        labels: item.labels,
        subtasks: [],
        estimatedTime: 180,
        timeSpent: 0
      });
    });
    setAiSuggestedTasks([]);
    alert(`Added ${aiSuggestedTasks.length} tasks to Kanban board!`);
    setActiveTab('tasks');
  };

  // ----------------------------------------------------
  // FILE UPLOAD AND DRAG HANDLERS
  // ----------------------------------------------------
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFile(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const newFiles = Array.from(droppedFiles).map(f => ({
        id: `f-${Date.now()}-${Math.random()}`,
        name: f.name,
        size: `${Math.round(f.size / 1024)} KB`,
        type: f.type || 'Document',
        uploadedAt: new Date().toISOString().split('T')[0]
      }));
      setMockFiles(prev => [...newFiles, ...prev]);
      logActivity('uploaded attachment file', droppedFiles[0].name, 'file', project.id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Project Details Cover Banner */}
      <div className="rounded-2xl glass border border-border overflow-hidden shadow-md flex flex-col sm:flex-row gap-4 relative">
        <div className="h-24 sm:h-auto sm:w-1/3 relative shrink-0">
          <img src={project.coverImage} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#09090b]/80 to-[#09090b]" />
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase font-bold py-0.5 px-2.5 rounded-full border ${
                project.status === 'active' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Due {project.dueDate}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">{project.description}</p>
          </div>

          <div className="flex items-center justify-between border-t border-border/40 pt-4 flex-wrap gap-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center -space-x-1.5">
                {project.members.map(m => (
                  <img key={m.id} src={m.avatar} className="w-6 h-6 rounded-full border border-card object-cover" alt="" title={m.name} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-semibold">{project.members.length} members assigned</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span>Velocity progress:</span>
                <span className="text-foreground">{project.progress}%</span>
              </div>
              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to delete this project? This action deletes all tasks, timeline metrics, and chats.")) {
                    deleteProject(project.id);
                    router.push('/dashboard/projects');
                  }
                }}
                className="text-red-500 hover:text-red-400 cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-border flex items-center gap-2 overflow-x-auto scrollbar-none py-1 relative z-10">
        {[
          { id: 'overview', label: 'Overview', icon: Briefcase },
          { id: 'tasks', label: 'Kanban Board', icon: CheckCircle2 },
          { id: 'timeline', label: 'Timeline (Gantt)', icon: Calendar },
          { id: 'files', label: 'Files', icon: Paperclip },
          { id: 'team', label: 'Team', icon: Users },
          { id: 'ai', label: 'AI Planner', icon: Sparkles },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 py-2 px-4 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              activeTab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40 rounded-t-lg'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ----------------------------------------------------
          TAB PANEL: OVERVIEW
          ---------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="md:col-span-2 space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-secondary/15 flex flex-col justify-between h-20">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Tasks</span>
                <span className="text-xl font-bold">{projectTasks.length}</span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-secondary/15 flex flex-col justify-between h-20">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Active Tasks</span>
                <span className="text-xl font-bold">{projectTasks.filter(t => t.status === 'in_progress').length}</span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-secondary/15 flex flex-col justify-between h-20">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Completed</span>
                <span className="text-xl font-bold text-emerald-500">{projectTasks.filter(t => t.status === 'completed').length}</span>
              </div>
            </div>

            {/* Quick Timeline list */}
            <div className="p-5 rounded-2xl glass border border-border space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider">Project Timeline (Upcoming Milestones)</h3>
              <div className="space-y-4 relative border-l border-border/80 pl-4 py-1.5 ml-2.5">
                {projectTasks.filter(t => t.dueDate && t.status !== 'completed').slice(0, 4).map(t => (
                  <div key={t.id} className="relative text-xs">
                    <span className="absolute -left-[21.5px] top-0.5 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Due date: {t.dueDate}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity feed list */}
          <div className="p-5 rounded-2xl glass border border-border flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider">Project Activity Logs</h3>
            <div className="flex-1 space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {activityLogs.slice(0, 6).map(log => (
                <div key={log.id} className="flex gap-2 text-xs">
                  <img src={log.userAvatar} className="w-5 h-5 rounded-full object-cover shrink-0" alt="" />
                  <div className="flex-1">
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      <strong className="text-foreground">{log.userName}</strong> {log.action} <strong>{log.targetName}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB PANEL: KANBAN BOARD
          ---------------------------------------------------- */}
      {activeTab === 'tasks' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center gap-4">
            <span className="text-xs font-bold text-muted-foreground">{projectTasks.length} sprint items</span>
            <button
              onClick={() => {
                setNewStatus('todo');
                setShowFullTaskModal(true);
              }}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-semibold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 items-start">
            {KANBAN_COLUMNS.map(col => {
              const colTasks = projectTasks.filter(t => t.status === col.status);
              const isQuickActive = showQuickTask === col.status;

              return (
                <div 
                  key={col.status}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.status)}
                  className="rounded-xl border border-border bg-card/30 flex flex-col max-h-[600px]"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-border/80 flex items-center justify-between shrink-0 bg-secondary/10 rounded-t-xl">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider ${col.color}`}>
                        {col.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">{colTasks.length}</span>
                  </div>

                  {/* Task deck inside column */}
                  <div className="flex-1 p-2 space-y-2 overflow-y-auto select-none min-h-[150px]">
                    {colTasks.map(task => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => setSelectedTask(task)}
                        className="p-3.5 rounded-xl border border-border/80 bg-card hover:border-primary/40 cursor-pointer shadow-sm hover:shadow-primary/5 transition-all space-y-2.5 relative group"
                      >
                        <div className="flex items-center justify-between gap-1 flex-wrap text-[9px] font-bold text-muted-foreground uppercase">
                          <span className={`px-1.5 py-0.5 rounded ${
                            task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                            task.priority === 'high' ? 'bg-amber-500/10 text-amber-500' :
                            task.priority === 'medium' ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-500/10'
                          }`}>
                            {task.priority}
                          </span>
                          {task.storyPoints && (
                            <span className="bg-secondary/80 px-1 rounded">{task.storyPoints} pts</span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold leading-relaxed line-clamp-2">
                          {task.title}
                        </h4>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 shrink-0">
                          {/* Label badges */}
                          <div className="flex gap-1 overflow-hidden">
                            {task.labels.slice(0, 1).map(l => (
                              <span key={l} className="text-[8px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">
                                {l}
                              </span>
                            ))}
                          </div>

                          {/* Assignee Avatar */}
                          {task.assignee ? (
                            <img 
                              src={task.assignee.avatar} 
                              alt={task.assignee.name} 
                              className="w-5 h-5 rounded-full object-cover border border-primary/20 shrink-0" 
                              title={task.assignee.name}
                            />
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-secondary border border-border flex items-center justify-center text-[8px] text-muted-foreground shrink-0">
                              ?
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Quick creation input inline */}
                    {isQuickActive ? (
                      <div className="p-2 border border-primary/20 bg-secondary/15 rounded-lg space-y-2">
                        <input
                          autoFocus
                          type="text"
                          placeholder="Task title..."
                          value={quickTitle}
                          onChange={(e) => setQuickTitle(e.target.value)}
                          className="w-full bg-transparent border-b border-border/80 outline-none text-xs py-1"
                        />
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => setShowQuickTask(null)}
                            className="p-1 rounded hover:bg-secondary text-[10px] font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleQuickCreateTask(col.status)}
                            className="bg-primary px-2.5 py-1 text-white rounded text-[10px] font-bold"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowQuickTask(col.status)}
                        className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg border border-dashed border-border hover:border-white/20 text-[10px] text-muted-foreground hover:text-foreground transition-all cursor-pointer mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Quick Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB PANEL: TIMELINE (GANTT)
          ---------------------------------------------------- */}
      {activeTab === 'timeline' && (
        <div className="p-5 rounded-2xl glass border border-border space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-sm font-bold">Gantt Milestone Visualizer</h3>
            <p className="text-[10px] text-muted-foreground">Sprint tasks mapped across the active due dates calendar</p>
          </div>

          <div className="border border-border rounded-xl bg-card/30 overflow-x-auto min-w-[700px]">
            {/* Header dates */}
            <div className="flex border-b border-border text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              <div className="w-1/3 p-3 border-r border-border">Task Details</div>
              <div className="w-2/3 p-3 grid grid-cols-4 text-center">
                <span>Week 1 (Mon-Wed)</span>
                <span>Week 2 (Thu-Sat)</span>
                <span>Week 3 (Sun-Tue)</span>
                <span>Week 4 (Wed-Fri)</span>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/60">
              {projectTasks.filter(t => t.dueDate).map((task, idx) => {
                // Generate a pseudo-offset and width for demo scheduling
                const startOffset = (idx % 3) * 15; // 0%, 15%, 30%
                const barWidth = 30 + (idx % 4) * 15; // 30%, 45%, 60%

                return (
                  <div key={task.id} className="flex text-xs items-center hover:bg-secondary/20 transition-all">
                    <div className="w-1/3 p-3 border-r border-border truncate font-medium flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-emerald-500' :
                        task.status === 'in_progress' ? 'bg-amber-500' : 'bg-indigo-500'
                      }`} />
                      {task.title}
                    </div>
                    <div className="w-2/3 p-3 relative h-10 flex items-center">
                      <div 
                        className={`h-4 rounded-full relative overflow-hidden bg-primary/20 border border-primary/35 flex items-center px-2 text-[8px] font-bold text-primary`}
                        style={{ marginLeft: `${startOffset}%`, width: `${barWidth}%` }}
                      >
                        <span className="truncate">{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB PANEL: FILES
          ---------------------------------------------------- */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Drag and Drop Area */}
          <div className="md:col-span-2 space-y-4">
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragOverFile(true); }}
              onDragLeave={() => setDragOverFile(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-colors ${
                dragOverFile 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card/30 hover:border-white/10'
              }`}
            >
              <UploadCloud className="w-10 h-10 text-primary animate-pulse" />
              <div>
                <h4 className="text-xs font-bold">Drag and Drop Document Files</h4>
                <p className="text-[10px] text-muted-foreground mt-1">Supports PDF, XLSX, DOCX, images, and videos (max 50MB)</p>
              </div>
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const newFiles = Array.from(files).map(f => ({
                      id: `f-${Date.now()}`,
                      name: f.name,
                      size: `${Math.round(f.size / 1024)} KB`,
                      type: 'Doc',
                      uploadedAt: new Date().toISOString().split('T')[0]
                    }));
                    setMockFiles(prev => [...newFiles, ...prev]);
                    logActivity('uploaded attachment file', files[0].name, 'file', project.id);
                  }
                }}
              />
              <label 
                htmlFor="file-upload"
                className="py-1.5 px-4 rounded-lg bg-secondary border border-border text-[10px] font-bold hover:bg-secondary/80 cursor-pointer"
              >
                Choose Local File
              </label>
            </div>

            {/* List */}
            <div className="p-5 rounded-2xl glass border border-border space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider">Workspace Attachments</h3>
              <div className="divide-y divide-border/60">
                {mockFiles.map(file => (
                  <div key={file.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                        <File className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Uploaded {file.uploadedAt} • {file.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => alert(`Mock Download started for: ${file.name}`)}
                        className="p-1.5 rounded bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB PANEL: TEAM
          ---------------------------------------------------- */}
      {activeTab === 'team' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground">{project.members.length} active assignees</span>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-semibold shadow-md cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {project.members.map(member => (
              <div key={member.id} className="p-4 rounded-xl border border-border bg-card/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={member.avatar} className="w-9 h-9 rounded-full object-cover border border-primary/20 shrink-0" alt="" />
                  <div className="min-w-0">
                    <p className="font-bold truncate">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>
                
                {/* Role dropdown mockup */}
                <span className="text-[9px] bg-secondary border border-border px-2 py-0.5 rounded-full text-muted-foreground font-semibold uppercase">
                  {member.role.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB PANEL: AI INSIGHTS
          ---------------------------------------------------- */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl glass border border-border flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-primary text-xs font-semibold border-b border-border pb-3 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>ProjectFlow Sprint Generator</span>
            </div>

            <div className="flex-1 flex flex-col gap-2 justify-center">
              <button
                onClick={() => handleGenerateAI("Create a Sprint Plan Roadmap")}
                className="w-full text-left py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold cursor-pointer"
              >
                Generate Sprint Plan
              </button>
              <button
                onClick={() => handleGenerateAI("Create User Stories")}
                className="w-full text-left py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold cursor-pointer"
              >
                Generate User Stories
              </button>
              <button
                onClick={() => handleGenerateAI("Break this project into tasks")}
                className="w-full text-left py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold cursor-pointer"
              >
                Generate Task Breakdowns
              </button>
              <button
                onClick={() => handleGenerateAI("Suggest blockers and risks")}
                className="w-full text-left py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold cursor-pointer"
              >
                Suggest Risks & Blockers
              </button>
            </div>
          </div>

          <div className="md:col-span-2 p-5 rounded-2xl glass border border-border flex flex-col h-[400px]">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3">AI Suggestions Output</h3>
            
            <div className="flex-1 overflow-y-auto border border-border bg-black/30 rounded-xl p-4 text-xs leading-relaxed space-y-3">
              {aiLoading ? (
                <div className="py-24 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <Sparkles className="w-6 h-6 animate-spin text-primary" />
                  <span>ProjectFlow AI is calculating roadmap statistics...</span>
                </div>
              ) : aiOutput ? (
                <div className="space-y-4">
                  <div className="prose prose-invert max-w-none text-[11px] sm:text-xs">
                    {/* Render basic custom line breaks for simulate */}
                    {aiOutput.split('\n').map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>

                  {aiSuggestedTasks.length > 0 && (
                    <div className="p-3 border border-primary/20 bg-primary/5 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-primary">Found {aiSuggestedTasks.length} Suggested Tasks</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Click to append these to the active Kanban backlog.</p>
                      </div>
                      <button
                        onClick={handleAddAISuggestedTasks}
                        className="py-1.5 px-3 rounded bg-primary text-white text-[10px] font-bold hover:bg-primary/90"
                      >
                        Add to Kanban
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-24 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <FileText className="w-6 h-6 text-muted-foreground/40" />
                  <span>Choose a sprint generator from the panel on the left to see suggestion metrics.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL OVERLAY: TASK DETAILS (Subtasks, comments)
          ---------------------------------------------------- */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl glass-premium border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col text-foreground">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/10 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold py-0.5 px-2 rounded uppercase ${
                  selectedTask.priority === 'urgent' ? 'bg-red-500/10 text-red-500' : 'bg-secondary text-muted-foreground'
                }`}>
                  {selectedTask.priority}
                </span>
                <span className="text-[10px] text-muted-foreground">Task Details</span>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable details body */}
            <div className="p-5 overflow-y-auto max-h-[75vh] grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Main Content (Title, checklist, comments) */}
              <div className="md:col-span-2 space-y-5 text-xs">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold">{selectedTask.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed bg-secondary/20 p-2.5 rounded-lg border border-border/40 mt-2">
                    {selectedTask.description || 'No description supplied. Add one to details.'}
                  </p>
                </div>

                {/* Subtask checklist */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-muted-foreground">Checklist</h4>
                  
                  {/* Add subtask */}
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Add check item..." 
                      value={subtaskTitle}
                      onChange={(e) => setSubtaskTitle(e.target.value)}
                      className="flex-1 bg-secondary/20 border border-border rounded p-1.5 outline-none text-xs"
                    />
                    <button 
                      onClick={handleAddSubtask}
                      className="p-1.5 bg-primary text-white rounded cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto mt-2">
                    {selectedTask.subtasks.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between p-1 hover:bg-secondary/20 rounded">
                        <button
                          onClick={() => handleToggleSub(sub.id)}
                          className="flex items-center gap-2 cursor-pointer text-left"
                        >
                          <span className={`w-3.5 h-3.5 rounded border border-border flex items-center justify-center ${
                            sub.completed ? 'bg-primary border-primary text-white' : 'bg-transparent'
                          }`}>
                            {sub.completed && <Check className="w-2.5 h-2.5" />}
                          </span>
                          <span className={`${sub.completed ? 'line-through text-muted-foreground' : ''}`}>{sub.title}</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteSub(sub.id)}
                          className="text-red-500 hover:text-red-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments thread */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-muted-foreground">Comments</h4>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add comment..." 
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      className="flex-1 bg-secondary/20 border border-border rounded p-2 outline-none text-xs"
                    />
                    <button 
                      onClick={handleAddComment}
                      className="py-1 px-3 bg-primary text-white rounded text-xs font-bold cursor-pointer"
                    >
                      Comment
                    </button>
                  </div>

                  <div className="space-y-2.5 mt-2 max-h-40 overflow-y-auto pr-1">
                    {selectedTask.comments.map(comment => (
                      <div key={comment.id} className="p-2 border border-border bg-secondary/15 rounded-lg flex items-start gap-2.5">
                        <img src={comment.userAvatar} className="w-5 h-5 rounded-full object-cover shrink-0" alt="" />
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-semibold text-[10px]">{comment.userName}</span>
                            <span className="text-[8px] text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Side Parameters panel (assignee, status, time logging) */}
              <div className="space-y-4 border-l border-border pl-4 text-xs shrink-0">
                {/* Assignee */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Assignee</label>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedTask.assignee ? (
                      <>
                        <img src={selectedTask.assignee.avatar} className="w-6 h-6 rounded-full object-cover border border-primary/20" alt="" />
                        <span className="font-medium">{selectedTask.assignee.name}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </div>
                </div>

                {/* Status Column */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => {
                      const updated = { ...selectedTask, status: e.target.value as TaskStatus };
                      updateTask(updated);
                      setSelectedTask(updated);
                    }}
                    className="w-full p-1.5 bg-secondary border border-border rounded text-xs mt-1 text-foreground"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="testing">Testing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Priority Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Priority</label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => {
                      const updated = { ...selectedTask, priority: e.target.value as TaskPriority };
                      updateTask(updated);
                      setSelectedTask(updated);
                    }}
                    className="w-full p-1.5 bg-secondary border border-border rounded text-xs mt-1 text-foreground"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Time Tracking Progress */}
                <div className="space-y-1.5 border-t border-border pt-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Time Tracking</label>
                  <div className="flex justify-between text-[10px] text-muted-foreground font-semibold mt-1">
                    <span>Spent: {selectedTask.timeSpent || 0}m</span>
                    <span>Est: {selectedTask.estimatedTime || 180}m</span>
                  </div>
                  
                  {/* Log time form */}
                  <div className="flex gap-2 items-center mt-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={logTimeMinutes}
                      onChange={(e) => setLogTimeMinutes(Number(e.target.value))}
                      className="w-14 bg-secondary border border-border rounded p-1 text-center text-xs"
                    />
                    <button 
                      onClick={handleLogTime}
                      className="flex-1 py-1 bg-secondary hover:bg-secondary/80 border border-border rounded text-[10px] font-bold cursor-pointer"
                    >
                      Log Time
                    </button>
                  </div>
                </div>

                {/* Delete Task */}
                <div className="border-t border-border pt-4">
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this task card?")) {
                        deleteTask(selectedTask.id);
                        setSelectedTask(null);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Task Card
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL OVERLAY: FULL TASK CREATION
          ---------------------------------------------------- */}
      {showFullTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-premium border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col text-foreground">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/15">
              <span className="font-semibold text-xs text-primary flex items-center gap-1"><PlusCircle className="w-4 h-4" /> Create Board Task</span>
              <button onClick={() => setShowFullTaskModal(false)} className="p-1 rounded hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleFullCreateTask} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Task Title *</label>
                <input
                  required
                  type="text"
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 bg-secondary/35 border border-border rounded outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Description</label>
                <textarea
                  rows={2}
                  placeholder="Task details..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2 bg-secondary/35 border border-border rounded outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className="w-full p-2 bg-secondary border border-border rounded text-foreground"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="testing">Testing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full p-2 bg-secondary border border-border rounded text-foreground"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Story Points</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full p-2 bg-secondary border border-border rounded text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2 bg-secondary border border-border rounded text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Assignee</label>
                  <select
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                    className="w-full p-2 bg-secondary border border-border rounded text-foreground"
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Labels (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="API, Bug, Design"
                    value={newLabels}
                    onChange={(e) => setNewLabels(e.target.value)}
                    className="w-full p-2 bg-secondary border border-border rounded text-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border/80">
                <button type="button" onClick={() => setShowFullTaskModal(false)} className="py-2 px-4 rounded bg-secondary hover:bg-secondary/80 border border-border font-semibold">Cancel</button>
                <button type="submit" className="py-2 px-5 rounded bg-primary text-white font-bold hover:bg-primary/95">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL OVERLAY: MEMBER INVITATION
          ---------------------------------------------------- */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm glass-premium border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col text-foreground">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/15 shrink-0">
              <span className="font-semibold text-xs text-primary flex items-center gap-1"><UserPlus className="w-4 h-4" /> Invite Team Member</span>
              <button onClick={() => setShowInviteModal(false)} className="p-1 rounded hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Email Address</label>
                <input 
                  type="email" 
                  placeholder="member@company.com" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2 bg-secondary border border-border rounded"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Workspace Role</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full p-2 bg-secondary border border-border rounded text-foreground"
                >
                  <option value="DEVELOPER">Developer</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                  <option value="TESTER">Tester</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setShowInviteModal(false)} className="py-1.5 px-3 rounded bg-secondary hover:bg-secondary/80 border border-border font-semibold">Cancel</button>
                <button 
                  onClick={() => {
                    if (!inviteEmail.trim()) return;
                    alert(`Invited ${inviteEmail} as ${inviteRole.toLowerCase()}!`);
                    setShowInviteModal(false);
                    setInviteEmail('');
                  }} 
                  className="py-1.5 px-4 rounded bg-primary text-white font-bold hover:bg-primary/95"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
