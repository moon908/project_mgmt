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
  initializeOnboardedWorkspace?: (data: any) => void;
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
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[5]); 
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDbActive, setIsDbActive] = useState(false);

  // Sync state from APIs or localStorage on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const statusRes = await fetch('/api/status');
        const { dbConnected } = await statusRes.json();
        const mode = localStorage.getItem('pf_workspace_mode') || 'demo';
        
        if (dbConnected && mode === 'custom') {
          setIsDbActive(true);
          const [resProj, resTasks, resNotif, resActs, resEvents] = await Promise.all([
            fetch('/api/projects'),
            fetch('/api/tasks'),
            fetch(`/api/notifications?userId=${currentUser.id}`),
            fetch('/api/activities'),
            fetch(`/api/calendar?userId=${currentUser.id}`)
          ]);

          if (resProj.ok && resTasks.ok) {
            const dbProjects = await resProj.ok ? await resProj.json() : [];
            const dbTasks = await resTasks.ok ? await resTasks.json() : [];
            const dbNotif = await resNotif.ok ? await resNotif.json() : [];
            const dbActs = await resActs.ok ? await resActs.json() : [];
            const dbEvents = await resEvents.ok ? await resEvents.json() : [];

            if (dbProjects.length > 0) setProjects(dbProjects);
            if (dbTasks.length > 0) setTasks(dbTasks);
            if (dbNotif.length > 0) setNotifications(dbNotif);
            if (dbActs.length > 0) setActivityLogs(dbActs);
            if (dbEvents.length > 0) setCalendarEvents(dbEvents);
            
            setIsLoaded(true);
            return;
          }
        }
      } catch (err) {
        console.error("Database connection failed, using local simulation storage", err);
      }

      // LocalStorage fallback / custom data path
      try {
        const mode = localStorage.getItem('pf_workspace_mode') || 'demo';
        const isCustom = mode === 'custom';

        const storedUsers = localStorage.getItem(isCustom ? 'pf_custom_users' : 'pf_users');
        const storedProjects = localStorage.getItem(isCustom ? 'pf_custom_projects' : 'pf_projects');
        const storedTasks = localStorage.getItem(isCustom ? 'pf_custom_tasks' : 'pf_tasks');
        const storedRooms = localStorage.getItem(isCustom ? 'pf_custom_rooms' : 'pf_rooms');
        const storedMessages = localStorage.getItem(isCustom ? 'pf_custom_messages' : 'pf_messages');
        const storedNotifications = localStorage.getItem(isCustom ? 'pf_custom_notifications' : 'pf_notifications');
        const storedActivities = localStorage.getItem(isCustom ? 'pf_custom_activities' : 'pf_activities');
        const storedEvents = localStorage.getItem(isCustom ? 'pf_custom_events' : 'pf_events');
        const storedCurrentUser = localStorage.getItem(isCustom ? 'pf_custom_current_user' : 'pf_current_user');
        const storedTheme = localStorage.getItem('pf_theme');

        if (storedUsers) setUsers(JSON.parse(storedUsers));
        else if (isCustom) setUsers([]);

        if (storedProjects) setProjects(JSON.parse(storedProjects));
        else if (isCustom) setProjects([]);

        if (storedTasks) setTasks(JSON.parse(storedTasks));
        else if (isCustom) setTasks([]);

        if (storedRooms) setChatRooms(JSON.parse(storedRooms));
        else if (isCustom) setChatRooms([]);

        if (storedMessages) setChatMessages(JSON.parse(storedMessages));
        else if (isCustom) setChatMessages([]);

        if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
        else if (isCustom) setNotifications([]);

        if (storedActivities) setActivityLogs(JSON.parse(storedActivities));
        else if (isCustom) setActivityLogs([]);

        if (storedEvents) setCalendarEvents(JSON.parse(storedEvents));
        else if (isCustom) setCalendarEvents([]);

        if (storedCurrentUser) setCurrentUser(JSON.parse(storedCurrentUser));
        
        if (storedTheme) {
          const parsedTheme = storedTheme as 'dark' | 'light';
          setThemeState(parsedTheme);
          document.documentElement.classList.toggle('light', parsedTheme === 'light');
        } else {
          document.documentElement.classList.remove('light');
        }
      } catch (e) {
        console.error("Failed to load local state", e);
      }
      setIsLoaded(true);
    }

    loadInitialData();
  }, [currentUser.id]);

  // Save to localStorage whenever state changes (fallback / custom mode)
  useEffect(() => {
    if (!isLoaded || isDbActive) return;
    const mode = localStorage.getItem('pf_workspace_mode') || 'demo';
    const isCustom = mode === 'custom';
    
    const usersKey = isCustom ? 'pf_custom_users' : 'pf_users';
    const projectsKey = isCustom ? 'pf_custom_projects' : 'pf_projects';
    const tasksKey = isCustom ? 'pf_custom_tasks' : 'pf_tasks';
    const roomsKey = isCustom ? 'pf_custom_rooms' : 'pf_rooms';
    const messagesKey = isCustom ? 'pf_custom_messages' : 'pf_messages';
    const notificationsKey = isCustom ? 'pf_custom_notifications' : 'pf_notifications';
    const activitiesKey = isCustom ? 'pf_custom_activities' : 'pf_activities';
    const eventsKey = isCustom ? 'pf_custom_events' : 'pf_events';
    const currentUserKey = isCustom ? 'pf_custom_current_user' : 'pf_current_user';

    localStorage.setItem(usersKey, JSON.stringify(users));
    localStorage.setItem(projectsKey, JSON.stringify(projects));
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
    localStorage.setItem(roomsKey, JSON.stringify(chatRooms));
    localStorage.setItem(messagesKey, JSON.stringify(chatMessages));
    localStorage.setItem(notificationsKey, JSON.stringify(notifications));
    localStorage.setItem(activitiesKey, JSON.stringify(activityLogs));
    localStorage.setItem(eventsKey, JSON.stringify(calendarEvents));
    localStorage.setItem(currentUserKey, JSON.stringify(currentUser));
    localStorage.setItem('pf_theme', theme);
  }, [users, projects, tasks, chatRooms, chatMessages, notifications, activityLogs, calendarEvents, currentUser, theme, isLoaded, isDbActive]);

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
    setActivityLogs(prev => [newLog, ...prev].slice(0, 100));

    if (isDbActive) {
      fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          action,
          targetType,
          targetName,
          projectId,
          taskId: null
        })
      }).catch(err => console.error("Database sync failed", err));
    }
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
    const newProjId = `p-${Date.now()}`;
    const newProject: Project = {
      id: newProjId,
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

    if (isDbActive) {
      fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProject,
          workspaceId: 'w-default'
        })
      }).catch(err => console.error("Database sync failed", err));

      fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEvent,
          userId: currentUser.id
        })
      }).catch(err => console.error("Database sync failed", err));
    }

    return newProject;
  };

  const updateProject = (updatedProj: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
    logActivity('updated details of', updatedProj.name, 'project', updatedProj.id);

    if (isDbActive) {
      fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProj)
      }).catch(err => console.error("Database sync failed", err));
    }
  };

  const deleteProject = (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    setCalendarEvents(prev => prev.filter(e => e.projectId !== id));
    logActivity('deleted project', proj.name, 'project');

    if (isDbActive) {
      fetch(`/api/projects?id=${id}`, {
        method: 'DELETE'
      }).catch(err => console.error("Database sync failed", err));
    }
  };

  // Tasks CRUD
  const addTask = (taskData: Omit<Task, 'id' | 'comments'>) => {
    const newTaskId = `t-${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id: newTaskId,
      comments: []
    };

    setTasks(prev => [newTask, ...prev]);
    updateProjectProgress(taskData.projectId, [newTask, ...tasks]);

    // Add calendar event if task has due date
    let newEvent: CalendarEvent | null = null;
    if (taskData.dueDate) {
      newEvent = {
        id: `e-t-${newTask.id}`,
        title: `Task Due: ${newTask.title}`,
        start: taskData.dueDate,
        end: taskData.dueDate,
        type: 'task',
        projectId: taskData.projectId,
        taskId: newTask.id,
        assignee: taskData.assignee
      };
      setCalendarEvents(prev => [...prev, newEvent!]);
    }

    // Trigger Notification for Assignee
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

      if (isDbActive) {
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            userId: taskData.assignee.id,
            title: newNotification.title,
            message: newNotification.message,
            type: 'TASK_ASSIGNED',
            projectId: taskData.projectId,
            taskId: newTaskId
          })
        }).catch(err => console.error("Database sync failed", err));
      }
    }

    logActivity('created task', newTask.title, 'task', taskData.projectId);

    if (isDbActive) {
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          assigneeId: taskData.assignee?.id || null
        })
      }).catch(err => console.error("Database sync failed", err));

      if (newEvent) {
        fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newEvent,
            userId: currentUser.id
          })
        }).catch(err => console.error("Database sync failed", err));
      }
    }

    return newTask;
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    
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

    if (isDbActive) {
      fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedTask,
          assigneeId: updatedTask.assignee?.id || null
        })
      }).catch(err => console.error("Database sync failed", err));
    }
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    setCalendarEvents(prev => prev.filter(e => e.taskId !== id));
    updateProjectProgress(task.projectId, tasks.filter(t => t.id !== id));
    logActivity('deleted task', task.title, 'task', task.projectId);

    if (isDbActive) {
      fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE'
      }).catch(err => console.error("Database sync failed", err));
    }
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.status === newStatus) return;

    const oldStatus = task.status;
    const updatedTask = { ...task, status: newStatus };
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    updateProjectProgress(task.projectId, tasks.map(t => t.id === taskId ? updatedTask : t));

    const formattedOld = oldStatus.replace('_', ' ');
    const formattedNew = newStatus.replace('_', ' ');
    logActivity(
      `moved task "${task.title}" from ${formattedOld} to`,
      formattedNew,
      'task',
      task.projectId
    );

    if (isDbActive) {
      fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          status: newStatus
        })
      }).catch(err => console.error("Database sync failed", err));
    }
  };

  // Checklist / Subtasks
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    let finalSubtasks: any[] = [];
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        finalSubtasks = t.subtasks.map(s => 
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...t, subtasks: finalSubtasks };
      }
      return t;
    }));

    if (isDbActive) {
      fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          subtasks: finalSubtasks
        })
      }).catch(err => console.error("Database sync failed", err));
    }
  };

  const addSubtask = (taskId: string, title: string) => {
    const newSub: any = {
      id: `s-${Date.now()}`,
      title,
      completed: false
    };
    let finalSubtasks: any[] = [];
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        finalSubtasks = [...t.subtasks, newSub];
        return { ...t, subtasks: finalSubtasks };
      }
      return t;
    }));

    if (isDbActive) {
      fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          subtasks: finalSubtasks
        })
      }).catch(err => console.error("Database sync failed", err));
    }
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    let finalSubtasks: any[] = [];
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        finalSubtasks = t.subtasks.filter(s => s.id !== subtaskId);
        return { ...t, subtasks: finalSubtasks };
      }
      return t;
    }));

    if (isDbActive) {
      fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          subtasks: finalSubtasks
        })
      }).catch(err => console.error("Database sync failed", err));
    }
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

      if (isDbActive) {
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            userId: task.assignee.id,
            title: newNotification.title,
            message: newNotification.message,
            type: 'COMMENT',
            projectId: task.projectId,
            taskId: task.id
          })
        }).catch(err => console.error("Database sync failed", err));
      }
    }

    if (isDbActive) {
      fetch('/api/tasks/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          userId: currentUser.id,
          content
        })
      }).catch(err => console.error("Database sync failed", err));
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

    if (content.startsWith('/') || content.includes('?') || Math.random() > 0.4) {
      const activeRoom = chatRooms.find(r => r.id === roomId);
      if (!activeRoom) return;

      const candidates = activeRoom.members.filter(u => u.id !== currentUser.id);
      if (candidates.length === 0) return;

      const randomSender = candidates[Math.floor(Math.random() * candidates.length)];
      
      setTimeout(() => {
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

        const newNotify: AppNotification = {
          id: `n-m-${Date.now()}`,
          title: `New Chat in #${activeRoom.name}`,
          message: `${randomSender.name}: "${reply}"`,
          type: 'mention',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotify, ...prev]);

        if (isDbActive) {
          fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'create',
              userId: currentUser.id,
              title: newNotify.title,
              message: newNotify.message,
              type: 'MENTION'
            })
          }).catch(err => console.error("Database sync failed", err));
        }
      }, 2000 + Math.random() * 2000); 
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

    if (isDbActive) {
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_all_read',
          userId: currentUser.id
        })
      }).catch(err => console.error("Database sync failed", err));
    }
  };

  const clearNotifications = () => {
    setNotifications([]);

    if (isDbActive) {
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clear_all',
          userId: currentUser.id
        })
      }).catch(err => console.error("Database sync failed", err));
    }
  };

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

  const initializeOnboardedWorkspace = (data: {
    workspaceName: string;
    projectName: string;
    projectDesc: string;
    teammates: string[];
    taskTitle: string;
    taskPriority: string;
    taskAssigneeIndex: number;
  }) => {
    const newUsers: User[] = [
      { id: 'u-current', name: 'John Doe (You)', email: 'john.doe@projectflow.ai', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', role: 'ADMIN', status: 'online' }
    ];

    data.teammates.forEach((name, i) => {
      newUsers.push({
        id: `u-custom-${i + 1}`,
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@projectflow.ai`,
        avatar: `https://images.unsplash.com/photo-${1500648767791 + i}?w=150`,
        role: 'DEVELOPER',
        status: 'offline'
      });
    });

    const newProject: Project = {
      id: 'p-custom-1',
      name: data.projectName,
      description: data.projectDesc,
      status: 'active',
      priority: 'medium',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      tags: ['First Project'],
      members: newUsers,
      progress: 0
    };

    const assignedUser = newUsers[data.taskAssigneeIndex] || newUsers[0];
    const newStatus: TaskStatus = 'todo';
    const newTask: Task = {
      id: 't-custom-1',
      projectId: 'p-custom-1',
      title: data.taskTitle,
      description: 'Automatically initialized task from onboarding wizard.',
      status: newStatus,
      priority: data.taskPriority as any,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignee: assignedUser,
      labels: ['Setup'],
      subtasks: [],
      timeSpent: 0,
      estimatedTime: 120,
      comments: []
    };

    const newEvents: CalendarEvent[] = [
      {
        id: 'e-p-custom',
        title: `Project Deadline: ${newProject.name}`,
        start: newProject.dueDate,
        end: newProject.dueDate,
        type: 'milestone',
        projectId: newProject.id
      },
      {
        id: 'e-t-custom',
        title: `Task Due: ${newTask.title}`,
        start: newTask.dueDate || '',
        end: newTask.dueDate || '',
        type: 'task',
        projectId: newProject.id,
        taskId: newTask.id,
        assignee: assignedUser
      }
    ];

    const newLogs: ActivityLog[] = [
      {
        id: `act-${Date.now()}`,
        userId: 'u-current',
        userName: 'John Doe (You)',
        userAvatar: newUsers[0].avatar,
        action: 'created organization',
        targetName: data.workspaceName,
        targetType: 'member',
        createdAt: new Date().toISOString()
      },
      {
        id: `act-${Date.now() + 1}`,
        userId: 'u-current',
        userName: 'John Doe (You)',
        userAvatar: newUsers[0].avatar,
        action: 'created new project',
        targetName: newProject.name,
        targetType: 'project',
        createdAt: new Date().toISOString()
      }
    ];

    setUsers(newUsers);
    setProjects([newProject]);
    setTasks([newTask]);
    setChatRooms([
      { id: 'r-custom-1', name: 'general', type: 'channel', members: newUsers, unreadCount: 0 }
    ]);
    setChatMessages([]);
    setNotifications([]);
    setActivityLogs(newLogs);
    setCalendarEvents(newEvents);
    setCurrentUser(newUsers[0]);

    localStorage.setItem('pf_custom_users', JSON.stringify(newUsers));
    localStorage.setItem('pf_custom_projects', JSON.stringify([newProject]));
    localStorage.setItem('pf_custom_tasks', JSON.stringify([newTask]));
    localStorage.setItem('pf_custom_rooms', JSON.stringify([{ id: 'r-custom-1', name: 'general', type: 'channel', members: newUsers, unreadCount: 0 }]));
    localStorage.setItem('pf_custom_messages', JSON.stringify([]));
    localStorage.setItem('pf_custom_notifications', JSON.stringify([]));
    localStorage.setItem('pf_custom_activities', JSON.stringify(newLogs));
    localStorage.setItem('pf_custom_events', JSON.stringify(newEvents));
    localStorage.setItem('pf_custom_current_user', JSON.stringify(newUsers[0]));
    
    localStorage.setItem('pf_workspace_mode', 'custom');
    localStorage.setItem('pf_onboarded', 'true');
    setIsDbActive(false); 
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
      logActivity,
      initializeOnboardedWorkspace
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
