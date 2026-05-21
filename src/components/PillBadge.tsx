import clsx from 'clsx';
import type { Priority, Status } from '../types';

// ─── Pill Badge Config ──────────────────────────────────────────────────────
// Low-saturation pastels with high-contrast text — per spec
const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  high:   { label: 'High',   className: 'bg-red-50   text-red-700   dark:bg-red-900/20   dark:text-red-400' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
  low:    { label: 'Low',    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-500' },
};

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  'completed':   { label: 'Completed',   className: 'bg-[#E8EFEA] text-[#4A6B53]   dark:bg-[#4A6B53]/20  dark:text-[#8FB996]' },
  'in-progress': { label: 'In Progress', className: 'bg-[#FEF3C7] text-[#B45309]   dark:bg-amber-900/20  dark:text-amber-400' },
  'todo':        { label: 'To Do',       className: 'bg-[#F3F4F6] text-[#4B5563]   dark:bg-white/5       dark:text-[#9AAA9D]' },
};

// ─── Priority Badge ─────────────────────────────────────────────────────────
interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none uppercase tracking-wider',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────
interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold leading-none uppercase tracking-wider',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

// ─── Generic Tag Badge ──────────────────────────────────────────────────────
interface TagBadgeProps {
  label: string;
  className?: string;
}

export function TagBadge({ label, className }: TagBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none',
        'bg-[#E8EFEA] text-[#4A6B53] dark:bg-[#4A6B53]/20 dark:text-[#8FB996]',
        className
      )}
    >
      {label}
    </span>
  );
}
