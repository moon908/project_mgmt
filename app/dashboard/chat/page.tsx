'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProjectFlowStore } from '@/store/projectStore';
import { 
  Hash, Send, Image, File, Paperclip, Smile, Users, 
  MessageSquare, Plus, PlusCircle, X, ChevronRight, CornerDownLeft 
} from 'lucide-react';
import { ChatRoom, ChatMessage } from '@/types';

export default function ChatPage() {
  const { 
    chatRooms, chatMessages, currentUser, users, 
    sendMessage, addReaction, createRoom 
  } = useProjectFlowStore();

  const [activeRoomId, setActiveRoomId] = useState<string>('r-general');
  const [inputText, setInputText] = useState('');
  const [showEmojisForMsg, setShowEmojisForMsg] = useState<string | null>(null);
  
  // Custom Room Modal fields
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<'channel' | 'dm'>('channel');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Typing simulator state
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const activeRoom = chatRooms.find(r => r.id === activeRoomId) || chatRooms[0];
  const roomMessages = chatMessages.filter(m => m.roomId === activeRoomId);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, activeRoomId]);

  // Simulate typing notification when a user sends a message
  useEffect(() => {
    // If the last message was sent by currentUser (John Doe), trigger typing indicator for a member
    const lastMsg = roomMessages[roomMessages.length - 1];
    if (lastMsg && lastMsg.sender.id === currentUser.id) {
      const otherMembers = activeRoom.members.filter(m => m.id !== currentUser.id);
      if (otherMembers.length > 0) {
        const typingPeer = otherMembers[Math.floor(Math.random() * otherMembers.length)];
        
        // Trigger typing state after 800ms
        const typeTimer = setTimeout(() => {
          setTypingUser(typingPeer.name);
          setIsTyping(true);
        }, 800);

        // Turn off typing state after 2000ms
        const offTimer = setTimeout(() => {
          setIsTyping(false);
        }, 2200);

        return () => {
          clearTimeout(typeTimer);
          clearTimeout(offTimer);
        };
      }
    }
  }, [chatMessages, activeRoomId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(activeRoomId, inputText);
    setInputText('');
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    createRoom(newRoomName, newRoomType, selectedMembers);
    
    setNewRoomName('');
    setSelectedMembers([]);
    setShowCreateModal(false);
  };

  const handleMemberToggle = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  // Preset emojis for reactions
  const EMOJIS = ['👍', '🔥', '❤️', '🚀', '👀', '🎉'];

  return (
    <div className="h-[calc(100vh-10rem)] border border-border bg-card/20 rounded-2xl overflow-hidden flex text-foreground max-w-7xl mx-auto shadow-sm">
      
      {/* Channels Sidebar List */}
      <div className="w-56 border-r border-border flex flex-col shrink-0 bg-[#0c0c0f]/60">
        
        {/* Sidebar Header */}
        <div className="h-12 border-b border-border/80 px-4 flex items-center justify-between bg-secondary/15">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Workspace Chat
          </span>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List Areas */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          
          {/* Channels */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase text-muted-foreground/70 px-2 block tracking-wider">CHANNELS</span>
            {chatRooms.filter(r => r.type === 'channel').map(room => (
              <button
                key={room.id}
                onClick={() => setActiveRoomId(room.id)}
                className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                  activeRoomId === room.id 
                    ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                <Hash className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{room.name}</span>
              </button>
            ))}
          </div>

          {/* DMs */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase text-muted-foreground/70 px-2 block tracking-wider">DIRECT MESSAGES</span>
            {chatRooms.filter(r => r.type === 'dm').map(room => (
              <button
                key={room.id}
                onClick={() => setActiveRoomId(room.id)}
                className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                  activeRoomId === room.id 
                    ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{room.name}</span>
                </div>
                {room.unreadCount && room.unreadCount > 0 ? (
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center">
                    {room.unreadCount}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Messaging Window */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        
        {/* Header toolbar */}
        <div className="h-12 border-b border-border/80 px-5 flex items-center justify-between bg-[#0a0a0d]/40">
          <div className="flex items-center gap-2 min-w-0">
            {activeRoom.type === 'channel' ? (
              <Hash className="w-4 h-4 text-primary shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            )}
            <h3 className="text-xs sm:text-sm font-bold truncate">{activeRoom.name}</h3>
            {activeRoom.description && (
              <span className="text-[10px] text-muted-foreground hidden md:inline-block border-l border-border/60 pl-2.5 truncate max-w-md">
                {activeRoom.description}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold">{activeRoom.members.length} members</span>
          </div>
        </div>

        {/* Messages scroll area */}
        <div 
          ref={scrollRef}
          className="flex-1 p-5 overflow-y-auto space-y-4 bg-black/10"
        >
          {roomMessages.map(msg => (
            <div 
              key={msg.id}
              className={`flex items-start gap-3 text-xs group relative ${
                msg.sender.id === currentUser.id ? 'justify-end' : ''
              }`}
            >
              {/* Profile Avatar (if not You) */}
              {msg.sender.id !== currentUser.id && (
                <img 
                  src={msg.sender.avatar} 
                  className="w-7 h-7 rounded-full border border-primary/10 object-cover shrink-0" 
                  alt="" 
                />
              )}

              <div className="space-y-1 max-w-[70%]">
                <div className={`flex items-baseline gap-1.5 ${msg.sender.id === currentUser.id ? 'justify-end' : ''}`}>
                  <span className="font-bold text-[10px]">{msg.sender.name}</span>
                  <span className="text-[8px] text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                {/* Message Box */}
                <div className={`p-3.5 rounded-2xl leading-relaxed text-[11px] sm:text-xs relative ${
                  msg.sender.id === currentUser.id
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-secondary border border-border/80 rounded-tl-none'
                }`}>
                  
                  {/* File message styling */}
                  {msg.type === 'file' ? (
                    <div className="flex items-center gap-2.5 bg-black/20 p-2 rounded-lg border border-white/5">
                      <File className="w-5 h-5 text-white" />
                      <div className="text-[10px] text-left">
                        <p className="font-bold truncate">{msg.fileName}</p>
                        <p className="text-muted-foreground/80 mt-0.5">{msg.fileSize}</p>
                      </div>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}

                  {/* Reaction drawer triggers */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-card border border-border p-0.5 rounded-lg shadow-lg z-10">
                    <button 
                      onClick={() => setShowEmojisForMsg(showEmojisForMsg === msg.id ? null : msg.id)}
                      className="p-1 hover:bg-secondary text-muted-foreground rounded cursor-pointer"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                    {showEmojisForMsg === msg.id && (
                      <div className="absolute bottom-6 right-0 bg-card border border-border p-1 rounded-lg flex gap-1 shadow-2xl">
                        {EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              addReaction(msg.id, emoji);
                              setShowEmojisForMsg(null);
                            }}
                            className="hover:scale-125 transition-transform text-xs"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reaction list tags */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className={`flex gap-1 flex-wrap mt-1 ${msg.sender.id === currentUser.id ? 'justify-end' : ''}`}>
                    {msg.reactions.map(rx => (
                      <button
                        key={rx.emoji}
                        onClick={() => addReaction(msg.id, rx.emoji)}
                        className="py-0.5 px-1.5 rounded-full bg-secondary border border-border text-[9px] font-bold flex items-center gap-1 hover:border-primary/40 cursor-pointer"
                      >
                        <span>{rx.emoji}</span>
                        <span>{rx.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile Avatar (if You) */}
              {msg.sender.id === currentUser.id && (
                <img 
                  src={msg.sender.avatar} 
                  className="w-7 h-7 rounded-full border border-primary/10 object-cover shrink-0" 
                  alt="" 
                />
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3 text-xs animate-pulse">
              <span className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] shrink-0 text-muted-foreground font-bold">
                T
              </span>
              <div className="p-3 bg-secondary/80 rounded-2xl rounded-tl-none border border-border/60">
                <span className="text-[10px] text-muted-foreground leading-relaxed flex items-center gap-1.5 font-medium">
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  {typingUser} is typing...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Text Input Panel */}
        <div className="p-4 border-t border-border shrink-0 bg-[#0a0a0d]/40 relative z-10">
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => {
                const mockFilesPresets = [
                  { name: 'Architecture_Spec_API.pdf', size: '1.2 MB', url: '#' },
                  { name: 'Wireframe_Review.png', size: '2.5 MB', url: '#' }
                ];
                const file = mockFilesPresets[Math.floor(Math.random() * mockFilesPresets.length)];
                sendMessage(activeRoomId, `Sent attachment file: ${file.name}`, { name: file.name, url: file.url, size: file.size });
                alert(`Uploaded and sent mock file: ${file.name}`);
              }}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground cursor-pointer"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            
            <input
              type="text"
              placeholder={`Send message to #${activeRoom.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 p-2.5 rounded-lg bg-secondary/30 border border-border text-xs focus:outline-none focus:border-primary placeholder:text-muted-foreground"
            />
            
            <button
              type="submit"
              className="p-2.5 rounded-lg bg-primary hover:bg-primary/95 text-white cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* CREATE ROOM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm glass-premium border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col text-foreground">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/15 shrink-0">
              <span className="font-semibold text-xs text-primary flex items-center gap-1">
                <PlusCircle className="w-4 h-4" />
                Create Chat Room
              </span>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Room Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. engineering-sync"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full p-2 bg-secondary border border-border rounded"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Type</label>
                <div className="flex gap-4 mt-1 bg-secondary/40 p-2 rounded border border-border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="roomType" 
                      checked={newRoomType === 'channel'} 
                      onChange={() => setNewRoomType('channel')} 
                    />
                    <span>Channel</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="roomType" 
                      checked={newRoomType === 'dm'} 
                      onChange={() => setNewRoomType('dm')} 
                    />
                    <span>Direct Message</span>
                  </label>
                </div>
              </div>

              {/* Member Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Add Members</label>
                <div className="grid grid-cols-2 gap-2 max-h-[100px] overflow-y-auto p-1.5 border border-border bg-secondary/15 rounded-lg">
                  {users.filter(u => u.id !== currentUser.id).map(user => (
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

              <div className="flex gap-2 justify-end pt-3 border-t border-border/60">
                <button type="button" onClick={() => setShowCreateModal(false)} className="py-2 px-4 rounded bg-secondary hover:bg-secondary/80 border border-border font-semibold">Cancel</button>
                <button type="submit" className="py-2 px-5 rounded bg-primary text-white font-bold hover:bg-primary/95">Create Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
