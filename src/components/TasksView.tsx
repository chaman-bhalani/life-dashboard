import { useState, useMemo } from 'react';
import { LayoutList, Kanban, Plus, Search, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../store';
import type { Task, Status, Priority, Category, ViewMode } from '../types';
import TaskList from './TaskList';
import KanbanBoard from './KanbanBoard';
import TaskForm from './TaskForm';

export default function TasksView() {
  const { state, actions } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = useMemo(() => {
    return state.tasks.filter((task) => {
      const matchStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchCategory = categoryFilter === 'all' || task.category === categoryFilter;
      const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchStatus && matchPriority && matchCategory && matchSearch;
    }).sort((a, b) => {
      // Sort by due date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [state.tasks, statusFilter, priorityFilter, categoryFilter, searchQuery]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const handleSave = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      actions.updateTask(editingTask.id, taskData);
    } else {
      actions.addTask(taskData);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--color-surface-2)',
    borderColor: 'var(--color-border-subtle)',
    color: 'var(--color-text-primary)'
  };

  return (
    <div className="animate-slide-up space-y-6">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
            <CheckCircle2 className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Tasks
            </h1>
            <p className="mt-1 text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Manage your workload
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg p-1" style={{ backgroundColor: 'var(--color-surface-2)' }}>
            <button
              onClick={() => actions.setTaskViewMode('list')}
              className={clsx(
                'flex h-9 w-9 items-center justify-center rounded-md transition-all',
                state.taskViewMode === 'list' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
              )}
              style={{
                backgroundColor: state.taskViewMode === 'list' ? 'var(--color-surface-1)' : 'transparent',
                color: state.taskViewMode === 'list' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
              }}
              aria-label="List View"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => actions.setTaskViewMode('kanban')}
              className={clsx(
                'flex h-9 w-9 items-center justify-center rounded-md transition-all',
                state.taskViewMode === 'kanban' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
              )}
              style={{
                backgroundColor: state.taskViewMode === 'kanban' ? 'var(--color-surface-1)' : 'transparent',
                color: state.taskViewMode === 'kanban' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
              }}
              aria-label="Kanban View"
            >
              <Kanban className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleCreate}
            className="flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #4f6ef7 0%, #7b93f8 100%)' }}
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="nb-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
              style={inputStyle}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
              className="rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors appearance-none cursor-pointer"
              style={{ ...inputStyle, paddingRight: '2.5rem' }}
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
              className="rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors appearance-none cursor-pointer"
              style={{ ...inputStyle, paddingRight: '2.5rem' }}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
              className="rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors appearance-none cursor-pointer"
              style={{ ...inputStyle, paddingRight: '2.5rem' }}
            >
              <option value="all">All Categories</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Health">Health</option>
              <option value="Learning">Learning</option>
              <option value="Finance">Finance</option>
            </select>

            {(statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setCategoryFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold hover:underline"
                style={{ color: 'var(--color-accent)' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <div className="mb-4 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Showing {filteredTasks.length} task{filteredTasks.length !== 1 && 's'}
        </div>

        {state.taskViewMode === 'list' ? (
          <TaskList
            tasks={filteredTasks}
            onEdit={handleEdit}
            onComplete={(id) => actions.updateTask(id, { status: 'completed' })}
            onDelete={(id) => actions.deleteTask(id)}
          />
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            onMove={(id, status) => actions.updateTask(id, { status })}
            onEdit={handleEdit}
          />
        )}
      </div>

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
