import { ChevronRight, ChevronLeft, Pencil, Trash2, Calendar, Clock } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import clsx from 'clsx';
import type { Task, Status } from '../types';
import { PriorityBadge } from './PillBadge';

interface KanbanViewProps {
  tasks: Task[];
  onEdit:     (task: Task)   => void;
  onDelete:   (taskId: string) => void;
  onMove:     (taskId: string, newStatus: Status) => void;
}

const COLUMNS: { id: Status; label: string; accentClass: string; countClass: string }[] = [
  {
    id:          'todo',
    label:       'To Do',
    accentClass: 'bg-slate-50 dark:bg-white/[0.03] border-slate-200/60 dark:border-white/[0.06]',
    countClass:  'bg-slate-200/80 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  },
  {
    id:          'in-progress',
    label:       'In Progress',
    accentClass: 'bg-amber-50/60 dark:bg-amber-900/10 border-amber-200/60 dark:border-amber-900/30',
    countClass:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    id:          'completed',
    label:       'Completed',
    accentClass: 'bg-[#F0F5F1] dark:bg-[#4A6B53]/10 border-[#C8D5C4]/60 dark:border-[#4A6B53]/30',
    countClass:  'bg-[#E8EFEA] text-[#4A6B53] dark:bg-[#4A6B53]/20 dark:text-[#8FB996]',
  },
];

const STATUS_ORDER: Status[] = ['todo', 'in-progress', 'completed'];

export default function KanbanView({ tasks, onEdit, onDelete, onMove }: KanbanViewProps) {
  return (
    <div className="flex gap-4 pb-36 overflow-x-auto min-h-[400px]" style={{ alignItems: 'flex-start' }}>
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const colIndex = STATUS_ORDER.indexOf(col.id);

        return (
          <div
            key={col.id}
            className={clsx(
              'flex-1 min-w-[280px] max-w-[380px] flex flex-col rounded-2xl border p-3',
              col.accentClass
            )}
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center gap-2 px-1">
              <span className="flex-1 text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {col.label}
              </span>
              <span className={clsx('rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums', col.countClass)}>
                {colTasks.length}
              </span>
            </div>

            {/* Task Cards */}
            <div className="flex flex-col gap-2.5">
              {colTasks.length === 0 && (
                <div
                  className="flex items-center justify-center rounded-xl border-2 border-dashed py-8 text-xs font-medium"
                  style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}
                >
                  No tasks here
                </div>
              )}

              {colTasks.map((task) => {
                const isOverdue  = isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'completed';
                const isDueToday = isToday(new Date(task.dueDate)) && task.status !== 'completed';
                const prevStatus = colIndex > 0 ? STATUS_ORDER[colIndex - 1] : null;
                const nextStatus = colIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[colIndex + 1] : null;

                return (
                  <div
                    key={task.id}
                    className="group relative flex flex-col gap-2.5 rounded-xl p-3.5 transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--color-surface-1)',
                      border: '1px solid var(--color-border-subtle)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={clsx(
                          'flex-1 text-[13px] font-semibold leading-snug',
                          task.status === 'completed' && 'line-through opacity-40'
                        )}
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {task.title}
                      </h4>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p
                        className="line-clamp-2 text-[11px] leading-relaxed"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {task.description}
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <TagBadge label={task.category} />
                      <span
                        className={clsx('flex items-center gap-1 text-[11px] font-medium')}
                        style={{
                          color: isOverdue ? '#EF4444' : isDueToday ? '#F59E0B' : 'var(--color-text-muted)',
                        }}
                      >
                        <Calendar className="h-3 w-3 shrink-0" />
                        {format(new Date(task.dueDate), 'MMM d')}
                        {isOverdue && ' · overdue'}
                        {isDueToday && ' · today'}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        <Clock className="h-3 w-3 shrink-0" />
                        {task.estimatedTime}m
                      </span>
                    </div>

                    {/* Action row — visible on hover */}
                    <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                      {/* Move left */}
                      {prevStatus && (
                        <button
                          onClick={() => onMove(task.id, prevStatus)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors"
                          style={{ color: 'var(--color-text-secondary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-accent-soft)';
                            e.currentTarget.style.color = 'var(--color-accent)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text-secondary)';
                          }}
                          title={`Move to ${STATUS_ORDER[colIndex - 1]}`}
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          Back
                        </button>
                      )}

                      {nextStatus && (
                        <button
                          onClick={() => onMove(task.id, nextStatus)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors"
                          style={{ color: 'var(--color-text-secondary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-accent-soft)';
                            e.currentTarget.style.color = 'var(--color-accent)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text-secondary)';
                          }}
                          title={`Move to ${STATUS_ORDER[colIndex + 1]}`}
                        >
                          Advance
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Spacer */}
                      <div className="ml-auto flex items-center gap-0.5">
                        <button
                          onClick={() => onEdit(task)}
                          className="rounded-lg p-1.5 transition-colors"
                          style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.08)';
                            e.currentTarget.style.color = '#3B82F6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text-muted)';
                          }}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(task.id)}
                          className="rounded-lg p-1.5 transition-colors"
                          style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)';
                            e.currentTarget.style.color = '#EF4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text-muted)';
                          }}
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
          </div>
        );
      })}
    </div>
  );
}

// inline helper — avoids circular import
function TagBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none bg-[#E8EFEA] text-[#4A6B53] dark:bg-[#4A6B53]/20 dark:text-[#8FB996]">
      {label}
    </span>
  );
}
