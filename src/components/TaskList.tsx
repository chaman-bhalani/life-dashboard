import { Pencil, Check, Trash2 } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import clsx from 'clsx';
import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskList({ tasks, onEdit, onComplete, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
          <Check className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          All caught up
        </h3>
        <p className="mt-1 text-sm max-w-sm" style={{ color: 'var(--color-text-secondary)' }}>
          You have no tasks matching the current filters. Enjoy your free time or add a new task!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => {
        const isOverdue = isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'completed';
        const isDueToday = isToday(new Date(task.dueDate)) && task.status !== 'completed';

        return (
          <div
            key={task.id}
            className="group relative flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-sm"
            style={{
              backgroundColor: 'var(--color-surface-1)',
              borderColor: 'var(--color-border-subtle)'
            }}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div
                className={clsx(
                  'h-3 w-3 shrink-0 rounded-full',
                  task.priority === 'high' ? 'bg-rose-500' :
                  task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                )}
              />
              
              <div className="flex flex-col min-w-0">
                <span className={clsx(
                  'truncate text-[15px] font-semibold transition-colors',
                  task.status === 'completed' ? 'text-gray-400 line-through dark:text-gray-500' : ''
                )}
                style={{ color: task.status === 'completed' ? undefined : 'var(--color-text-primary)' }}
                >
                  {task.title}
                </span>
                
                <div className="mt-1 flex items-center gap-3 text-xs font-medium">
                  <span className="rounded-full px-2 py-0.5"
                    style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}
                  >
                    {task.category}
                  </span>
                  <span className={clsx(
                    isOverdue ? 'text-rose-500 font-bold' : isDueToday ? 'text-amber-500 font-bold' : ''
                  )} style={{ color: (!isOverdue && !isDueToday) ? 'var(--color-text-secondary)' : undefined }}>
                    Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {task.estimatedTime}m
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-4">
              <span className={clsx(
                'mr-2 hidden rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider sm:inline-block',
                task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                ''
              )} style={{
                backgroundColor: task.status === 'todo' ? 'var(--color-surface-2)' : undefined,
                color: task.status === 'todo' ? 'var(--color-text-secondary)' : undefined,
              }}>
                {task.status.replace('-', ' ')}
              </span>

              <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => onComplete(task.id)}
                  className="rounded-lg p-2 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/20"
                  style={{ color: 'var(--color-text-secondary)' }}
                  title={task.status === 'completed' ? 'Mark as Todo' : 'Mark as Completed'}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onEdit(task)}
                  className="rounded-lg p-2 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/20"
                  style={{ color: 'var(--color-text-secondary)' }}
                  title="Edit Task"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="rounded-lg p-2 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20"
                  style={{ color: 'var(--color-text-secondary)' }}
                  title="Delete Task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
