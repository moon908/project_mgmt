'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Sparkles, ShieldCheck, Zap, Activity, MessageSquare, 
  ArrowRight, Users, Play, Star, ChevronDown, CheckCircle2 
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ai' | 'kanban' | 'chat'>('ai');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const faqData = [
    { q: "Do I need an OpenAI API key to use ProjectFlow AI?", a: "No! Out of the box, ProjectFlow AI comes with a built-in context-aware simulation engine. If you do specify an OPENAI_API_KEY in your env file, the app automatically transitions to make real requests." },
    { q: "Is ProjectFlow AI responsive on tablet & mobile devices?", a: "Yes, the entire layout, sidebar, chat channels, dashboard grids, settings pane, and task detail boards are fully responsive for all screen sizes." },
    { q: "How does the drag-and-drop board update project progress?", a: "The workspace contains a reactive client-side database. Moving a task into the 'Completed' status updates the parent project progress bar instantly and triggers a particle confetti explosion." },
    { q: "Can I invite external team members and assign custom roles?", a: "Absolutely. ProjectFlow AI supports Role Based Access Control (RBAC) with roles like Owner, Manager, Developer, Tester, and Viewer, allowing tailored project permissions." }
  ];

  return (
    <div className="min-h-screen bg-[#07070a] text-foreground relative overflow-hidden flex flex-col font-sans">
      
      {/* Background Neon Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-float" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-brand-800/5 blur-[150px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-overlay opacity-40 pointer-events-none" />

      {/* Header Bar */}
      <header className="h-16 border-b border-white/5 relative z-40 bg-[#07070a]/60 backdrop-blur-md px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-md shadow-brand-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-brand-400">
            ProjectFlow AI
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 py-2 px-5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-all shadow-md cursor-pointer"
          >
            Enter Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 md:px-12 py-16 md:py-28 flex flex-col items-center text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium tracking-wide mb-6 animate-pulse"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Powered by React 19 & Next.js 15
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
        >
          Run your sprints at <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 via-primary to-indigo-400">
            gravity-defying speeds
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10"
        >
          A Linear-inspired project tracker built for high-performance teams. Auto-breakdown tasks, draft sprint goals, predict roadmap blockers, and coordinate chat instantly.
        </motion.p>

        {/* Hero Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-primary text-white text-base font-bold hover:bg-primary/95 transition-all shadow-lg hover:shadow-primary/20 hover:scale-105 cursor-pointer"
          >
            Start Planning Free
            <ArrowRight className="w-5 h-5" />
          </button>
          <a
            href="#demo"
            className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-white text-base font-bold hover:bg-white/10 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            Live Demo Preview
          </a>
        </motion.div>

        {/* Feature showcase mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full relative rounded-2xl border border-white/10 bg-zinc-900/40 p-1.5 shadow-2xl glass-premium"
          id="demo"
        >
          <div className="rounded-xl border border-white/5 bg-[#0a0a0d] overflow-hidden">
            {/* Window header */}
            <div className="h-10 border-b border-white/5 bg-black/40 px-4 flex items-center justify-between shrink-0">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-[10px] font-mono text-muted-foreground select-none">
                projectflow-ai-dashboard
              </div>
              <span className="w-8" />
            </div>

            {/* Mock Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 h-[380px] text-left">
              {/* Mock Sidebar */}
              <div className="border-r border-white/5 bg-black/20 p-4 space-y-4 hidden md:block">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  ProjectFlow
                </div>
                <div className="space-y-1">
                  <div className="h-7 bg-primary/10 rounded-md border-l-2 border-primary flex items-center px-3.5 text-xs text-primary font-medium">Dashboard</div>
                  <div className="h-7 hover:bg-white/5 rounded-md flex items-center px-3.5 text-xs text-muted-foreground">Kanban Board</div>
                  <div className="h-7 hover:bg-white/5 rounded-md flex items-center px-3.5 text-xs text-muted-foreground">Sprint Chat</div>
                  <div className="h-7 hover:bg-white/5 rounded-md flex items-center px-3.5 text-xs text-muted-foreground">Analytics</div>
                </div>
              </div>

              {/* Mock Core Body */}
              <div className="col-span-3 p-6 space-y-6 overflow-y-auto">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-bold">ProjectFlow Launch</h4>
                    <p className="text-[11px] text-muted-foreground">Active Sprint Plan Insights</p>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">68% Done</span>
                </div>

                {/* Subtask animation or chat animation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 flex flex-col gap-2">
                    <span className="text-[10px] text-muted-foreground">TODO</span>
                    <span className="text-xs font-semibold">Setup OpenAI Controller Route</span>
                    <div className="h-1 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '40%' }} />
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 flex flex-col gap-2">
                    <span className="text-[10px] text-muted-foreground">IN PROGRESS</span>
                    <span className="text-xs font-semibold">Integrate Drag & Drop States</span>
                    <div className="h-1 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '70%' }} />
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 flex flex-col gap-2">
                    <span className="text-[10px] text-muted-foreground">REVIEW</span>
                    <span className="text-xs font-semibold">Design premium layouts</span>
                    <div className="h-1 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '90%' }} />
                    </div>
                  </div>
                </div>

                {/* Interactive display bar selector */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-xl" />
                  <div className="flex gap-2 items-center text-xs text-primary font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Assistant Suggestion
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    &quot;Based on the current developer workload, I recommend promoting <strong>Setup OpenAI Controller Route</strong> to active priority. Alex Rivera has 3 open hours today.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Showcase Tab Grid */}
      <section className="px-6 md:px-12 py-20 border-t border-white/5 bg-zinc-950/20" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">Crafted for deep work & speed</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Everything your engineering, design, and product team needs, coordinated inside one seamless workflow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-zinc-900/20 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Workspace AI Assistant</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Generate project roadmaps, list critical risks, design user stories, or prompt the chat assistant directly about your progress logs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/20 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Drag & Drop Kanban</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Move task cards seamlessly between workflow columns. Track story points, assignees, checklists, and time durations dynamically.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/20 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Workspace Sprints Chat</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Real-time-like channels (#general, #dev, #design) and direct messaging features. React with emojis, attach files, and view typing alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="px-6 md:px-12 py-20 border-t border-white/5 bg-black/20" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">Flexible plans for growing teams</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Use ProjectFlow AI completely free, or unlock premium features for larger workspaces.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-6 rounded-2xl bg-zinc-900/10 border border-white/5 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Free Tier</h4>
                <div className="text-3xl font-bold mt-2">$0</div>
                <p className="text-xs text-muted-foreground mt-2">Perfect for side projects & portfolios</p>
                <div className="h-px bg-white/5 my-6" />
                <ul className="space-y-3 text-xs">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Active simulation modes</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Up to 3 active projects</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Interactive Kanban boards</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Offline storage sync</li>
                </ul>
              </div>
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full py-2.5 rounded-lg border border-white/10 hover:border-white/20 mt-8 text-xs font-semibold transition-colors cursor-pointer"
              >
                Enter App Now
              </button>
            </div>

            {/* Professional Tier */}
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/30 flex flex-col justify-between relative">
              <div className="absolute top-3 right-3 text-[9px] bg-primary text-white font-bold py-0.5 px-2 rounded-full uppercase tracking-wider">POPULAR</div>
              <div>
                <h4 className="text-sm font-semibold text-primary">Pro Workspace</h4>
                <div className="text-3xl font-bold mt-2">$12<span className="text-xs text-muted-foreground">/mo</span></div>
                <p className="text-xs text-muted-foreground mt-2">Unlock unlimited intelligence and chat features</p>
                <div className="h-px bg-primary/10 my-6" />
                <ul className="space-y-3 text-xs">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Unlimited active projects</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Full OpenAI API integration</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Drag-and-drop cloud storage</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Premium monthly analytics</li>
                </ul>
              </div>
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white mt-8 text-xs font-semibold shadow-md cursor-pointer"
              >
                Go Pro (Free Trial)
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="p-6 rounded-2xl bg-zinc-900/10 border border-white/5 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Enterprise</h4>
                <div className="text-3xl font-bold mt-2">Custom</div>
                <p className="text-xs text-muted-foreground mt-2">For custom scale, metrics, & load testing</p>
                <div className="h-px bg-white/5 my-6" />
                <ul className="space-y-3 text-xs">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Multi-region hosting</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Custom SLAs & 99.9% uptime</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Dedicated account manager</li>
                </ul>
              </div>
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full py-2.5 rounded-lg border border-white/10 hover:border-white/20 mt-8 text-xs font-semibold transition-colors cursor-pointer"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="px-6 md:px-12 py-20 border-t border-white/5 bg-zinc-950/40" id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqData.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-white/5 rounded-xl bg-zinc-900/10 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-4 px-6 flex items-center justify-between font-semibold text-left text-sm sm:text-base cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 text-xs sm:text-sm text-muted-foreground border-t border-white/5 pt-3 leading-relaxed animate-in slide-in-from-top duration-200">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="border-t border-white/5 py-12 px-6 md:px-12 bg-black/60 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-linear-to-tr from-brand-600 to-brand-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">ProjectFlow AI</span>
          </div>

          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>

          <p className="text-[10px] text-muted-foreground">
            © 2026 ProjectFlow AI. Design inspired by Linear, Notion, and Jira.
          </p>
        </div>
      </footer>
    </div>
  );
}
