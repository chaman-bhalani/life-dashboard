import { useState, useEffect, FormEvent } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import type { Task, Priority, Status, Category } from '../types';

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
}

export default function TaskForm({ task, onClose, onSave }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [category, setCategory] = useState<Category>(task?.category || 'Work');
  const [dueDate, setDueDate] = useState(task?.dueDate || new Date().toISOString().split('T')[0]);
  const [estimatedTime, setEstimatedTime] = useState(task?.estimatedTime || 30);
  const [status, setStatus] = useState<Status>(task?.status || 'todo');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate,
      estimatedTime: Number(estimatedTime) || 0,
      status,
      completedAt: status === 'completed' && task?.status !== 'completed' ? new Date().toISOString() : task?.completedAt,
    });
    onClose();
  };

  const inputStyle = {
    backgroundColor: 'var(--color-surface-2)',
    borderColor: 'var(--color-border-subtle)',
    color: 'var(--color-text-primary)'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl animate-slide-up"
        style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-border-subtle)' }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Title</label>
              <input
                autoFocus
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-blue-500"
                style={inputStyle}
                placeholder="What needs to be done?"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-blue-500"
                style={{ ...inputStyle, minHeight: '80px' }}
                placeholder="Add some details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Priority</label>
                <div className="flex rounded-xl p-1" style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border-subtle)' }}>
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={clsx(
                        'flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition-all',
                        priority === p ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                      )}
                      style={{
                        backgroundColor: priority === p ? 'var(--color-surface-1)' : 'transparent',
                        color: priority === p 
                          ? (p === 'high' ? '#f43f5e' : p === 'medium' ? '#f59e0b' : '#10b981')
                          : 'var(--color-text-primary)'
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={inputStyle}
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Health">Health</option>
                  <option value="Learning">Learning</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Est. Time (min)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(Number(e.target.value))}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={inputStyle}
                />
              </div>
            </div>

            {task && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={inputStyle}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t pt-5" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #4f6ef7 0%, #7b93f8 100%)' }}
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
