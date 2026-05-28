import { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import {
  Sparkles, Droplets, Brain, BookOpen, Dumbbell, PenLine,
  Check, Circle, Plus, X, Trash2,
  Heart, Flame, Moon, Coffee, Music, Star, Zap, Target,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Droplets, Brain, BookOpen, Dumbbell, PenLine,
  Heart, Flame, Moon, Coffee, Music, Star, Zap, Target, Circle,
};

// Icons available for picking when creating a new habit
const ICON_OPTIONS = [
  { name: 'Droplets', label: '💧' },
  { name: 'Brain',    label: '🧠' },
  { name: 'BookOpen', label: '📖' },
  { name: 'Dumbbell', label: '🏋️' },
  { name: 'PenLine',  label: '✏️' },
  { name: 'Heart',    label: '❤️' },
  { name: 'Flame',    label: '🔥' },
  { name: 'Moon',     label: '🌙' },
  { name: 'Coffee',   label: '☕' },
  { name: 'Music',    label: '🎵' },
  { name: 'Star',     label: '⭐' },
  { name: 'Zap',      label: '⚡' },
  { name: 'Target',   label: '🎯' },
];

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

  // Editing habit name
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Check animation
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  // Add-habit form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Star');
  const addInputRef = useRef<HTMLInputElement>(null);

  // Confirm-delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    if (showAddForm && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [showAddForm]);

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

  function handleAddHabit() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    actions.addHabit(trimmed, newIcon);
    setNewName('');
    setNewIcon('Star');
    setShowAddForm(false);
  }

  function handleDeleteHabit(habitId: string) {
    actions.deleteHabit(habitId);
    setDeletingId(null);
  }

  return (
    <div className="nb-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Daily Habits
          </h2>
        </div>

        {/* Add Habit Button */}
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all active:scale-95"
          style={{
            backgroundColor: showAddForm ? 'rgba(239,68,68,0.08)' : 'var(--color-accent-soft)',
            color: showAddForm ? '#ef4444' : 'var(--color-accent)',
          }}
          aria-label={showAddForm ? 'Cancel adding habit' : 'Add new habit'}
        >
          {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showAddForm ? 'Cancel' : 'Add'}
        </button>
      </div>

      {/* ─── Add Habit Inline Form ─── */}
      {showAddForm && (
        <div
          className="mb-4 flex flex-col gap-3 rounded-xl border p-4 animate-slide-up"
          style={{
            backgroundColor: 'var(--color-surface-2)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          {/* Name input */}
          <input
            ref={addInputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddHabit(); if (e.key === 'Escape') setShowAddForm(false); }}
            placeholder="Habit name…"
            maxLength={100}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'var(--color-surface-1)',
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; }}
          />

          {/* Icon picker */}
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Choose an icon
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setNewIcon(opt.name)}
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all',
                    newIcon === opt.name
                      ? 'ring-2 shadow-sm scale-110'
                      : 'opacity-50 hover:opacity-100'
                  )}
                  style={{
                    backgroundColor: newIcon === opt.name ? 'var(--color-accent-soft)' : 'var(--color-surface-1)',
                    outline: newIcon === opt.name ? '2px solid var(--color-accent)' : undefined,
                    outlineOffset: '1px',
                  }}
                  title={opt.name}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleAddHabit}
            disabled={!newName.trim()}
            className="self-end rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Add Habit
          </button>
        </div>
      )}

      {/* ─── Habit Cards ─── */}
      {state.habits.length === 0 ? (
        <div
          className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-10"
          style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}
        >
          <Sparkles className="h-8 w-8 opacity-30" />
          <p className="text-sm font-medium">No habits yet</p>
          <p className="text-xs">Click "Add" above to start tracking a daily habit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {state.habits.map((habit) => {
            const Icon = iconMap[habit.icon] || Circle;
            const isCompleted = !!habit.completions[todayStr];
            const streak = getStreak(habit.completions);
            const isAnimating = animatingId === habit.id;
            const isDeleting = deletingId === habit.id;

            return (
              <div
                key={habit.id}
                className="group relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface-2)',
                  borderColor: 'var(--color-border-subtle)'
                }}
              >
                {/* Delete button (top-right, visible on hover) */}
                {!isDeleting && (
                  <button
                    onClick={() => setDeletingId(habit.id)}
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-label={`Delete ${habit.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}

                {/* Delete confirmation overlay */}
                {isDeleting && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl backdrop-blur-sm"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface-2) 85%, transparent)' }}
                  >
                    <p className="text-[11px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>Delete?</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="rounded-md px-2.5 py-1 text-[11px] font-semibold text-white"
                        style={{ backgroundColor: '#ef4444' }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="rounded-md px-2.5 py-1 text-[11px] font-semibold"
                        style={{ backgroundColor: 'var(--color-surface-1)', color: 'var(--color-text-secondary)' }}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}

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
      )}
    </div>
  );
}

export default HabitTracker;
