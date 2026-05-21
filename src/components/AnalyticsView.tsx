import { BarChart3 } from 'lucide-react';
import ActivityChart from './ActivityChart';
import CategoryBreakdown from './CategoryBreakdown';
import ProductivityHeatmap from './ProductivityHeatmap';

function AnalyticsView() {
  return (
    <div className="animate-slide-up space-y-6">
      <header className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
          <BarChart3 className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Analytics
          </h1>
          <p className="mt-1 text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Insights and trends over time
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryBreakdown />
        </div>
        <div className="lg:col-span-3">
          <ProductivityHeatmap />
        </div>
      </div>
    </div>
  );
}

export default AnalyticsView;
