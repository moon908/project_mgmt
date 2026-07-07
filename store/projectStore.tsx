'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Project, Task, ChatRoom, ChatMessage, 
  AppNotification, ActivityLog, CalendarEvent, TaskStatus, TaskPriority, ProjectStatus
} from '../types';
import { 
  INITIAL_USERS, INITIAL_PROJECTS, INITIAL_TASKS, 
  INITIAL_ROOMS, INITIAL_MESSAGES, INITIAL_NOTIFICATIONS, 
  INITIAL_ACTIVITIES, INITIAL_EVENTS 
} from '../lib/mockDb';

interface ProjectStoreContextType {
  users: User[];
  projects: Project[];
  tasks: Task[];
  chatRooms: ChatRoom[];
  chatMessages: ChatMessage[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  calendarEvents: CalendarEvent[];
  currentUser: User;
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  
  // Mutations
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  updateCurrentUser: (name: string, email: string, avatar: string) => void;
  
  // Projects
  addProject: (project: Omit<Project, 'id' | 'progress' | 'members'> & { memberIds: string[] }) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'comments'>) => Task;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, status: TaskStatus) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addComment: (taskId: string, content: string) => void;
  
  // Chat
  sendMessage: (roomId: string, content: string, fileData?: { name: string; url: string; size: string }) => void;
  addReaction: (messageId: string, emoji: string) => void;
  createRoom: (name: string, type: 'channel' | 'dm', memberIds: string[]) => void;
  
  // Notifications
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  
  // Helpers
  logActivity: (action: string, targetName: string, targetType: ActivityLog['targetType'], projectId?: string) => void;
}

