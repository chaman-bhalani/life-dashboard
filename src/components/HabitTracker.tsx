import { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { Sparkles, Droplets, Brain, BookOpen, Dumbbell, PenLine, Check, Circle } from 'lucide-react';
import { format, subDays } from 'date-fns';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Droplets,
  Brain,
  BookOpen,
  Dumbbell,
  PenLine,
};

function getStreak(completions: Record<string, boolean>): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
    if (completions[dateStr]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function HabitTracker() {
  const { state, actions } = useStore();
  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [animatingId, setAnimatingId] = useState<string | null>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  function handleDoubleClick(habitId: string, name: string) {
    setEditingId(habitId);
    setEditValue(name);
  }

  function commitEdit(habitId: string) {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== state.habits.find((h) => h.id === habitId)?.name) {
      actions.updateHabitName(habitId, trimmed);
    }
    setEditingId(null);
  }

  function handleToggle(habitId: string) {
    setAnimatingId(habitId);
    actions.toggleHabit(habitId, todayStr);
    setTimeout(() => setAnimatingId(null), 300);
  }

  return (
    <div className="nb-card p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <Sparkles className="h-5 w-5 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Daily Habits
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {state.habits.map((habit) => {
          const Icon = iconMap[habit.icon] || Circle;
          const isCompleted = !!habit.completions[todayStr];
          const streak = getStreak(habit.completions);
          const isAnimating = animatingId === habit.id;

          return (
            <div
              key={habit.id}
              className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors"
              style={{
                backgroundColor: 'var(--color-surface-2)',
                borderColor: 'var(--color-border-subtle)'
              }}
            >
              <div
                className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-black/5 dark:bg-white/5'
                )}
                style={{ color: !isCompleted ? 'var(--color-text-muted)' : undefined }}
              >
                <Icon className="h-5 w-5" />
              </div>

              {editingId === habit.id ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => commitEdit(habit.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit(habit.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="w-full rounded border px-1 py-0.5 text-center text-xs font-medium outline-none"
                  style={{
                    backgroundColor: 'var(--color-surface-1)',
                    borderColor: 'var(--color-accent)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              ) : (
                <span
                  onDoubleClick={() => handleDoubleClick(habit.id, habit.name)}
                  className="cursor-default select-none text-center text-xs font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                  title="Double-click to edit"
                >
                  {habit.name}
                </span>
              )}

              <button
                onClick={() => handleToggle(habit.id)}
                className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200',
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                    : 'bg-transparent text-transparent hover:border-emerald-400',
                  isAnimating && 'animate-check-pop'
                )}
                style={{ borderColor: !isCompleted ? 'var(--color-border-subtle)' : undefined }}
                aria-label={`Toggle ${habit.name}`}
              >
                {isCompleted && <Check className="h-4 w-4" />}
              </button>

              {streak > 0 && (
                <span className="text-[10px] font-semibold text-amber-500">
                  🔥 {streak}d streak
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HabitTracker;
