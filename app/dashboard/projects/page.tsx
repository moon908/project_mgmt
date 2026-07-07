'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProjectFlowStore } from '@/store/projectStore';
import { 
  FolderPlus, Search, Calendar, Users, Star, 
  ArrowRight, X, Sparkles, Filter, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
];

function ProjectsListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { projects, users, addProject } = useProjectFlowStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'active' | 'on_hold' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Project Form Fields
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjStatus, setNewProjStatus] = useState<any>('active');
  const [newProjPriority, setNewProjPriority] = useState<any>('medium');
  const [newProjDueDate, setNewProjDueDate] = useState('');
  const [newProjTags, setNewProjTags] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedCover, setSelectedCover] = useState(COVER_IMAGES[0]);

  // Open modal if ?create=true URL query is present
  useEffect(() => {
    if (searchParams?.get('create') === 'true') {
      setShowCreateModal(true);
      // Clean query parameter
      router.replace('/dashboard/projects');
    }
  }, [searchParams, router]);

  // Form Submit Handler
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) {
      alert("Project title is required!");
      return;
    }

    const tagsArray = newProjTags.split(',').map(t => t.trim()).filter(t => t !== '');

    const added = addProject({
      name: newProjName,
      description: newProjDesc,
      status: newProjStatus,
      priority: newProjPriority,
      dueDate: newProjDueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: tagsArray,
      memberIds: selectedMembers,
      coverImage: selectedCover
    });

    // Reset Fields
    setNewProjName('');
    setNewProjDesc('');
    setNewProjStatus('active');
    setNewProjPriority('medium');
    setNewProjDueDate('');
    setNewProjTags('');
    setSelectedMembers([]);
    setShowCreateModal(false);

    // Redirect to the newly created project detail view
    router.push(`/dashboard/projects/${added.id}`);
  };

  const handleMemberToggle = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  // Filter Projects list
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Projects Hub</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Manage and track workspace schedules, tag allocations, and developers.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/95 transition-all shadow-md cursor-pointer shrink-0"
        >
          <FolderPlus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card/40 border border-border p-3.5 rounded-xl">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-secondary/40 border border-border/80 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted-foreground py-0.5"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1 hidden sm:block" />
          {(['all', 'planning', 'active', 'on_hold', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`py-1 px-3.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === f
                  ? 'bg-primary text-white'
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-24 text-center glass border border-border rounded-xl flex flex-col items-center justify-center gap-3">
          <FolderPlus className="w-10 h-10 text-muted-foreground/60 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold">No projects found</h3>
            <p className="text-xs text-muted-foreground mt-1">Try resetting your status filter, search query, or create a new project.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 py-2 px-4 rounded-lg bg-secondary border border-border text-xs font-semibold hover:bg-secondary/80 text-foreground transition-all cursor-pointer"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group rounded-2xl glass border border-border overflow-hidden hover:border-primary/45 transition-all duration-300 flex flex-col h-[340px] shadow-sm relative hover:shadow-primary/5"
            >
              {/* Cover Image */}
              <div className="h-28 relative overflow-hidden shrink-0">
                <img 
                  src={project.coverImage} 
                  alt={project.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                <div className="absolute bottom-3 left-4 flex gap-1.5 flex-wrap">
                  {project.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag} 
                      className="text-[9px] font-semibold bg-white/20 text-white backdrop-blur-md px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                    <span className={`px-2 py-0.5 rounded-full border ${
                      project.status === 'active' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      project.status === 'planning' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className={`font-semibold ${
                      project.priority === 'critical' ? 'text-red-500' :
                      project.priority === 'high' ? 'text-amber-500' :
                      project.priority === 'medium' ? 'text-blue-500' : 'text-zinc-500'
                    }`}>
                      {project.priority} priority
                    </span>
                  </div>

                  <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors mt-1">
                    {project.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 mt-2">
                  <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
                    <span>Progress</span>
                    <span className="text-foreground">{project.progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                {/* Footer details */}
                <div className="border-t border-border/40 pt-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due {project.dueDate}</span>
                  </div>

                  {/* Members profile list */}
                  <div className="flex items-center -space-x-1.5">
                    {project.members.slice(0, 4).map(member => (
                      <img 
                        key={member.id}
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-5.5 h-5.5 rounded-full border border-card object-cover" 
                        title={member.name}
                      />
                    ))}
                    {project.members.length > 4 && (
                      <div className="w-5.5 h-5.5 rounded-full border border-card bg-secondary text-[8px] font-bold flex items-center justify-center">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Project Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl glass-premium border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col text-foreground">
            {/* Header */}
            <div className="p-4 border-b border-border/80 flex items-center justify-between bg-secondary/10">
              <div className="flex items-center gap-1.5 text-primary text-sm font-semibold">
                <FolderPlus className="w-4.5 h-4.5" />
                <span>Create New Project</span>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleCreateProject} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Project Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Project Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Workspace App Redesign"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-secondary/30 border border-border text-xs focus:outline-none focus:border-primary"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  rows={2}
                  placeholder="Explain goals, key parameters, or sprints..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-secondary/30 border border-border text-xs focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Grid 2-column fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Status</label>
                  <select
                    value={newProjStatus}
                    onChange={(e) => setNewProjStatus(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-secondary/30 border border-border text-xs focus:outline-none focus:border-primary text-foreground"
                  >
                    <option value="planning" className="bg-[#121215]">Planning</option>
                    <option value="active" className="bg-[#121215]">Active</option>
                    <option value="on_hold" className="bg-[#121215]">On Hold</option>
                    <option value="completed" className="bg-[#121215]">Completed</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Priority</label>
                  <select
                    value={newProjPriority}
                    onChange={(e) => setNewProjPriority(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-secondary/30 border border-border text-xs focus:outline-none focus:border-primary text-foreground"
                  >
                    <option value="low" className="bg-[#121215]">Low</option>
                    <option value="medium" className="bg-[#121215]">Medium</option>
                    <option value="high" className="bg-[#121215]">High</option>
                    <option value="critical" className="bg-[#121215]">Critical</option>
                  </select>
                </div>
              </div>

              {/* Due Date & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Due Date</label>
                  <input
                    type="date"
                    value={newProjDueDate}
                    onChange={(e) => setNewProjDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-secondary/30 border border-border text-xs focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="SaaS, Mobile, API"
                    value={newProjTags}
                    onChange={(e) => setNewProjTags(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-secondary/30 border border-border text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Cover Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Select Project Cover</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {COVER_IMAGES.map((img, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedCover(img)}
                      className={`relative h-12 rounded-lg border-2 overflow-hidden cursor-pointer ${
                        selectedCover === img ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="cover selection" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Team Assignment */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Assign Team Members</label>
                <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto p-1.5 border border-border/80 bg-secondary/15 rounded-lg">
                  {users.map(user => (
                    <button
                      type="button"
                      key={user.id}
                      onClick={() => handleMemberToggle(user.id)}
                      className={`flex items-center gap-2 p-1 rounded-md text-left transition-colors cursor-pointer ${
                        selectedMembers.includes(user.id) 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent'
                      }`}
                    >
                      <img src={user.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                      <span className="text-[10px] font-medium truncate">{user.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-2 px-4 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsList() {
  return (
    <Suspense fallback={
      <div className="p-10 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading workspace projects...</span>
      </div>
    }>
      <ProjectsListContent />
    </Suspense>
  );
}
