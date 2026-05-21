import { BookOpen } from 'lucide-react';
import HabitTracker from './HabitTracker';
import MoodLogger from './MoodLogger';
import Scratchpad from './Scratchpad';

function QuickLogView() {
  return (
    <div className="animate-slide-up space-y-6">
      <header className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
          <BookOpen className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Quick Log
          </h1>
          <p className="mt-1 text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Daily habits, moods, and quick notes
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HabitTracker />
        </div>
        <div className="lg:col-span-1">
          <MoodLogger />
        </div>
        <div className="lg:col-span-3">
          <Scratchpad />
        </div>
      </div>
    </div>
  );
}

export default QuickLogView;
