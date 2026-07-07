'use client';

import React, { useState } from 'react';
import { useProjectFlowStore } from '@/store/projectStore';
import { 
  User as UserIcon, Settings as SettingsIcon, Bell, Shield, 
  Key, Globe, Check, Sparkles, AlertCircle, Save 
} from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
];

export default function SettingsPage() {
  const { currentUser, updateCurrentUser, theme, setTheme } = useProjectFlowStore();

  // Profile Form States
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar || AVATAR_OPTIONS[0]);

  // API Keys Form States
  const [groqKey, setGroqKey] = useState('');

  // Notification Preferences States
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefPush, setPrefPush] = useState(true);
  const [prefMention, setPrefMention] = useState(true);

  // Profile Submit Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      alert("Name and email are required!");
      return;
    }
    updateCurrentUser(profileName, profileEmail, selectedAvatar);
    alert("Profile configurations saved successfully!");
  };

  // API Key Submit Handler
  const handleSaveAPIKeys = (e: React.FormEvent) => {
    e.preventDefault();
    // In local state, we can write the API key to a public browser global or save it in localStorage
    if (typeof window !== 'undefined') {
      if (groqKey.trim() !== '') {
        localStorage.setItem('pf_groq_key', groqKey);
        // Expose to window so generateAIContent can retrieve it
        (window as any).NEXT_PUBLIC_GROQ_API_KEY = groqKey;
        alert("Groq API key saved. AI Insights will now make actual live requests!");
      } else {
        localStorage.removeItem('pf_groq_key');
        delete (window as any).NEXT_PUBLIC_GROQ_API_KEY;
        alert("API Key cleared. Reverting to high-fidelity AI simulation fallback.");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="text-xs md:text-sm text-muted-foreground font-medium">Configure profile attributes, choose visual themes, and activate intelligence API keys.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="space-y-1.5 shrink-0">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            <span>Profile & Security</span>
          </div>
          <div className="p-3 hover:bg-secondary/40 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 cursor-pointer">
            <SettingsIcon className="w-4 h-4" />
            <span>Workspace Configs</span>
          </div>
          <div className="p-3 hover:bg-secondary/40 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 cursor-pointer">
            <Bell className="w-4 h-4" />
            <span>Notifications preference</span>
          </div>
        </div>

        {/* Configurations Forms Content */}
        <div className="md:col-span-2 space-y-6 text-xs">
          
          {/* Profile Form */}
          <div className="p-5 rounded-2xl glass border border-border space-y-4">
            <h3 className="text-sm font-bold border-b border-border pb-3">User Profile</h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</label>
                  <input
                    required
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-secondary/35 border border-border text-xs focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</label>
                  <input
                    required
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-secondary/35 border border-border text-xs focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase block">Select User Avatar</label>
                <div className="flex gap-3">
                  {AVATAR_OPTIONS.map((img, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedAvatar(img)}
                      className={`relative w-10 h-10 rounded-full border-2 overflow-hidden cursor-pointer ${
                        selectedAvatar === img ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 py-2 px-5 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                Save Profile
              </button>
            </form>
          </div>

          {/* Theme Settings Panel */}
          <div className="p-5 rounded-2xl glass border border-border space-y-4">
            <h3 className="text-sm font-bold border-b border-border pb-3">Workspace Theme</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border flex flex-col justify-between h-20 text-left transition-all cursor-pointer ${
                  theme === 'dark' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-border bg-card/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="font-semibold text-xs">Linear Dark Mode</span>
                <span className="text-[10px] opacity-75">Deep space purple & black</span>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border flex flex-col justify-between h-20 text-left transition-all cursor-pointer ${
                  theme === 'light' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-border bg-card/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="font-semibold text-xs">Notion Light Mode</span>
                <span className="text-[10px] opacity-75">Clean white & soft grey grids</span>
              </button>
            </div>
          </div>

          {/* Groq Integration API Keys */}
          <div className="p-5 rounded-2xl glass border border-border space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3 justify-between">
              <h3 className="text-sm font-bold">Groq Integration Keys</h3>
              <div className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                <Key className="w-3 h-3 animate-pulse" />
                <span>Simulation Active</span>
              </div>
            </div>

            <form onSubmit={handleSaveAPIKeys} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">GROQ_API_KEY</label>
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-secondary/35 border border-border text-xs focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground font-mono"
                />
                <p className="text-[10px] text-muted-foreground leading-normal mt-1 flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                  Your key is stored client-side in this browser context only. Enter an actual key to activate live Groq llama-3.1-8b sprint breakdown queries.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 py-2 px-5 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  Activate Key
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGroqKey('');
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('pf_groq_key');
                      delete (window as any).NEXT_PUBLIC_GROQ_API_KEY;
                    }
                    alert("Cleared API Key. Reverted to AI simulation fallback.");
                  }}
                  className="py-2 px-4 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold"
                >
                  Clear Key
                </button>
              </div>
            </form>
          </div>

          {/* Preferences checkboxes */}
          <div className="p-5 rounded-2xl glass border border-border space-y-4">
            <h3 className="text-sm font-bold border-b border-border pb-3">Workspace Notifications Tray</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={prefEmail} 
                  onChange={() => setPrefEmail(!prefEmail)} 
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-secondary"
                />
                <div>
                  <p className="font-semibold text-foreground">Email Sprints Digest</p>
                  <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Send a weekly breakdown of completed task cards and open discussions.</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={prefPush} 
                  onChange={() => setPrefPush(!prefPush)} 
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-secondary"
                />
                <div>
                  <p className="font-semibold text-foreground">Desktop Push Notifications</p>
                  <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Trigger alert popups immediately when a card is assigned to you.</p>
                </div>
              </label>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