const ProjectStoreContext = createContext<ProjectStoreContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(INITIAL_ROOMS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[5]); // Default to "You"
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync state from localStorage on mount
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('pf_users');
      const storedProjects = localStorage.getItem('pf_projects');
      const storedTasks = localStorage.getItem('pf_tasks');
      const storedRooms = localStorage.getItem('pf_rooms');
      const storedMessages = localStorage.getItem('pf_messages');
      const storedNotifications = localStorage.getItem('pf_notifications');
      const storedActivities = localStorage.getItem('pf_activities');
      const storedEvents = localStorage.getItem('pf_events');
      const storedCurrentUser = localStorage.getItem('pf_current_user');
      const storedTheme = localStorage.getItem('pf_theme');

      if (storedUsers) setUsers(JSON.parse(storedUsers));
      if (storedProjects) setProjects(JSON.parse(storedProjects));
      if (storedTasks) setTasks(JSON.parse(storedTasks));
      if (storedRooms) setChatRooms(JSON.parse(storedRooms));
      if (storedMessages) setChatMessages(JSON.parse(storedMessages));
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
      if (storedActivities) setActivityLogs(JSON.parse(storedActivities));
      if (storedEvents) setCalendarEvents(JSON.parse(storedEvents));
      if (storedCurrentUser) setCurrentUser(JSON.parse(storedCurrentUser));
      if (storedTheme) {
        const parsedTheme = storedTheme as 'dark' | 'light';
        setThemeState(parsedTheme);
        document.documentElement.classList.toggle('light', parsedTheme === 'light');
      } else {
        document.documentElement.classList.remove('light'); // default dark theme
      }
    } catch (e) {
      console.error("Failed to load local state", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('pf_users', JSON.stringify(users));
    localStorage.setItem('pf_projects', JSON.stringify(projects));
    localStorage.setItem('pf_tasks', JSON.stringify(tasks));
    localStorage.setItem('pf_rooms', JSON.stringify(chatRooms));
    localStorage.setItem('pf_messages', JSON.stringify(chatMessages));
    localStorage.setItem('pf_notifications', JSON.stringify(notifications));
    localStorage.setItem('pf_activities', JSON.stringify(activityLogs));
    localStorage.setItem('pf_events', JSON.stringify(calendarEvents));
    localStorage.setItem('pf_current_user', JSON.stringify(currentUser));
    localStorage.setItem('pf_theme', theme);
  }, [users, projects, tasks, chatRooms, chatMessages, notifications, activityLogs, calendarEvents, currentUser, theme, isLoaded]);

  // Apply light class to document element
  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  // Helper: Log Activity
  const logActivity = (action: string, targetName: string, targetType: ActivityLog['targetType'], projectId?: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action,
      targetName,
      targetType,
      createdAt: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 100)); // cap at 100
  };

  // Helper: Update Profile
  const updateCurrentUser = (name: string, email: string, avatar: string) => {
    const updatedUser = { ...currentUser, name, email, avatar };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    logActivity('updated profile details for', name, 'member');
  };

  // Projects CRUD
  const addProject = (projectData: Omit<Project, 'id' | 'progress' | 'members'> & { memberIds: string[] }) => {
    const newProjectMembers = users.filter(u => projectData.memberIds.includes(u.id));
    const newProject: Project = {
      id: `p-${Date.now()}`,
      name: projectData.name,
      description: projectData.description,
      status: projectData.status,
      priority: projectData.priority,
      dueDate: projectData.dueDate,
      coverImage: projectData.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      tags: projectData.tags,
      members: newProjectMembers.length > 0 ? newProjectMembers : [currentUser],
      progress: 0
    };

    setProjects(prev => [newProject, ...prev]);

    // Create a calendar event for Project Deadline
    const newEvent: CalendarEvent = {
      id: `e-p-${newProject.id}`,
      title: `Project Deadline: ${newProject.name}`,
      start: newProject.dueDate,
      end: newProject.dueDate,
      type: 'milestone',
      projectId: newProject.id
    };
    setCalendarEvents(prev => [...prev, newEvent]);

    logActivity('created new project', newProject.name, 'project', newProject.id);
    return newProject;
  };

  const updateProject = (updatedProj: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
    logActivity('updated details of', updatedProj.name, 'project', updatedProj.id);
  };

  const deleteProject = (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    setCalendarEvents(prev => prev.filter(e => e.projectId !== id));
    logActivity('deleted project', proj.name, 'project');
  };

  // Tasks CRUD
  const addTask = (taskData: Omit<Task, 'id' | 'comments'>) => {
    const newTask: Task = {
      ...taskData,
      id: `t-${Date.now()}`,
      comments: []
    };

    setTasks(prev => [newTask, ...prev]);

    // Update Project Progress
    updateProjectProgress(taskData.projectId, [newTask, ...tasks]);

    // Add calendar event if task has due date
    if (taskData.dueDate) {
      const newEvent: CalendarEvent = {
        id: `e-t-${newTask.id}`,
        title: `Task Due: ${newTask.title}`,
        start: taskData.dueDate,
        end: taskData.dueDate,
        type: 'task',
        projectId: taskData.projectId,
        taskId: newTask.id,
        assignee: taskData.assignee
      };
      setCalendarEvents(prev => [...prev, newEvent]);
    }

    // Trigger Notification for Assignee (if not current user)
    if (taskData.assignee && taskData.assignee.id !== currentUser.id) {
      const newNotification: AppNotification = {
        id: `n-${Date.now()}`,
        title: 'Task Assigned',
        message: `${currentUser.name} assigned you to "${newTask.title}"`,
        type: 'task_assigned',
        isRead: false,
        createdAt: new Date().toISOString(),
        projectId: taskData.projectId,
        taskId: newTask.id
      };
      setNotifications(prev => [newNotification, ...prev]);
    }

    logActivity('created task', newTask.title, 'task', taskData.projectId);
    return newTask;
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    
    // Update calendar event
    setCalendarEvents(prev => prev.map(e => {
      if (e.taskId === updatedTask.id) {
        return {
          ...e,
          title: `Task Due: ${updatedTask.title}`,
          start: updatedTask.dueDate || e.start,
          end: updatedTask.dueDate || e.end,
          assignee: updatedTask.assignee
        };
      }
      return e;
    }));

    updateProjectProgress(updatedTask.projectId, tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    logActivity('updated task details for', updatedTask.title, 'task', updatedTask.projectId);
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    setCalendarEvents(prev => prev.filter(e => e.taskId !== id));
    updateProjectProgress(task.projectId, tasks.filter(t => t.id !== id));
    logActivity('deleted task', task.title, 'task', task.projectId);
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.status === newStatus) return;

    const oldStatus = task.status;
    const updatedTask = { ...task, status: newStatus };
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    updateProjectProgress(task.projectId, tasks.map(t => t.id === taskId ? updatedTask : t));

    // Log Activity
    const formattedOld = oldStatus.replace('_', ' ');
    const formattedNew = newStatus.replace('_', ' ');
    logActivity(
      `moved task "${task.title}" from ${formattedOld} to`,
      formattedNew,
      'task',
      task.projectId
    );
  };

  // Checklist / Subtasks
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map(s => 
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    }));
  };

  const addSubtask = (taskId: string, title: string) => {
    const newSub: any = {
      id: `s-${Date.now()}`,
      title,
      completed: false
    };
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, subtasks: [...t.subtasks, newSub] };
      }
      return t;
    }));
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) };
      }
      return t;
    }));
  };

  // Add Comment
  const addComment = (taskId: string, content: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newComment = {
      id: `c-${Date.now()}`,
      taskId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString()
    };

    const updatedTask = { ...task, comments: [...task.comments, newComment] };
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    logActivity(`commented on task`, task.title, 'comment', task.projectId);

    // Trigger Notification for Assignee (if comments from other)
    if (task.assignee && task.assignee.id !== currentUser.id) {
      const newNotification: AppNotification = {
        id: `n-${Date.now()}`,
        title: 'New Comment',
        message: `${currentUser.name} commented on "${task.title}": "${content.slice(0, 30)}..."`,
        type: 'comment',
        isRead: false,
        createdAt: new Date().toISOString(),
        projectId: task.projectId,
        taskId: task.id
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  // Chat Actions
  const sendMessage = (roomId: string, content: string, fileData?: { name: string; url: string; size: string }) => {
    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      roomId,
      sender: currentUser,
      content,
      timestamp: new Date().toISOString(),
      ...(fileData && {
        type: 'file',
        fileName: fileData.name,
        fileUrl: fileData.url,
        fileSize: fileData.size
      })
    };

    setChatMessages(prev => [...prev, newMessage]);

    // MOCK RESPONSE TIMER (to make chat feel alive!)
    if (content.startsWith('/') || content.includes('?') || Math.random() > 0.4) {
      const activeRoom = chatRooms.find(r => r.id === roomId);
      if (!activeRoom) return;

      // Find a sender who is not "You"
      const candidates = activeRoom.members.filter(u => u.id !== currentUser.id);
      if (candidates.length === 0) return;

      const randomSender = candidates[Math.floor(Math.random() * candidates.length)];
      
      setTimeout(() => {
        // Simple context replies
        let reply = "I'm on it! Let me double check and get back to you.";
        if (content.toLowerCase().includes('status')) {
          reply = "The current board looks solid, mostly waiting for testing reviews.";
        } else if (content.toLowerCase().includes('design')) {
          reply = "I think the rounded borders and neon highlights look great. Let's run a brief user study.";
        } else if (content.toLowerCase().includes('meeting') || content.toLowerCase().includes('standup')) {
          reply = "I will join the Zoom meeting link in the calendar. See you there!";
        } else if (content.toLowerCase().includes('lunch')) {
          reply = "Sounds good! Count me in.";
        }

        const replyMessage: ChatMessage = {
          id: `m-rep-${Date.now()}`,
          roomId,
          sender: randomSender,
          content: reply,
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, replyMessage]);

        // Add a notification for unread messages if rooms aren't focused
        const newNotify: AppNotification = {
          id: `n-m-${Date.now()}`,
          title: `New Chat in #${activeRoom.name}`,
          message: `${randomSender.name}: "${reply}"`,
          type: 'mention',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotify, ...prev]);
      }, 2000 + Math.random() * 2000); // 2-4 seconds delays
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    setChatMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const reactions = m.reactions || [];
        const index = reactions.findIndex(r => r.emoji === emoji);
        
        if (index > -1) {
          const rx = reactions[index];
          const hasUser = rx.users.includes(currentUser.id);
          const updatedUsers = hasUser 
            ? rx.users.filter(id => id !== currentUser.id)
            : [...rx.users, currentUser.id];
          
          const updatedReactions = [...reactions];
          if (updatedUsers.length === 0) {
            updatedReactions.splice(index, 1);
          } else {
            updatedReactions[index] = {
              ...rx,
              users: updatedUsers,
              count: updatedUsers.length
            };
          }
          return { ...m, reactions: updatedReactions };
        } else {
          return {
            ...m,
            reactions: [...reactions, { emoji, count: 1, users: [currentUser.id] }]
          };
        }
      }
      return m;
    }));
  };

  const createRoom = (name: string, type: 'channel' | 'dm', memberIds: string[]) => {
    const roomMembers = users.filter(u => memberIds.includes(u.id));
    const newRoom: ChatRoom = {
      id: `r-${Date.now()}`,
      name: name.toLowerCase().replace(/\s+/g, '-'),
      type,
      members: [...roomMembers, currentUser],
      unreadCount: 0
    };
    setChatRooms(prev => [...prev, newRoom]);
    logActivity('created chat room', `#${newRoom.name}`, 'member');
  };

  // Notifications
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Helper: Update Project Progress dynamically based on tasks status
  const updateProjectProgress = (projId: string, allTasks: Task[]) => {
    const projectTasks = allTasks.filter(t => t.projectId === projId);
    if (projectTasks.length === 0) return;

    const completed = projectTasks.filter(t => t.status === 'completed').length;
    const progressPercent = Math.round((completed / projectTasks.length) * 100);

    setProjects(prev => prev.map(p => {
      if (p.id === projId) {
        const newStatus: ProjectStatus = progressPercent === 100 ? 'completed' : p.status;
        return { ...p, progress: progressPercent, status: newStatus };
      }
      return p;
    }));
  };

  return (
    <ProjectStoreContext.Provider value={{
      users,
      projects,
      tasks,
      chatRooms,
      chatMessages,
      notifications,
      activityLogs,
      calendarEvents,
      currentUser,
      theme,
      sidebarOpen,
      setSidebarOpen,
      setTheme,
      updateCurrentUser,
      addProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      toggleSubtask,
      addSubtask,
      deleteSubtask,
      addComment,
      sendMessage,
      addReaction,
      createRoom,
      markAllNotificationsRead,
      clearNotifications,
      logActivity
    }}>
      {children}
    </ProjectStoreContext.Provider>
  );
}

export function useProjectFlowStore() {
  const context = useContext(ProjectStoreContext);
  if (context === undefined) {
    throw new Error('useProjectFlowStore must be used within a ProjectProvider');
  }
  return context;
}
