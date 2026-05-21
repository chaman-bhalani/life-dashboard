import { useMemo } from 'react';
import { useStore } from '../store';
import { Heart } from 'lucide-react';
import { format, subDays } from 'date-fns';
import clsx from 'clsx';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { MoodLevel } from '../types';

const MOODS: { level: MoodLevel; emoji: string; label: string }[] = [
  { level: 1, emoji: '😢', label: 'Terrible' },
  { level: 2, emoji: '😕', label: 'Bad' },
  { level: 3, emoji: '😐', label: 'Okay' },
  { level: 4, emoji: '🙂', label: 'Good' },
  { level: 5, emoji: '😄', label: 'Great' },
];

function MoodLogger() {
  const { state, actions } = useStore();

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const todayMood = state.moods.find((m) => m.date === todayStr);

  const chartData = useMemo(() => {
    const today = new Date();
    const moodMap = new Map(state.moods.map((m) => [m.date, m.level]));

    const data: { date: string; label: string; mood: number | null }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const label = format(d, 'MMM d');
      data.push({
        date: dateStr,
        label,
        mood: moodMap.get(dateStr) ?? null,
      });
    }
    return data;
  }, [state.moods]);

  return (
    <div className="nb-card p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
          <Heart className="h-5 w-5 text-pink-500" />
        </div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Mood Check-in
        </h2>
      </div>

      <div className="mb-5 flex items-center justify-center gap-2">
        {MOODS.map((m) => {
          const isSelected = todayMood?.level === m.level;
          return (
            <button
              key={m.level}
              onClick={() => actions.logMood(m.level)}
              title={m.label}
              className={clsx(
                'flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-all duration-200',
                isSelected
                  ? 'scale-110 ring-2'
                  : 'opacity-60 hover:scale-105 hover:opacity-100'
              )}
              style={{
                boxShadow: isSelected ? '0 0 0 4px var(--color-surface-1), 0 0 0 6px var(--color-accent)' : undefined
              }}
              aria-label={`Log mood: ${m.label}`}
            >
              {m.emoji}
            </button>
          );
        })}
      </div>

      <div style={{ width: '100%', height: 144 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              tickLine={false}
              axisLine={false}
              width={20}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '12px',
                fontSize: '12px',
                color: 'var(--tooltip-text)',
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
              itemStyle={{ color: 'var(--tooltip-text)' }}
              formatter={(value: number) => {
                const mood = MOODS.find((m) => m.level === value);
                return [mood ? `${mood.emoji} ${mood.label}` : value, 'Mood'];
              }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="var(--color-accent)"
              strokeWidth={2.5}
              dot={{ fill: 'var(--color-accent)', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: 'var(--color-accent)', strokeWidth: 0, r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MoodLogger;
