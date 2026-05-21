import { useMemo } from 'react';
import { useStore } from '../store';
import { BarChart3 } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function ActivityChart() {
  const { state } = useStore();

  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const data: { label: string; date: string; completed: number }[] = [];

    const counts: Record<string, number> = {};
    state.tasks.forEach((task) => {
      if (task.status === 'completed' && task.completedAt) {
        const d = task.completedAt.split('T')[0];
        counts[d] = (counts[d] || 0) + 1;
      }
    });

    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      data.push({
        label: format(d, 'EEE'),
        date: dateStr,
        completed: counts[dateStr] || 0,
      });
    }

    return data;
  }, [state.tasks]);

  return (
    <div className="nb-card p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
          <BarChart3 className="h-5 w-5 text-blue-500" />
        </div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Weekly Activity
        </h2>
      </div>

      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)', fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)', fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              dx={-10}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-surface-2)' }}
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '12px',
                fontSize: '13px',
                color: 'var(--tooltip-text)',
                padding: '8px 14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
              }}
              itemStyle={{ color: 'var(--tooltip-text)', fontWeight: 500 }}
              labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}
              formatter={(value: any) => [value as number, 'Tasks Completed']}
              labelFormatter={(label: any, payload: readonly any[]) => {
                if (payload && payload.length > 0) {
                  const dateStr = (payload[0] as any).payload.date;
                  return format(new Date(dateStr), 'EEEE, MMM do');
                }
                return label;
              }}
            />
            <Bar
              dataKey="completed"
              radius={[6, 6, 6, 6]}
              maxBarSize={40}
            >
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill="var(--color-accent)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ActivityChart;
