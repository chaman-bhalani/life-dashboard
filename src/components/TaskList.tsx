import { Pencil, Check, Trash2, Clock, Calendar } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import clsx from 'clsx';
import type { Task, ViewMode } from '../types';
import { PriorityBadge, StatusBadge, TagBadge } from './PillBadge';

interface TaskListProps {
  tasks:      Task[];
  viewMode:   ViewMode;
  onEdit:     (task: Task)     => void;
  onComplete: (taskId: string) => void;
  onDelete:   (taskId: string) => void;
}

const CATEGORY_COVERS: Record<string, string> = {
  Work:     'cover-work',
  Personal: 'cover-personal',
  Health:   'cover-health',
  Learning: 'cover-learning',
  Finance:  'cover-finance',
};

// Used only for the priority dot in grid covers (no stripes in list view)
const PRIORITY_DOT: Record<string, string> = {
  high:   '#EF4444',
  medium: '#F59E0B',
  low:    '#10B981',
};

export default function TaskList({ tasks, viewMode, onEdit, onComplete, onDelete }: TaskListProps) {
  // ─── Empty State ───────────────────────────────────────
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{ backgroundColor: 'var(--color-accent-soft)' }}
        >
          <Check className="h-9 w-9" style={{ color: 'var(--color-accent)' }} />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          All caught up
        </h3>
        <p className="mt-2 max-w-xs text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          No tasks match the current filters. Add a new task using the input below.
        </p>
      </div>
    );
  }

  // ─── Grid View ─────────────────────────────────────────
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-5 pb-36 sm:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => {
          const isOverdue  = isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'completed';
          const isDueToday = isToday(new Date(task.dueDate)) && task.status !== 'completed';

          return (
            <div
              key={task.id}
              className="task-card-grid group flex flex-col"
              onClick={() => onEdit(task)}
            >
              {/* Notebook Cover Banner */}
              <div className={clsx('relative h-28 flex-shrink-0', CATEGORY_COVERS[task.category])}>
                {/* Category badge */}
                <span
                  className="absolute bottom-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(4px)' }}
                >
                  {task.category}
                </span>
                {/* Priority dot */}
                <span
                  className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full ring-2 ring-white/30"
                  style={{ backgroundColor: PRIORITY_DOT[task.priority] }}
                  title={`${task.priority} priority`}
                />
                {/* Completed overlay */}
                {task.status === 'completed' && (
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-t-[20px]"
                    style={{ backgroundColor: 'rgba(0,0,0,0.28)' }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-5 w-5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-4">
                <h3
                  className={clsx(
                    'mb-2 text-[14px] font-semibold leading-snug',
                    task.status === 'completed' && 'line-through opacity-40'
                  )}
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {task.description}
                  </p>
                )}

                {/* Footer: date + status badge */}
                <div
                  className="mt-auto flex items-center justify-between pt-2.5"
                  style={{ borderTop: '1px solid var(--color-border-subtle)' }}
                >
                  <div className="flex items-center gap-2.5 text-[11px] font-medium">
                    <span
                      className="flex items-center gap-1"
                      style={{ color: isOverdue ? '#EF4444' : isDueToday ? '#F59E0B' : 'var(--color-text-secondary)' }}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                    <span className="flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                      <Clock className="h-3.5 w-3.5" />
                      {task.estimatedTime}m
                    </span>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              </div>

              {/* Hover Action Bar */}
              <div
                className="flex items-center gap-1 border-t px-4 py-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{ borderColor: 'var(--color-border-subtle)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onComplete(task.id)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = '#10B981'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                >
                  <Check className="h-3.5 w-3.5" />
                  {task.status === 'completed' ? 'Undo' : 'Done'}
                </button>
                <div className="ml-auto flex items-center gap-0.5">
                  <button
                    onClick={() => onEdit(task)}
                    className="rounded-lg p-1.5 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#3B82F6'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="rounded-lg p-1.5 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ─── List View ─────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2 pb-36">
      {tasks.map((task) => {
        const isOverdue  = isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'completed';
        const isDueToday = isToday(new Date(task.dueDate)) && task.status !== 'completed';

        return (
          <div
            key={task.id}
            className="task-row group flex items-center justify-between p-4"
          >
            {/* Left: title + meta */}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span
                className={clsx(
                  'truncate text-[14px] font-semibold leading-snug',
                  task.status === 'completed' && 'line-through opacity-40'
                )}
                style={{ color: 'var(--color-text-primary)' }}
              >
                {task.title}
              </span>

              {/* Badge row */}
              <div className="flex flex-wrap items-center gap-1.5">
                <TagBadge label={task.category} />
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
                <span
                  className="flex items-center gap-1 text-[11px] font-medium"
                  style={{ color: isOverdue ? '#EF4444' : isDueToday ? '#F59E0B' : 'var(--color-text-muted)' }}
                >
                  <Calendar className="h-3 w-3 shrink-0" />
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  {isOverdue && ' · overdue'}
                  {isDueToday && ' · today'}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  <Clock className="h-3 w-3 shrink-0" />
                  {task.estimatedTime}m
                </span>
              </div>
            </div>

            {/* Right: action buttons (fade in on hover) */}
            <div className="ml-4 flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => onComplete(task.id)}
                className="rounded-lg p-1.5 transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = '#10B981'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                title={task.status === 'completed' ? 'Mark as Todo' : 'Mark as Completed'}
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(task)}
                className="rounded-lg p-1.5 transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#3B82F6'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                title="Edit Task"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="rounded-lg p-1.5 transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                title="Delete Task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
