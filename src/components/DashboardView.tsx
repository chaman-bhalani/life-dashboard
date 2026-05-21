import { format } from 'date-fns';
import RemainingTasks from './RemainingTasks';
import HabitTracker from './HabitTracker';
import MoodLogger from './MoodLogger';
import Scratchpad from './Scratchpad';

function DashboardView() {
  const today = new Date();
  const hour = today.getHours();
  
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  const dateStr = format(today, 'EEEE, MMMM do');

  return (
    <div className="animate-slide-up space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          {greeting}
        </h1>
        <p className="mt-2 text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          It's {dateStr}. Let's see what's on your plate.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* Top Row: Important Metrics */}
        <section>
          <RemainingTasks />
        </section>

        {/* Middle Row: Daily Trackers */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <HabitTracker />
          </div>
          <div className="lg:col-span-1">
            <MoodLogger />
          </div>
        </section>

        {/* Bottom Row: Scratchpad */}
        <section>
          <Scratchpad />
        </section>
      </div>
    </div>
  );
}

export default DashboardView;
