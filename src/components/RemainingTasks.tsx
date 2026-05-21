import { useMemo } from 'react';
import { useStore } from '../store';
import { AlertTriangle, Clock, Calendar, ListChecks } from 'lucide-react';
import { format, isBefore, startOfDay, addDays } from 'date-fns';
import clsx from 'clsx';

function RemainingTasks() {
  const { state } = useStore();

  const { overdue, dueToday, thisWeek, total } = useMemo(() => {
    const now = startOfDay(new Date());
    const weekEnd = addDays(now, 7);
    const todayStr = format(now, 'yyyy-MM-dd');

    let overdue = 0;
    let dueToday = 0;
    let thisWeek = 0;

    state.tasks.forEach((task) => {
      if (task.status === 'completed') return;

      const due = startOfDay(new Date(task.dueDate));

      if (isBefore(due, now) && task.dueDate !== todayStr) {
        overdue++;
      } else if (task.dueDate === todayStr) {
        dueToday++;
      } else if (isBefore(due, weekEnd)) {
        thisWeek++;
      }
    });

    return { overdue, dueToday, thisWeek, total: overdue + dueToday + thisWeek };
  }, [state.tasks]);

  const categories = [
    {
      label: 'Overdue',
      count: overdue,
      icon: AlertTriangle,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      ring: 'ring-rose-500/30',
      pulse: overdue > 0,
    },
    {
      label: 'Due Today',
      count: dueToday,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      ring: 'ring-amber-500/30',
      pulse: false,
    },
    {
      label: 'This Week',
      count: thisWeek,
      icon: Calendar,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      ring: 'ring-blue-500/30',
      pulse: false,
    },
  ];

  return (
    <div className="nb-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'var(--color-accent-soft)' }}
          >
            <ListChecks className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Remaining Tasks
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              What needs your attention
            </p>
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {total}
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            total
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.label}
              className={clsx(
                'relative flex items-center gap-3 rounded-xl border p-4 transition-all',
                cat.pulse && 'animate-pulse-glow'
              )}
              style={{
                backgroundColor: 'var(--color-surface-2)',
                borderColor: 'var(--color-border-subtle)'
              }}
            >
              <div
                className={clsx(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  cat.bg
                )}
              >
                <Icon className={clsx('h-5 w-5', cat.color)} />
              </div>
              <div>
                <p className={clsx('text-2xl font-bold', cat.color)}>
                  {cat.count}
                </p>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {cat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RemainingTasks;
