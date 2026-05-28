import { useState, useMemo, useRef, useCallback } from 'react';
import {
  LayoutList, LayoutGrid, Kanban as KanbanIcon,
  Plus, Search, Send, Tag, CalendarDays, Zap, CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../store';
import type { Task, Status, Priority, Category } from '../types';
import TaskList   from './TaskList';
import KanbanView from './KanbanView';
import TaskForm   from './TaskForm';
import CustomDropdown from './CustomDropdown';

// ─── Priority colour for Zap icon in quick-bar ─────────────────────────────
const PRIORITY_COLORS: Record<Priority, string> = {
  high: '#EF4444', medium: '#F59E0B', low: '#10B981',
};

export default function TasksView() {
  const { state, actions } = useStore();

  const [isFormOpen,  setIsFormOpen]  = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  // ─── Filters ──────────────────────────────────────────────
  const [statusFilter,   setStatusFilter]   = useState<Status   | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [searchQuery,    setSearchQuery]    = useState('');

  // ─── Quick-Add bar state ───────────────────────────────────
  const [quickTitle,    setQuickTitle]    = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');
  const [quickCategory, setQuickCategory] = useState<Category>('Work');
  const [quickDueDate,  setQuickDueDate]  = useState(() => new Date().toISOString().split('T')[0]);
  const [quickFocused,  setQuickFocused]  = useState(false);
  const [quickPriorityOpen, setQuickPriorityOpen] = useState(false);
  const [quickCategoryOpen, setQuickCategoryOpen] = useState(false);
  const quickInputRef = useRef<HTMLInputElement>(null);
  const quickDateInputRef = useRef<HTMLInputElement>(null);

  const isQuickBarActive = quickFocused || !!quickTitle || quickPriorityOpen || quickCategoryOpen;

  // ─── Filtered + sorted tasks ───────────────────────────────
  const filteredTasks = useMemo(() =>
    state.tasks
      .filter((t) => {
        if (statusFilter   !== 'all' && t.status   !== statusFilter)   return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [state.tasks, statusFilter, priorityFilter, categoryFilter, searchQuery]
  );

  // ─── Handlers ──────────────────────────────────────────────
  const handleEdit   = useCallback((task: Task) => { setEditingTask(task); setIsFormOpen(true); }, []);
  const handleCreate = useCallback(() => { setEditingTask(undefined); setIsFormOpen(true); }, []);

  const handleSave = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) actions.updateTask(editingTask.id, taskData);
    else             actions.addTask(taskData);
  }, [editingTask, actions]);

  const handleToggleComplete = useCallback((id: string) => {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    actions.updateTask(id, { status: task.status === 'completed' ? 'todo' : 'completed' });
  }, [state.tasks, actions]);

  const handleMove = useCallback((id: string, newStatus: Status) => {
    actions.updateTask(id, { status: newStatus });
  }, [actions]);

  const handleDatePillClick = useCallback(() => {
    if (quickDateInputRef.current) {
      try {
        if (typeof quickDateInputRef.current.showPicker === 'function') {
          quickDateInputRef.current.showPicker();
        } else {
          quickDateInputRef.current.click();
        }
      } catch (err) {
        quickDateInputRef.current.focus();
      }
    }
  }, []);

  const handleQuickAdd = useCallback(() => {
    if (!quickTitle.trim()) { quickInputRef.current?.focus(); return; }
    actions.addTask({
      title:         quickTitle.trim(),
      description:   '',
      priority:      quickPriority,
      category:      quickCategory,
      dueDate:       quickDueDate,
      estimatedTime: 30,
      status:        'todo',
    });
    setQuickTitle('');
    setQuickPriority('medium');
    setQuickCategory('Work');
    setQuickDueDate(new Date().toISOString().split('T')[0]);
  }, [quickTitle, quickPriority, quickCategory, quickDueDate, actions]);

  // Shared style for filter controls
  const ctrlStyle = {
    backgroundColor: 'var(--color-surface-2)',
    borderColor:     'var(--color-border-subtle)',
    color:           'var(--color-text-primary)',
  };

  const viewMode = state.taskViewMode;

  return (
    <div className="animate-slide-up space-y-5">

      {/* ─── Page Header ──────────────────────────────── */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'var(--color-accent-soft)' }}
          >
            <CheckCircle2 className="h-6 w-6" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Tasks
            </h1>
            <p className="mt-0.5 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Manage your workload
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* ─── View Mode Toggle ─── */}
          <div
            className="flex items-center rounded-xl p-1"
            style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border-subtle)' }}
          >
            {(
              [
                { mode: 'list',   Icon: LayoutList,  label: 'List View'   },
                { mode: 'grid',   Icon: LayoutGrid,  label: 'Grid View'   },
                { mode: 'kanban', Icon: KanbanIcon,  label: 'Kanban View' },
              ] as const
            ).map(({ mode, Icon, label }) => (
              <button
                key={mode}
                id={`view-toggle-${mode}`}
                onClick={() => actions.setTaskViewMode(mode)}
                aria-label={`Switch to ${label}`}
                aria-pressed={viewMode === mode}
                title={label}
                className={clsx(
                  'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200',
                  viewMode === mode ? 'shadow-sm' : 'opacity-40 hover:opacity-70'
                )}
                style={{
                  backgroundColor: viewMode === mode ? 'var(--color-surface-1)' : 'transparent',
                  color:           viewMode === mode ? 'var(--color-accent)'    : 'var(--color-text-secondary)',
                }}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {/* ─── New Task Button ─── */}
          <button
            id="new-task-btn"
            onClick={handleCreate}
            className="flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 2px 8px rgba(74,107,83,0.25)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent-hover)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent)'; }}
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>
      </header>

      {/* ─── Filters ──────────────────────────────────── */}
      <div className="nb-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search tasks…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors"
              style={ctrlStyle}
            />
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <CustomDropdown
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as Status | 'all')}
              options={[
                { value: 'all',         label: 'All Statuses'  },
                { value: 'todo',        label: 'To Do'         },
                { value: 'in-progress', label: 'In Progress'   },
                { value: 'completed',   label: 'Completed'     },
              ]}
              triggerClassName="!bg-[var(--color-surface-2)] !border-[var(--color-border-subtle)] !text-[var(--color-text-primary)] hover:!border-black/15 dark:hover:!border-white/15"
            />

            <CustomDropdown
              value={priorityFilter}
              onChange={(v) => setPriorityFilter(v as Priority | 'all')}
              options={[
                { value: 'all',    label: 'All Priorities' },
                { value: 'low',    label: 'Low', icon: <Zap className="h-3 w-3" style={{ color: PRIORITY_COLORS.low }} /> },
                { value: 'medium', label: 'Medium', icon: <Zap className="h-3 w-3" style={{ color: PRIORITY_COLORS.medium }} /> },
                { value: 'high',   label: 'High', icon: <Zap className="h-3 w-3" style={{ color: PRIORITY_COLORS.high }} /> },
              ]}
              triggerClassName="!bg-[var(--color-surface-2)] !border-[var(--color-border-subtle)] !text-[var(--color-text-primary)] hover:!border-black/15 dark:hover:!border-white/15"
            />

            <CustomDropdown
              value={categoryFilter}
              onChange={(v) => setCategoryFilter(v as Category | 'all')}
              options={[
                { value: 'all',      label: 'All Categories' },
                { value: 'Work',     label: 'Work'           },
                { value: 'Personal', label: 'Personal'       },
                { value: 'Health',   label: 'Health'         },
                { value: 'Learning', label: 'Learning'       },
                { value: 'Finance',  label: 'Finance'        },
              ]}
              triggerClassName="!bg-[var(--color-surface-2)] !border-[var(--color-border-subtle)] !text-[var(--color-text-primary)] hover:!border-black/15 dark:hover:!border-white/15"
            />

            {(statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setCategoryFilter('all'); setSearchQuery(''); }}
                className="rounded-lg px-2 py-1 text-xs font-semibold hover:underline"
                style={{ color: 'var(--color-accent)' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Task count + view label ───────────────────── */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {filteredTasks.length} task{filteredTasks.length !== 1 && 's'}
        </span>
        <span className="text-xs capitalize" style={{ color: 'var(--color-text-muted)' }}>
          {viewMode} view
        </span>
      </div>

      {/* ─── Task Content Area ────────────────────────── */}
      {viewMode === 'kanban' ? (
        <KanbanView
          tasks={filteredTasks}
          onEdit={handleEdit}
          onDelete={(id) => actions.deleteTask(id)}
          onMove={handleMove}
        />
      ) : (
        <TaskList
          tasks={filteredTasks}
          viewMode={viewMode}
          onEdit={handleEdit}
          onComplete={handleToggleComplete}
          onDelete={(id) => actions.deleteTask(id)}
        />
      )}

      {/* ─── Floating Quick-Add Bar ───────────────────── */}
      {/*
        Key layout fix: use a fixed-width pill (min/max constrained) with
        flex-row. The title input has flex-1 min-w-0 to shrink. Controls
        are wrapped in a flex-shrink-0 container so they never get clipped.
        The date input has a fixed width so the browser picker aligns correctly.
      */}
      <div
        className={clsx(
          'floating-input-bar',
          isQuickBarActive && 'floating-input-bar--focused'
        )}
        // Stop click from bubbling in case it's inside a scroll container
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title — flex-1 min-w-0 so it shrinks gracefully */}
        <input
          ref={quickInputRef}
          id="quick-add-input"
          type="text"
          placeholder="Quick-add a task…"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          onFocus={() => setQuickFocused(true)}
          onBlur={() => setQuickFocused(false)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleQuickAdd(); }}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:font-normal"
          style={{ color: 'var(--color-text-primary)' }}
        />

        {/* Inline controls — shrink-0 so they never clip */}
        <div
          className={clsx(
            'flex shrink-0 items-center gap-1.5 transition-all duration-200',
            isQuickBarActive
              ? 'pointer-events-auto translate-x-0 opacity-100'
              : 'pointer-events-none translate-x-3 opacity-0'
          )}
        >
          {/* Priority */}
          <CustomDropdown
            value={quickPriority}
            onChange={(v) => setQuickPriority(v as Priority)}
            onOpenChange={setQuickPriorityOpen}
            options={[
              { value: 'low', label: 'Low', icon: <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: PRIORITY_COLORS.low }} /> },
              { value: 'medium', label: 'Medium', icon: <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: PRIORITY_COLORS.medium }} /> },
              { value: 'high', label: 'High', icon: <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: PRIORITY_COLORS.high }} /> },
            ]}
            size="sm"
            direction="up"
            triggerClassName="!bg-[var(--color-accent-soft)] !border-none !rounded-full !px-3 !py-1.5 hover:!bg-[var(--color-surface-2)]"
          />

          {/* Category */}
          <CustomDropdown
            value={quickCategory}
            onChange={(v) => setQuickCategory(v as Category)}
            onOpenChange={setQuickCategoryOpen}
            options={[
              { value: 'Work', label: 'Work' },
              { value: 'Personal', label: 'Personal' },
              { value: 'Health', label: 'Health' },
              { value: 'Learning', label: 'Learning' },
              { value: 'Finance', label: 'Finance' },
            ]}
            size="sm"
            direction="up"
            triggerClassName="!bg-[var(--color-surface-2)] !border-none !rounded-full !px-3 !py-1.5 hover:!bg-[var(--color-surface-1)]"
            labelPrefix={<Tag className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />}
          />

          {/* Due date
              - Fixed width avoids the native date picker from
                overflowing its pill parent.
              - color-scheme forces the native picker chrome to
                match the app theme on supported browsers.
          */}
          <label
            onClick={handleDatePillClick}
            className="quick-chip cursor-pointer"
            style={{ backgroundColor: 'var(--color-surface-2)' }}
          >
            <CalendarDays className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            <input
              ref={quickDateInputRef}
              type="date"
              value={quickDueDate}
              onChange={(e) => setQuickDueDate(e.target.value)}
              onFocus={() => setQuickFocused(true)}
              onBlur={() => setQuickFocused(false)}
              className="w-[84px] cursor-pointer bg-transparent text-[11px] font-semibold outline-none"
              style={{
                color:       'var(--color-text-secondary)',
                colorScheme: 'light dark',
              }}
            />
          </label>
        </div>

        {/* Send button — always visible but dims when no title */}
        <button
          id="quick-add-submit"
          onClick={handleQuickAdd}
          title="Add task (Enter)"
          className={clsx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white',
            'transition-all duration-200 active:scale-90',
            quickTitle.trim() ? 'opacity-100' : 'cursor-default opacity-35'
          )}
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {/* Task Form Modal */}
      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
