import { useMemo } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useStore } from '../store';
import type { Category } from '../types';

const CATEGORY_COLORS: Record<Category, string> = {
  Work: '#4f6ef7',
  Personal: '#06b6d4',
  Health: '#10b981',
  Learning: '#f59e0b',
  Finance: '#ec4899',
};

interface CategoryData {
  name: Category;
  value: number;
  color: string;
}

export default function CategoryBreakdown() {
  const { state } = useStore();

  const { data, total } = useMemo(() => {
    const counts: Record<string, number> = {};
    state.tasks.forEach((task) => {
      counts[task.category] = (counts[task.category] || 0) + 1;
    });

    const chartData: CategoryData[] = (
      Object.keys(CATEGORY_COLORS) as Category[]
    )
      .map((cat) => ({
        name: cat,
        value: counts[cat] || 0,
        color: CATEGORY_COLORS[cat],
      }))
      .filter((d) => d.value > 0);

    return {
      data: chartData,
      total: state.tasks.length,
    };
  }, [state.tasks]);

  return (
    <div className="nb-card p-6 h-full">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
          <PieChartIcon className="h-5 w-5 text-pink-500" />
        </div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Categories
        </h2>
      </div>

      {/* Chart */}
      <div className="relative mx-auto max-w-[240px]" style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '12px',
                fontSize: '13px',
                color: 'var(--tooltip-text)',
                padding: '8px 14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
              }}
              itemStyle={{ color: 'var(--tooltip-text)' }}
              formatter={(value: any, name: any) => [
                `${value as number} task${(value as number) !== 1 ? 's' : ''}`,
                name as string,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {total}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Total Tasks
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2.5">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {entry.name}
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
