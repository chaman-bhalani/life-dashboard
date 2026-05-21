import { useStore } from '../store';
import Sidebar from './Sidebar';
import DashboardView from './DashboardView';
import TasksView from './TasksView';
import AnalyticsView from './AnalyticsView';
import QuickLogView from './QuickLogView';
import clsx from 'clsx';

export default function Layout() {
  const { state } = useStore();
  const { activeSection, sidebarCollapsed } = state;

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
        return <TasksView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'quicklog':
        return <QuickLogView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-surface-0)' }}
    >
      <Sidebar />
      <main
        className={clsx(
          'flex-1 transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'ml-[68px]' : 'ml-[232px]'
        )}
      >
        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
