import { ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import clsx from 'clsx';
import type { Task, Status } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  onMove: (taskId: string, newStatus: Status) => void;
  onEdit: (task: Task) => void;
}

const COLUMNS: { id: Status; label: string; color: string; bg: string }[] = [
  { id: 'todo', label: 'To Do', color: 'var(--color-text-primary)', bg: 'var(--color-surface-2)' },
  { id: 'in-progress', label: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  { id: 'completed', label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
];

export default function KanbanBoard({ tasks, onMove, onEdit }: KanbanBoardProps) {
  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[500px] gap-6 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div key={col.id} className="flex h-full w-80 shrink-0 flex-col rounded-2xl p-4"
            style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-border-subtle)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider" style={{ color: col.color }}>
                <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ backgroundColor: col.bg }}>
                  {colTasks.length}
                </span>
                {col.label}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {colTasks.map((task) => {
                const isOverdue = isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'completed';
                const isDueToday = isToday(new Date(task.dueDate)) && task.status !== 'completed';

                return (
                  <div
                    key={task.id}
                    className="group relative flex flex-col rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                    style={{
                      backgroundColor: 'var(--color-surface-0)',
                      borderColor: 'var(--color-border-subtle)',
                      borderLeft: `4px solid ${
                        task.priority === 'high' ? '#f43f5e' :
                        task.priority === 'medium' ? '#f59e0b' : '#10b981'
                      }`
                    }}
                    onClick={() => onEdit(task)}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}
                      >
                        {task.category}
                      </span>
                    </div>

                    <h4 className={clsx(
                      'mb-3 text-[15px] font-semibold leading-snug',
                      task.status === 'completed' && 'line-through opacity-60'
                    )} style={{ color: 'var(--color-text-primary)' }}>
                      {task.title}
                    </h4>

                    <div className="mt-auto flex items-center justify-between text-xs font-medium">
                      <div className={clsx(
                        'flex items-center gap-1.5',
                        isOverdue ? 'text-rose-500' : isDueToday ? 'text-amber-500' : ''
                      )} style={{ color: (!isOverdue && !isDueToday) ? 'var(--color-text-secondary)' : undefined }}>
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(task.dueDate), 'MMM d')}
                      </div>
                      <div className="flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                        <Clock className="h-3.5 w-3.5" />
                        {task.estimatedTime}m
                      </div>
                    </div>

                    {/* Action overlay */}
                    <div className="absolute -right-2 top-1/2 flex -translate-y-1/2 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {col.id !== 'todo' && (
                        <button
                          onClick={() => onMove(task.id, col.id === 'completed' ? 'in-progress' : 'todo')}
                          className="flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                          style={{
                            backgroundColor: 'var(--color-surface-1)',
                            borderColor: 'var(--color-border-subtle)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      )}
                      {col.id !== 'completed' && (
                        <button
                          onClick={() => onMove(task.id, col.id === 'todo' ? 'in-progress' : 'completed')}
                          className="flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                          style={{
                            backgroundColor: 'var(--color-surface-1)',
                            borderColor: 'var(--color-border-subtle)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
