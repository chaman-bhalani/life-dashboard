import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppActions, Task, MoodLevel, ViewMode, Theme, NavSection } from './types';
import { generateInitialState } from './mockData';

const STORAGE_KEY = 'life-dashboard-state';

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return generateInitialState();
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

type Action =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_ACTIVE_SECTION'; payload: NavSection }
  | { type: 'SET_TASK_VIEW_MODE'; payload: ViewMode }
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_HABIT'; payload: { habitId: string; date: string } }
  | { type: 'UPDATE_HABIT_NAME'; payload: { habitId: string; name: string } }
  | { type: 'LOG_MOOD'; payload: MoodLevel }
  | { type: 'SET_SCRATCHPAD'; payload: string }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };
    case 'SET_TASK_VIEW_MODE':
      return { ...state, taskViewMode: action.payload };
    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.payload,
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
      };
      return { ...state, tasks: [newTask, ...state.tasks] };
    }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? {
                ...t,
                ...action.payload.updates,
                ...(action.payload.updates.status === 'completed' && !t.completedAt
                  ? { completedAt: new Date().toISOString() }
                  : {}),
              }
            : t
        ),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };
    case 'TOGGLE_HABIT':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.payload.habitId
            ? {
                ...h,
                completions: {
                  ...h.completions,
                  [action.payload.date]: !h.completions[action.payload.date],
                },
              }
            : h
        ),
      };
    case 'UPDATE_HABIT_NAME':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.payload.habitId ? { ...h, name: action.payload.name } : h
        ),
      };
    case 'LOG_MOOD': {
      const today = new Date().toISOString().split('T')[0];
      const existing = state.moods.findIndex((m) => m.date === today);
      const newMoods = [...state.moods];
      if (existing >= 0) {
        newMoods[existing] = { date: today, level: action.payload };
      } else {
        newMoods.unshift({ date: today, level: action.payload });
      }
      return { ...state, moods: newMoods };
    }
    case 'SET_SCRATCHPAD':
      return { ...state, scratchpad: action.payload };
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload };
    default:
      return state;
  }
}

interface StoreContextValue {
  state: AppState;
  actions: AppActions;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const actions: AppActions = {
    setTheme: useCallback((theme: Theme) => dispatch({ type: 'SET_THEME', payload: theme }), []),
    setActiveSection: useCallback((section: NavSection) => dispatch({ type: 'SET_ACTIVE_SECTION', payload: section }), []),
    setTaskViewMode: useCallback((mode: ViewMode) => dispatch({ type: 'SET_TASK_VIEW_MODE', payload: mode }), []),
    addTask: useCallback((task: Omit<Task, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_TASK', payload: task }), []),
    updateTask: useCallback((id: string, updates: Partial<Task>) => dispatch({ type: 'UPDATE_TASK', payload: { id, updates } }), []),
    deleteTask: useCallback((id: string) => dispatch({ type: 'DELETE_TASK', payload: id }), []),
    toggleHabit: useCallback((habitId: string, date: string) => dispatch({ type: 'TOGGLE_HABIT', payload: { habitId, date } }), []),
    updateHabitName: useCallback((habitId: string, name: string) => dispatch({ type: 'UPDATE_HABIT_NAME', payload: { habitId, name } }), []),
    logMood: useCallback((level: MoodLevel) => dispatch({ type: 'LOG_MOOD', payload: level }), []),
    setScratchpad: useCallback((text: string) => dispatch({ type: 'SET_SCRATCHPAD', payload: text }), []),
    setSidebarCollapsed: useCallback((collapsed: boolean) => dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed }), []),
  };

  return (
    <StoreContext.Provider value={{ state, actions }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
