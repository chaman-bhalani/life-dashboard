export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'completed';
export type Category = 'Work' | 'Personal' | 'Health' | 'Learning' | 'Finance';
export type ViewMode = 'list' | 'grid' | 'kanban';
export type Theme = 'light' | 'dark';
export type NavSection = 'dashboard' | 'tasks' | 'analytics' | 'quicklog';
export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string; // ISO date string
  estimatedTime: number; // in minutes
  status: Status;
  category: Category;
  createdAt: string;
  completedAt?: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string; // lucide icon name
  completions: Record<string, boolean>; // date string -> completed
}

export interface MoodEntry {
  date: string;
  level: MoodLevel;
}

export interface AppState {
  theme: Theme;
  activeSection: NavSection;
  taskViewMode: ViewMode;
  tasks: Task[];
  habits: Habit[];
  moods: MoodEntry[];
  scratchpad: string;
  sidebarCollapsed: boolean;
}

export interface AppActions {
  setTheme: (theme: Theme) => void;
  setActiveSection: (section: NavSection) => void;
  setTaskViewMode: (mode: ViewMode) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleHabit: (habitId: string, date: string) => void;
  updateHabitName: (habitId: string, name: string) => void;
  logMood: (level: MoodLevel) => void;
  setScratchpad: (text: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}
