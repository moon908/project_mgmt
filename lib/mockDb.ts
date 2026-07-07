import { 
  User, Project, Task, ChatRoom, ChatMessage, 
  AppNotification, ActivityLog, CalendarEvent, TaskStatus, TaskPriority, ProjectStatus, ProjectPriority
} from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'u-1', name: 'Sarah Chen', email: 'sarah.c@projectflow.ai', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'ADMIN', status: 'online' },
  { id: 'u-2', name: 'Alex Rivera', email: 'alex.r@projectflow.ai', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'DEVELOPER', status: 'online' },
  { id: 'u-3', name: 'Sophia Martinez', email: 'sophia.m@projectflow.ai', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', role: 'MANAGER', status: 'away' },
  { id: 'u-4', name: 'Marcus Vance', email: 'marcus.v@projectflow.ai', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', role: 'TESTER', status: 'busy' },
  { id: 'u-5', name: 'Emily Watts', email: 'emily.w@projectflow.ai', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', role: 'VIEWER', status: 'offline' },
  { id: 'u-current', name: 'John Doe (You)', email: 'john.doe@projectflow.ai', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', role: 'OWNER', status: 'online' }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p-1',
    name: 'ProjectFlow AI SaaS Launch',
    description: 'Design, develop, and deploy the next generation AI-powered project management platform with real-time sync, Gantt charts, and intelligent suggestions.',
    status: 'active',
    priority: 'critical',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    tags: ['SaaS', 'AI', 'Next.js 15', 'Framer Motion'],
    members: [INITIAL_USERS[5], INITIAL_USERS[0], INITIAL_USERS[1], INITIAL_USERS[2], INITIAL_USERS[3]],
    progress: 68
  },
  {
    id: 'p-2',
    name: 'ProjectFlow Mobile App (iOS & Android)',
    description: 'React Native companion app supporting notifications, quick dashboard updates, offline-first notes, and team chat on mobile.',
    status: 'planning',
    priority: 'high',
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 25 days from now
    coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    tags: ['Mobile', 'React Native', 'Offline-First'],
    members: [INITIAL_USERS[5], INITIAL_USERS[1], INITIAL_USERS[2]],
    progress: 15
  },
  {
    id: 'p-3',
    name: 'Core Serverless Infrastructure Migration',
    description: 'Migrating legacy backend services to AWS Lambda and Cloudflare Workers to improve latency, reduce operational cost, and scale globally.',
    status: 'on_hold',
    priority: 'medium',
    dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    tags: ['DevOps', 'AWS', 'Scale'],
    members: [INITIAL_USERS[5], INITIAL_USERS[1]],
    progress: 45
  }
];

export const INITIAL_TASKS: Task[] = [
  // ProjectFlow AI SaaS Launch (p-1)
  {
    id: 't-1',
    projectId: 'p-1',
    title: 'Design Premium Glassmorphism Dashboard UI',
    description: 'Create high-fidelity mockups and layout for the dashboard focusing on Linear-inspired gradients, borders, micro-animations, and responsive cards.',
    status: 'review',
    priority: 'high',
    storyPoints: 5,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignee: INITIAL_USERS[2], // Sophia
    labels: ['Design', 'UI/UX'],
    subtasks: [
      { id: 's-1', title: 'Create layout grid system', completed: true },
      { id: 's-2', title: 'Define custom color palette', completed: true },
      { id: 's-3', title: 'Design Glassmorphism cards', completed: true },
      { id: 's-4', title: 'Export assets to Figma', completed: false }
    ],
    timeSpent: 280,
    estimatedTime: 360,
    comments: [
      {
        id: 'c-1',
        taskId: 't-1',
        userId: 'u-1',
        userName: 'Sarah Chen',
        userAvatar: INITIAL_USERS[0].avatar,
        content: 'Sophia, these mockups look absolutely stunning! Can we make sure the borders have a soft white/10 overlay in dark mode to really pop?',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'c-2',
        taskId: 't-1',
        userId: 'u-3',
        userName: 'Sophia Martinez',
        userAvatar: INITIAL_USERS[2].avatar,
        content: '@Sarah Yes! I just applied that border style. Check it out on the active board. It glows beautifully against the dark mesh background.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 't-2',
    projectId: 'p-1',
    title: 'Configure Next.js 15 App Router & Database Clients',
    description: 'Initialize Next.js 15 repository structure, compile tsconfig rules, setup Prisma PostgreSQL schema, and prepare the local state manager fallback.',
    status: 'completed',
    priority: 'urgent',
    storyPoints: 3,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignee: INITIAL_USERS[1], // Alex
    labels: ['Backend', 'Database'],
    subtasks: [
      { id: 's-5', title: 'Setup tsconfig and package versions', completed: true },
      { id: 's-6', title: 'Implement folder structure (app, components, features)', completed: true },
      { id: 's-7', title: 'Draft schema.prisma model bindings', completed: true },
      { id: 's-8', title: 'Initialize database connection test', completed: true }
    ],
    timeSpent: 180,
    estimatedTime: 180,
    comments: []
  },
  {
    id: 't-3',
    projectId: 'p-1',
    title: 'Implement Interactive Kanban Drag-and-Drop Board',
    description: 'Implement a draggable kanban board allowing cards to move smoothly between columns. Columns should represent Backlog, Todo, In Progress, Review, Testing, Completed.',
    status: 'in_progress',
    priority: 'high',
    storyPoints: 8,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignee: INITIAL_USERS[5], // You
    labels: ['Frontend', 'Feature'],
    subtasks: [
      { id: 's-9', title: 'Build basic Column design structure', completed: true },
      { id: 's-10', title: 'Implement HTML5 drag events', completed: true },
      { id: 's-11', title: 'Hook drop actions into state manager', completed: false },
      { id: 's-12', title: 'Add Framer Motion transition animations', completed: false }
    ],
    timeSpent: 320,
    estimatedTime: 480,
    comments: []
  },
  {
    id: 't-4',
    projectId: 'p-1',
    title: 'Integrate OpenAI Workspace API & Simulation Fallbacks',
    description: 'Create Next.js Server Actions connecting to the OpenAI API key endpoints to generate project roadmaps, user stories, task divisions, and weekly reviews. Gracefully simulate details if API keys are not supplied.',
    status: 'todo',
    priority: 'urgent',
    storyPoints: 5,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignee: INITIAL_USERS[5], // You
    labels: ['AI', 'API'],
    subtasks: [
      { id: 's-13', title: 'Setup AI controller route handler', completed: false },
      { id: 's-14', title: 'Draft prompts for sprint suggestions', completed: false },
      { id: 's-15', title: 'Design high-fidelity simulator templates', completed: false }
    ],
    timeSpent: 0,
    estimatedTime: 300,
    comments: []
  },
  {
    id: 't-5',
    projectId: 'p-1',
    title: 'Security and Auth Provider Integration',
    description: 'Build robust route protection middleware, custom login screens, password recovery flows, and Google OAuth credentials bindings using Auth.js.',
    status: 'todo',
    priority: 'medium',
    storyPoints: 5,
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignee: INITIAL_USERS[1], // Alex
    labels: ['Security', 'Auth'],
    subtasks: [
      { id: 's-16', title: 'Configure custom session model', completed: false },
      { id: 's-17', title: 'Create Login UI page with animations', completed: false }
    ],
    timeSpent: 0,
    estimatedTime: 240,
    comments: []
  },
  {
    id: 't-6',
    projectId: 'p-1',
    title: 'Comprehensive QA Unit Testing & Load Scenarios',
    description: 'Perform strict checks across task lists, notifications, chat messaging speeds, and drag capabilities to align with WCAG accessibility guidelines.',
    status: 'testing',
    priority: 'medium',
    storyPoints: 3,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignee: INITIAL_USERS[3], // Marcus
    labels: ['QA', 'Testing'],
    subtasks: [
      { id: 's-18', title: 'Run accessibility audits', completed: true },
      { id: 's-19', title: 'Write board transition tests', completed: false }
    ],
    timeSpent: 90,
    estimatedTime: 180,
    comments: []
  },

  // ProjectFlow Mobile App (p-2)
  {
    id: 't-7',
    projectId: 'p-2',
    title: 'Wireframe Mobile Dashboard and Task Views',
    description: 'Draft designs optimized for mobile viewports, including quick card swipe interactions, simplified chat tabs, and push alerts config.',
    status: 'todo',
    priority: 'medium',
    storyPoints: 3,
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignee: INITIAL_USERS[2], // Sophia
    labels: ['Design', 'Mobile'],
    subtasks: [],
    timeSpent: 0,
    estimatedTime: 120,
    comments: []
  },
  {
    id: 't-8',
    projectId: 'p-2',
    title: 'Setup Expo Boilerplate with TypeScript Configuration',
    description: 'Create base repository, setup tsconfig rules, clean default files, and configure Tailwind utility stylesheets.',
    status: 'backlog',
    priority: 'low',
    storyPoints: 2,
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignee: INITIAL_USERS[1], // Alex
    labels: ['Backend', 'Mobile'],
    subtasks: [],
    timeSpent: 0,
    estimatedTime: 120,
    comments: []
  }
];

export const INITIAL_ROOMS: ChatRoom[] = [
  { id: 'r-general', name: 'general', description: 'Workspace-wide announcements, banter, and general discussion.', type: 'channel', members: INITIAL_USERS },
  { id: 'r-dev', name: 'development', description: 'Technical discussions, merge request review, deployment logs, and API designs.', type: 'channel', members: [INITIAL_USERS[5], INITIAL_USERS[1], INITIAL_USERS[0], INITIAL_USERS[3]] },
  { id: 'r-design', name: 'design', description: 'UI/UX inspiration, Figma feedback, color palettes, and copywriting suggestions.', type: 'channel', members: [INITIAL_USERS[5], INITIAL_USERS[2], INITIAL_USERS[0]] },
  { id: 'r-dm-sarah', name: 'Sarah Chen', type: 'dm', members: [INITIAL_USERS[5], INITIAL_USERS[0]], unreadCount: 1 },
  { id: 'r-dm-alex', name: 'Alex Rivera', type: 'dm', members: [INITIAL_USERS[5], INITIAL_USERS[1]] }
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    roomId: 'r-dev',
    sender: INITIAL_USERS[1], // Alex
    content: 'Just initialized the Next.js 15 boilerplate! Let me know if you run into any dependency issues during the compilation step. Tailwind v4 feels lightning fast.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    reactions: [{ emoji: '🔥', count: 3, users: ['u-1', 'u-3', 'u-current'] }]
  },
  {
    id: 'm-2',
    roomId: 'r-dev',
    sender: INITIAL_USERS[2], // Sophia
    content: 'Awesome job Alex! I am currently exporting the Figma components and styling guides. I will post a preview of the main dashboard UI in the #design channel in a bit.',
    timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    reactions: [{ emoji: '👍', count: 2, users: ['u-2', 'u-current'] }]
  },
  {
    id: 'm-3',
    roomId: 'r-dev',
    sender: INITIAL_USERS[1], // Alex
    content: 'Perfect. I will prepare the API routes for OpenAI suggestions, so we can wire that up as soon as the design layout goes in.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'm-4',
    roomId: 'r-design',
    sender: INITIAL_USERS[2], // Sophia
    content: 'Here is the landing page hero card idea. I was thinking of using a beautiful glassmorphism aesthetic with floating project widgets.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    type: 'file',
    fileName: 'hero_preview_dark.png',
    fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    fileSize: '1.4 MB'
  },
  {
    id: 'm-5',
    roomId: 'r-dm-sarah',
    sender: INITIAL_USERS[0], // Sarah
    content: 'Hey John, do you have a few minutes to jump on a standup today? I want to align on the AI sprint plan feature scope so we can demo it next Tuesday.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    title: 'Task Assigned',
    message: 'Sarah Chen assigned you to "Integrate OpenAI Workspace API & Simulation Fallbacks".',
    type: 'task_assigned',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    projectId: 'p-1',
    taskId: 't-4'
  },
  {
    id: 'n-2',
    title: 'Mentioned in comment',
    message: 'Sophia Martinez tagged you in "Design Premium Glassmorphism Dashboard UI": "@Sarah Yes! I just applied that border style..."',
    type: 'mention',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    projectId: 'p-1',
    taskId: 't-1'
  },
  {
    id: 'n-3',
    title: 'Upcoming Deadline',
    message: 'The deadline for ProjectFlow AI SaaS Launch is in 5 days.',
    type: 'deadline',
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    projectId: 'p-1'
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  { id: 'act-1', userId: 'u-2', userName: 'Alex Rivera', userAvatar: INITIAL_USERS[1].avatar, action: 'completed task', targetName: 'Configure Next.js 15 App Router & Database Clients', targetType: 'task', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'act-2', userId: 'u-3', userName: 'Sophia Martinez', userAvatar: INITIAL_USERS[2].avatar, action: 'added comment to', targetName: 'Design Premium Glassmorphism Dashboard UI', targetType: 'comment', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'act-3', userId: 'u-1', userName: 'Sarah Chen', userAvatar: INITIAL_USERS[0].avatar, action: 'created project', targetName: 'ProjectFlow Mobile App (iOS & Android)', targetType: 'project', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'act-4', userId: 'u-current', userName: 'You', userAvatar: INITIAL_USERS[5].avatar, action: 'moved task to In Progress', targetName: 'Implement Interactive Kanban Drag-and-Drop Board', targetType: 'task', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() }
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'e-1',
    title: 'Sprint 1 Standup Meeting',
    description: 'Sync on blocker cards, design exports, and repo layouts.',
    start: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(), // today
    end: new Date(Date.now() + 10.5 * 60 * 60 * 1000).toISOString(),
    type: 'meeting',
    projectId: 'p-1'
  },
  {
    id: 'e-2',
    title: 'Task Due: Premium Dashboard Design UI',
    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    type: 'task',
    projectId: 'p-1',
    taskId: 't-1',
    assignee: INITIAL_USERS[2]
  },
  {
    id: 'e-3',
    title: 'AI Feature Review Meeting',
    description: 'Align on prompt parameters and UI outputs.',
    start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + (3 * 24 + 1) * 60 * 60 * 1000).toISOString(),
    type: 'meeting',
    projectId: 'p-1'
  },
  {
    id: 'e-4',
    title: 'SaaS Launch Milestone Alpha',
    description: 'Fully responsive build complete.',
    start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'milestone',
    projectId: 'p-1'
  }
];
