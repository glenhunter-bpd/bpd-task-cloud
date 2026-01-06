
export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface Note {
  id: string;
  content: string;
  author: string;
  authorId: string;
  timestamp: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  dependentTasks: string[];
  notes: Note[];
  program: string;
  assignedTo: string;
  assignedToId: string;
  priority: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate: string;
  status: TaskStatus;
  progress: number;
  updatedAt: string;
  updatedBy: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
}

export interface AppState {
  tasks: Task[];
  programs: Program[];
  users: User[];
  currentUser: User | null;
}
