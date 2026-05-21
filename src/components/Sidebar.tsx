import {
  LayoutDashboard,
  ListTodo,
  BarChart3,
  BookOpen,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../store';
import type { NavSection } from '../types';
import clsx from 'clsx';

const navItems: { id: NavSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'quicklog', label: 'Quick Log', icon: BookOpen },
];

export default function Sidebar() {
  const { state, actions } = useStore();
  const { theme, activeSection, sidebarCollapsed } = state;

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 z-40 flex h-full flex-col transition-all duration-300 ease-in-out',
        'border-r',
        sidebarCollapsed ? 'w-[68px]' : 'w-[232px]'
      )}
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      {/* Logo */}
      <div className="flex h-[60px] items-center gap-2.5 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: 'linear-gradient(135deg, #4f6ef7 0%, #7b93f8 100%)' }}
        >
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-[15px] font-semibold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            LifeFlow
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 pt-2" role="navigation" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => actions.setActiveSection(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={clsx(
                'group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150',
                sidebarCollapsed && 'justify-center px-0'
              )}
              style={{
                backgroundColor: isActive ? 'var(--color-accent-soft)' : 'transparent',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-soft)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="space-y-0.5 px-2 pb-4 pt-2" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        <button
          onClick={() => actions.setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={clsx(
            'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150',
            sidebarCollapsed && 'justify-center px-0'
          )}
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-accent-soft)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-[18px] w-[18px] shrink-0 text-amber-400" />
          ) : (
            <Moon className="h-[18px] w-[18px] shrink-0" />
          )}
          {!sidebarCollapsed && (
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>

        <button
          onClick={() => actions.setSidebarCollapsed(!sidebarCollapsed)}
          className={clsx(
            'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150',
            sidebarCollapsed && 'justify-center px-0'
          )}
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-accent-soft)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-[18px] w-[18px] shrink-0" />
          ) : (
            <PanelLeftClose className="h-[18px] w-[18px] shrink-0" />
          )}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
