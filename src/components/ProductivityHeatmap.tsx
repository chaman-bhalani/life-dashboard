import { useMemo } from 'react';
import { Grid3x3 } from 'lucide-react';
import { format, subWeeks, addDays, startOfWeek, isToday, isBefore, startOfDay } from 'date-fns';
import clsx from 'clsx';
import { heatmapData } from '../mockData';

const WEEKS = 52;
const DAYS_PER_WEEK = 7;

function getCellColor(count: number) {
  if (count === 0) return 'var(--color-surface-2)';
  if (count === 1) return 'var(--color-accent-soft)';
  if (count === 2) return 'color-mix(in srgb, var(--color-accent) 40%, var(--color-surface-2))';
  if (count === 3) return 'color-mix(in srgb, var(--color-accent) 70%, var(--color-surface-2))';
  return 'var(--color-accent)';
}

function ProductivityHeatmap() {
  const { grid, monthLabels } = useMemo(() => {
    const today = startOfDay(new Date());
    const startDate = startOfWeek(subWeeks(today, WEEKS - 1), { weekStartsOn: 1 });

    const grid = [];
    const monthLabels = [];
    let currentMonth = -1;

    for (let w = 0; w < WEEKS; w++) {
      const week = [];
      const weekStart = addDays(startDate, w * DAYS_PER_WEEK);

      if (weekStart.getMonth() !== currentMonth && w < WEEKS - 1) {
        monthLabels.push({
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

    return { grid, monthLabels };
  }, []);

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
          <div className="mb-2 ml-8 flex text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${(m.col * 15) + 32}px`,
                }}
              >
                {m.label}
              </div>
            ))}
            <div className="h-4 w-full" />
          </div>

          <div className="flex gap-1.5">
            <div className="flex flex-col justify-between pt-1 text-[11px] font-medium" style={{ color: 'var(--color-text-muted)', paddingRight: '8px' }}>
              <span className="h-[13px] leading-[13px]">Mon</span>
              <span className="h-[13px] leading-[13px]">Wed</span>
              <span className="h-[13px] leading-[13px]">Fri</span>
            </div>

            <div className="flex gap-1.5">
              {grid.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1.5">
                  {week.map((day, dIndex) => (
                    <div
                      key={day.date}
                      className={clsx(
                        'h-[13px] w-[13px] rounded-sm transition-colors duration-200',
                        day.isFuture && 'opacity-0'
                      )}
                      style={{ backgroundColor: day.isFuture ? 'transparent' : getCellColor(day.count) }}
                      title={`${day.date}: ${day.count} tasks`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="h-[13px] w-[13px] rounded-sm"
            style={{ backgroundColor: getCellColor(level) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default ProductivityHeatmap;
