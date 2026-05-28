/**
 * src/store.tsx
 *
 * Global application state with Cloud Firestore real-time sync.
 *
 * Architecture:
 *   • Data collections (tasks, habits, moods, scratchpad) are persisted in
 *     Firestore and kept in sync via onSnapshot listeners.
 *   • UI-only preferences (theme, activeSection, taskViewMode, sidebarCollapsed)
 *     stay in localStorage — they are device-level settings, not user data.
 *   • All public action signatures are UNCHANGED so no component edits are needed.
 *
 * Security:
 *   • Every Firestore write injects { userId: user.uid } into the document.
 *   • Firestore Security Rules (firestore.rules) re-verify ownership on the server.
 *   • The user object is read from AuthContext — it cannot be spoofed client-side.
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { useAuth } from './contexts/AuthContext';
import type { AppState, AppActions, Task, Habit, MoodEntry, MoodLevel, ViewMode, Theme, NavSection } from './types';
import { generateInitialState } from './mockData';

// ─── localStorage keys (UI preferences only) ─────────────────────────────────
const PREFS_KEY = 'life-dashboard-prefs';

interface UIPrefs {
  theme: Theme;
  activeSection: NavSection;
  taskViewMode: ViewMode;
  sidebarCollapsed: boolean;
}

function loadPrefs(): Partial<UIPrefs> {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as Partial<UIPrefs>) : {};
  } catch {
    return {};
  }
}

function savePrefs(prefs: UIPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch { /* ignore quota errors */ }
}

// ─── Local reducer (handles UI state + transient data state) ─────────────────

type Action =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_ACTIVE_SECTION'; payload: NavSection }
  | { type: 'SET_TASK_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'SET_MOODS'; payload: MoodEntry[] }
  | { type: 'SET_SCRATCHPAD'; payload: string }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean };

