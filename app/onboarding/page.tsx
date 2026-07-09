'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Briefcase, Users, CheckSquare, 
  ArrowRight, ArrowLeft, CheckCircle2, ChevronDown
} from 'lucide-react';
import { useProjectFlowStore } from '../../store/projectStore';

export default function OnboardingPage() {
  const router = useRouter();
  const store = useProjectFlowStore();
  const [step, setStep] = useState(1);

  // Form State
  const [workspaceName, setWorkspaceName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [teammates, setTeammates] = useState(['', '']);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskAssigneeIndex, setTaskAssigneeIndex] = useState(0);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'high', label: 'High', color: 'text-orange-400' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
  ];

  const assigneeOptions = [
    { value: 0, label: 'You (Admin)' },
    ...teammates.filter(t => t.trim() !== '').map((name, i) => ({ value: i + 1, label: name }))
  ];

  const selectedPriority = priorities.find(p => p.value === taskPriority) || priorities[1];
  const selectedAssignee = assigneeOptions.find(a => a.value === taskAssigneeIndex) || assigneeOptions[0];

  const handleTeammateChange = (index: number, value: string) => {
    const updated = [...teammates];
    updated[index] = value;
    setTeammates(updated);
  };

  const addTeammateField = () => {
    setTeammates([...teammates, '']);
  };

  const removeTeammateField = (index: number) => {
    if (teammates.length <= 1) return;
    setTeammates(teammates.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1 && !workspaceName.trim()) return;
    if (step === 2 && !projectName.trim()) return;
    if (step === 4 && !taskTitle.trim()) return;
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleComplete = () => {
    if (!taskTitle.trim()) return;

    // Filter empty teammates
    const validTeammates = teammates.filter(t => t.trim() !== '');

    // Setup Custom Workspace Data
    const customData = {
      workspaceName: workspaceName.trim(),
      projectName: projectName.trim(),
      projectDesc: projectDesc.trim(),
      teammates: validTeammates.length > 0 ? validTeammates : ['Sarah Chen', 'Alex Rivera'],
      taskTitle: taskTitle.trim(),
      taskPriority,
      taskAssigneeIndex
    };

    // Store Custom Workspace in projectStore
    if ((store as any).initializeOnboardedWorkspace) {
      (store as any).initializeOnboardedWorkspace(customData);
    }

    localStorage.setItem('pf_workspace_mode', 'custom');
    localStorage.setItem('pf_onboarded', 'true');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-brand-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-8 shadow-2xl relative z-10 glass-premium">
        
        {/* Progress Bar */}
        <div className="w-full bg-secondary h-1 rounded-full overflow-hidden mb-8 flex">
          <div 
            className="bg-brand-500 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                  <Building2 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Name your workspace</h2>
                <p className="text-sm text-muted-foreground">This is typically your company, agency, or department name.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Acme Corp, Design Studio"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:border-brand-500 focus:outline-none transition-colors text-sm"
                  autoFocus
                />
              </div>

              <button
                onClick={handleNext}
                disabled={!workspaceName.trim()}
                className="w-full h-11 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Create your first project</h2>
                <p className="text-sm text-muted-foreground">What initiative is your team planning next?</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Q3 SaaS Launch, Website Redesign"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:border-brand-500 focus:outline-none transition-colors text-sm"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description (Optional)</label>
                  <textarea 
                    placeholder="Brief outline of the project scope or goals..."
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl border border-border bg-background focus:border-brand-500 focus:outline-none transition-colors text-sm min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="w-1/3 h-11 rounded-xl border border-border hover:bg-secondary flex items-center justify-center gap-1.5 font-semibold text-sm transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!projectName.trim()}
                  className="w-2/3 h-11 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Invite your team members</h2>
                <p className="text-sm text-muted-foreground">Add teammates to collaborate on projects and assign tasks.</p>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {teammates.map((teammate, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input 
                      type="text"
                      placeholder={`Team Member #${index + 1} Name`}
                      value={teammate}
                      onChange={(e) => handleTeammateChange(index, e.target.value)}
                      className="flex-1 h-11 px-4 rounded-xl border border-border bg-background focus:border-brand-500 focus:outline-none transition-colors text-sm"
                    />
                    <button 
                      onClick={() => removeTeammateField(index)}
                      disabled={teammates.length <= 1}
                      className="h-11 px-3 text-xs border border-border rounded-xl hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addTeammateField}
                  className="text-xs text-brand-500 font-semibold hover:underline block pt-1"
                >
                  + Add Another Member
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="w-1/3 h-11 rounded-xl border border-border hover:bg-secondary flex items-center justify-center gap-1.5 font-semibold text-sm transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="w-2/3 h-11 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Assign the first task</h2>
                <p className="text-sm text-muted-foreground">Create a task to get the project rolling.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Task Title</label>
                  <input 
                    type="text"
                    placeholder="e.g. Design homepage wireframes"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:border-brand-500 focus:outline-none transition-colors text-sm"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Priority Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => { setPriorityOpen(!priorityOpen); setAssigneeOpen(false); }}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-[#1a1f2e] hover:border-brand-500 focus:border-brand-500 focus:outline-none transition-colors text-sm flex items-center justify-between cursor-pointer"
                      >
                        <span className={selectedPriority.color + ' font-medium'}>{selectedPriority.label}</span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${priorityOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {priorityOpen && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border border-border bg-[#1a1f2e] shadow-2xl overflow-hidden">
                          {priorities.map(p => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => { setTaskPriority(p.value); setPriorityOpen(false); }}
                              className={`w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 hover:bg-white/5 transition-colors ${
                                taskPriority === p.value ? 'bg-brand-500/10' : ''
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${
                                p.value === 'low' ? 'bg-green-400' :
                                p.value === 'medium' ? 'bg-yellow-400' :
                                p.value === 'high' ? 'bg-orange-400' : 'bg-red-400'
                              }`} />
                              <span className={p.color + ' font-medium'}>{p.label}</span>
                              {taskPriority === p.value && <span className="ml-auto text-brand-500">✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assignee Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignee</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => { setAssigneeOpen(!assigneeOpen); setPriorityOpen(false); }}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-[#1a1f2e] hover:border-brand-500 focus:border-brand-500 focus:outline-none transition-colors text-sm flex items-center justify-between cursor-pointer"
                      >
                        <span className="text-foreground font-medium">{selectedAssignee?.label || 'You (Admin)'}</span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${assigneeOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {assigneeOpen && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border border-border bg-[#1a1f2e] shadow-2xl overflow-hidden">
                          {assigneeOptions.map(a => (
                            <button
                              key={a.value}
                              type="button"
                              onClick={() => { setTaskAssigneeIndex(a.value); setAssigneeOpen(false); }}
                              className={`w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 hover:bg-white/5 transition-colors ${
                                taskAssigneeIndex === a.value ? 'bg-brand-500/10' : ''
                              }`}
                            >
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                {a.label.charAt(0)}
                              </div>
                              <span className="text-foreground">{a.label}</span>
                              {taskAssigneeIndex === a.value && <span className="ml-auto text-brand-500">✓</span>}
                            </button>
                          ))}
                          {assigneeOptions.length <= 1 && (
                            <div className="px-4 py-2.5 text-xs text-muted-foreground italic">
                              Add teammates in the previous step
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="w-1/3 h-11 rounded-xl border border-border hover:bg-secondary flex items-center justify-center gap-1.5 font-semibold text-sm transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!taskTitle.trim()}
                  className="w-2/3 h-11 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/95 hover:scale-[1.02] shadow-lg shadow-brand-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Onboarding
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
