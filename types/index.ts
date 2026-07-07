export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'TESTER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  dueDate: string;
  coverImage?: string;
  tags: string[];
  members: User[];
  progress: number;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'testing' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  storyPoints?: number;
  dueDate?: string;
  assignee?: User;
  labels: string[];
  subtasks: Subtask[];
  comments: TaskComment[];
  timeSpent?: number; // in minutes
  estimatedTime?: number; // in minutes
  recurring?: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: User;
  content: string;
  timestamp: string;
  type?: 'text' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'channel' | 'dm';
  members: User[];
  unreadCount?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'task_assigned' | 'mention' | 'deadline' | 'project_update' | 'comment' | 'meeting';
  isRead: boolean;
  createdAt: string;
  projectId?: string;
  taskId?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string; // e.g. "created task", "moved card to In Progress"
  targetName: string; // e.g. "Setup OAuth"
  targetType: 'project' | 'task' | 'comment' | 'file' | 'member';
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  type: 'task' | 'meeting' | 'milestone';
  projectId?: string;
  taskId?: string;
  assignee?: User;
}

export interface WorkspaceTheme {
  id: string;
  name: string;
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
  textColor: string;
}