function buildInitialState(): AppState {
  const saved = loadPrefs();
  const base  = generateInitialState();       // provides sane defaults (theme, viewMode…)
  return {
    ...base,
    // Overlay saved prefs on top of defaults.
    theme:           saved.theme           ?? base.theme,
    activeSection:   saved.activeSection   ?? base.activeSection,
    taskViewMode:    saved.taskViewMode    ?? base.taskViewMode,
    sidebarCollapsed: saved.sidebarCollapsed ?? base.sidebarCollapsed,
    // Data collections start empty; onSnapshot fills them once subscribed.
    tasks:     [],
    habits:    [],
    moods:     [],
    scratchpad: '',
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };
    case 'SET_TASK_VIEW_MODE':
      return { ...state, taskViewMode: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_HABITS':
      return { ...state, habits: action.payload };
    case 'SET_MOODS':
      return { ...state, moods: action.payload };
    case 'SET_SCRATCHPAD':
      return { ...state, scratchpad: action.payload };
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface StoreContextValue {
  state: AppState;
  actions: AppActions;
}

const StoreContext = createContext<StoreContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);

  // ── Persist UI prefs to localStorage whenever they change ──────────────────
  useEffect(() => {
    savePrefs({
      theme:           state.theme,
      activeSection:   state.activeSection,
      taskViewMode:    state.taskViewMode,
      sidebarCollapsed: state.sidebarCollapsed,
    });
  }, [state.theme, state.activeSection, state.taskViewMode, state.sidebarCollapsed]);

  // ── Apply theme class to <html> ──────────────────────────────────────────
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // ── Firestore real-time listeners ────────────────────────────────────────────
  // We collect all unsubscribe functions in a ref so they are cancelled when
  // the user signs out or the provider unmounts.
  const unsubscribeRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    // Tear down any existing listeners first.
    unsubscribeRef.current.forEach((fn) => fn());
    unsubscribeRef.current = [];

    if (!user) {
      // User signed out — clear data from state.
      dispatch({ type: 'SET_TASKS',     payload: [] });
      dispatch({ type: 'SET_HABITS',    payload: [] });
      dispatch({ type: 'SET_MOODS',     payload: [] });
      dispatch({ type: 'SET_SCRATCHPAD', payload: '' });
      return;
    }

    const uid = user.uid;

    // ── Tasks ──
    const tasksUnsub = onSnapshot(
      query(collection(db, 'tasks'), where('userId', '==', uid)),
      (snap) => {
        const tasks: Task[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id:            d.id,
            title:         data.title         as string,
            description:   data.description   as string,
            priority:      data.priority      as Task['priority'],
            dueDate:       data.dueDate       as string,
            estimatedTime: data.estimatedTime as number,
            status:        data.status        as Task['status'],
            category:      data.category      as Task['category'],
            createdAt:     data.createdAt     as string,
            completedAt:   data.completedAt   as string | undefined,
          };
        });
        // Sort by dueDate ascending (mirrors previous localStorage behaviour).
        tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        dispatch({ type: 'SET_TASKS', payload: tasks });
      },
      (err) => console.error('[Firestore] tasks listener error:', err)
    );

    // ── Habits ──
    const habitsUnsub = onSnapshot(
      query(collection(db, 'habits'), where('userId', '==', uid)),
      (snap) => {
        const habits: Habit[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id:          d.id,
            name:        data.name        as string,
            icon:        data.icon        as string,
            completions: (data.completions ?? {}) as Record<string, boolean>,
          };
        });
        dispatch({ type: 'SET_HABITS', payload: habits });
      },
      (err) => console.error('[Firestore] habits listener error:', err)
    );

    // ── Moods ──
    const moodsUnsub = onSnapshot(
      query(collection(db, 'moods'), where('userId', '==', uid)),
      (snap) => {
        const moods: MoodEntry[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            date:  data.date  as string,
            level: data.level as MoodEntry['level'],
          };
        });
        moods.sort((a, b) => b.date.localeCompare(a.date));
        dispatch({ type: 'SET_MOODS', payload: moods });
      },
      (err) => console.error('[Firestore] moods listener error:', err)
    );

    // ── Scratchpad (single doc per user, keyed by uid) ──
    const scratchUnsub = onSnapshot(
      doc(db, 'scratchpads', uid),
      (snap) => {
        if (snap.exists()) {
          dispatch({ type: 'SET_SCRATCHPAD', payload: snap.data().content as string });
        }
      },
      (err) => console.error('[Firestore] scratchpad listener error:', err)
    );

    unsubscribeRef.current = [tasksUnsub, habitsUnsub, moodsUnsub, scratchUnsub];

    return () => {
      unsubscribeRef.current.forEach((fn) => fn());
      unsubscribeRef.current = [];
    };
  }, [user]);

// Helper to strip any keys containing undefined values before sending to Firestore
function cleanData<T extends object>(obj: T): T {
  const clean: any = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== undefined) {
      clean[key] = val;
    }
  });
  return clean as T;
}

// ─── Actions ────────────────────────────────────────────────────────────────
// All signatures are IDENTICAL to the original store so no component changes are needed.

