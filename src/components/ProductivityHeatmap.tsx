import { useMemo } from 'react';
import { Grid3x3 } from 'lucide-react';
import { format, subWeeks, addDays, startOfWeek, isToday, isBefore, startOfDay } from 'date-fns';
import clsx from 'clsx';
import { useStore } from '../store';

const WEEKS = 52;
const DAYS_PER_WEEK = 7;

// Each cell is 13px wide + 6px gap between columns = 19px per column
const CELL_SIZE = 13;
const GAP = 6;
const COL_WIDTH = CELL_SIZE + GAP;

// Minimum columns between month labels to prevent overlap (~3 chars ≈ 25px)
const MIN_LABEL_COL_GAP = 3;

function getCellColor(count: number) {
  if (count === 0) return 'var(--color-surface-2)';
  if (count === 1) return 'var(--color-accent-soft)';
  if (count === 2) return 'color-mix(in srgb, var(--color-accent) 40%, var(--color-surface-2))';
  if (count === 3) return 'color-mix(in srgb, var(--color-accent) 70%, var(--color-surface-2))';
  return 'var(--color-accent)';
}

function ProductivityHeatmap() {
  const { state } = useStore();

  // Derive heatmap data from real completed tasks instead of mock data.
  const heatmapData = useMemo(() => {
    const counts: Record<string, number> = {};
    state.tasks.forEach((task) => {
      if (task.status === 'completed' && task.completedAt) {
        const dateStr = task.completedAt.split('T')[0];
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      }
    });
    return counts;
  }, [state.tasks]);

  const { grid, monthLabels } = useMemo(() => {
    const today = startOfDay(new Date());
    const startDate = startOfWeek(subWeeks(today, WEEKS - 1), { weekStartsOn: 1 });

    const grid = [];
    const rawLabels: { label: string; col: number }[] = [];
    let currentMonth = -1;

    for (let w = 0; w < WEEKS; w++) {
      const week = [];
      const weekStart = addDays(startDate, w * DAYS_PER_WEEK);

      if (weekStart.getMonth() !== currentMonth && w < WEEKS - 1) {
        rawLabels.push({
          label: format(weekStart, 'MMM'),
          col: w,
        });
        currentMonth = weekStart.getMonth();
      }

      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        const date = addDays(weekStart, d);
        const dateStr = format(date, 'yyyy-MM-dd');

        week.push({
          date: dateStr,
          count: heatmapData[dateStr] || 0,
          isFuture: isBefore(today, date) && !isToday(date),
        });
      }
      grid.push(week);
    }

    // Filter out overlapping month labels (skip if too close to previous)
    const monthLabels: typeof rawLabels = [];
    for (const lbl of rawLabels) {
      const prev = monthLabels[monthLabels.length - 1];
      if (!prev || lbl.col - prev.col >= MIN_LABEL_COL_GAP) {
        monthLabels.push(lbl);
      }
    }

    return { grid, monthLabels };
  }, [heatmapData]);

  return (
    <div className="nb-card p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <Grid3x3 className="h-5 w-5 text-emerald-500" />
        </div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Productivity Heatmap
        </h2>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-fit">
          {/* Month labels row */}
          <div
            className="relative mb-2 h-4"
            style={{ marginLeft: '40px' }}
          >
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="absolute text-[11px] font-medium"
                style={{
                  color: 'var(--color-text-muted)',
                  left: `${m.col * COL_WIDTH}px`,
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex" style={{ gap: `${GAP}px` }}>
            {/* Day-of-week labels */}
            <div
              className="flex flex-col justify-between pt-1 text-[11px] font-medium"
              style={{ color: 'var(--color-text-muted)', width: '34px', flexShrink: 0 }}
            >
              <span className="leading-[13px]">Mon</span>
              <span className="leading-[13px]">Wed</span>
              <span className="leading-[13px]">Fri</span>
            </div>

            {/* Heatmap cells */}
            <div className="flex" style={{ gap: `${GAP}px` }}>
              {grid.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col" style={{ gap: `${GAP}px` }}>
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={clsx(
                        'rounded-sm transition-colors duration-200',
                        day.isFuture && 'opacity-0'
                      )}
                      style={{
                        width: `${CELL_SIZE}px`,
                        height: `${CELL_SIZE}px`,
                        backgroundColor: day.isFuture ? 'transparent' : getCellColor(day.count),
                      }}
                      title={`${day.date}: ${day.count} task${day.count !== 1 ? 's' : ''} completed`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="rounded-sm"
            style={{
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`,
              backgroundColor: getCellColor(level),
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default ProductivityHeatmap;