const actions: AppActions = {
  // ── UI preferences (localStorage only) ──
  setTheme: useCallback(
    (theme: Theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    []
  ),
  setActiveSection: useCallback(
    (section: NavSection) => dispatch({ type: 'SET_ACTIVE_SECTION', payload: section }),
    []
  ),
  setTaskViewMode: useCallback(
    (mode: ViewMode) => dispatch({ type: 'SET_TASK_VIEW_MODE', payload: mode }),
    []
  ),
  setSidebarCollapsed: useCallback(
    (collapsed: boolean) => dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed }),
    []
  ),

  // ── Tasks (Firestore) ──
  addTask: useCallback(
    async (task: Omit<Task, 'id' | 'createdAt'>) => {
      if (!user) return;
      try {
        const payload = cleanData({
          ...task,
          userId:    user.uid,
          createdAt: new Date().toISOString(),
        });
        await addDoc(collection(db, 'tasks'), payload);
      } catch (err) {
        console.error('[Firestore] addTask failed:', err);
      }
    },
    [user]
  ),

  updateTask: useCallback(
    async (id: string, updates: Partial<Task>) => {
      if (!user) return;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, createdAt: _ca, ...safeUpdates } = updates as Partial<Task> & { id?: string; createdAt?: string };
        // If status is being set to completed for the first time, stamp completedAt.
        const extra: Partial<Task> = {};
        if (updates.status === 'completed' && !state.tasks.find((t) => t.id === id)?.completedAt) {
          extra.completedAt = new Date().toISOString();
        }
        const payload = cleanData({ ...safeUpdates, ...extra });
        await updateDoc(doc(db, 'tasks', id), payload);
      } catch (err) {
        console.error('[Firestore] updateTask failed:', err);
      }
    },
    [user, state.tasks]
  ),

    deleteTask: useCallback(
      async (id: string) => {
        if (!user) return;
        try {
          await deleteDoc(doc(db, 'tasks', id));
        } catch (err) {
          console.error('[Firestore] deleteTask failed:', err);
        }
      },
      [user]
    ),

    // ── Habits (Firestore) ──
    addHabit: useCallback(
      async (name: string, icon: string) => {
        if (!user) return;
        try {
          await addDoc(collection(db, 'habits'), {
            name,
            icon,
            completions: {},
            userId: user.uid,
          });
        } catch (err) {
          console.error('[Firestore] addHabit failed:', err);
        }
      },
      [user]
    ),

    deleteHabit: useCallback(
      async (habitId: string) => {
        if (!user) return;
        try {
          await deleteDoc(doc(db, 'habits', habitId));
        } catch (err) {
          console.error('[Firestore] deleteHabit failed:', err);
        }
      },
      [user]
    ),

    toggleHabit: useCallback(
      async (habitId: string, date: string) => {
        if (!user) return;
        const habit = state.habits.find((h) => h.id === habitId);
        if (!habit) return;
        try {
          await updateDoc(doc(db, 'habits', habitId), {
            completions: {
              ...habit.completions,
              [date]: !habit.completions[date],
            },
          });
        } catch (err) {
          console.error('[Firestore] toggleHabit failed:', err);
        }
      },
      [user, state.habits]
    ),

    updateHabitName: useCallback(
      async (habitId: string, name: string) => {
        if (!user) return;
        try {
          await updateDoc(doc(db, 'habits', habitId), { name });
        } catch (err) {
          console.error('[Firestore] updateHabitName failed:', err);
        }
      },
      [user]
    ),

    // ── Mood (Firestore) ──
    logMood: useCallback(
      async (level: MoodLevel) => {
        if (!user) return;
        // Use local-timezone date (consistent with MoodLogger component)
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        // Optimistic local update so the emoji highlights immediately.
        const existing = state.moods.findIndex((m) => m.date === dateStr);
        const optimisticMoods = [...state.moods];
        if (existing >= 0) {
          optimisticMoods[existing] = { date: dateStr, level };
        } else {
          optimisticMoods.unshift({ date: dateStr, level });
        }
        dispatch({ type: 'SET_MOODS', payload: optimisticMoods });

        // Document ID format enforced by security rules: uid_YYYY-MM-DD
        const moodId = `${user.uid}_${dateStr}`;
        try {
          await setDoc(doc(db, 'moods', moodId), {
            userId: user.uid,
            date:   dateStr,
            level,
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } catch (err) {
          console.error('[Firestore] logMood failed:', err);
        }
      },
      [user, state.moods]
    ),

    // ── Scratchpad (Firestore) ──
    setScratchpad: useCallback(
      async (text: string) => {
        if (!user) return;
        // Optimistic local update so the textarea feels instant.
        dispatch({ type: 'SET_SCRATCHPAD', payload: text });
        try {
          await setDoc(
            doc(db, 'scratchpads', user.uid),
            { content: text, userId: user.uid, updatedAt: serverTimestamp() },
            { merge: true }
          );
        } catch (err) {
          console.error('[Firestore] setScratchpad failed:', err);
        }
      },
      [user]
    ),
  };

  return (
    <StoreContext.Provider value={{ state, actions }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
}

/**
 * Convenience hook to sign out the current user.
 * Clears all Firestore listeners via the useEffect cleanup in StoreProvider.
 */
export function useSignOut(): () => Promise<void> {
  return useCallback(() => signOut(auth), []);
}
