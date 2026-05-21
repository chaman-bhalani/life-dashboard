import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { StickyNote, Check } from 'lucide-react';

function Scratchpad() {
  const { state, actions } = useStore();
  const [localValue, setLocalValue] = useState(state.scratchpad);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLocalValue(state.scratchpad);
  }, [state.scratchpad]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsSaving(true);
    setShowSaved(false);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      actions.setScratchpad(newValue);
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="nb-card p-6 flex flex-col h-[300px]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
            <StickyNote className="h-5 w-5 text-cyan-500" />
          </div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Scratchpad
          </h2>
        </div>
        
        <div className="h-6 flex items-center justify-end min-w-[80px]">
          {isSaving ? (
            <span className="text-xs font-medium text-amber-500 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Saving...
            </span>
          ) : showSaved ? (
            <span className="text-xs font-medium text-emerald-500 flex items-center gap-1 animate-slide-up">
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
          ) : null}
        </div>
      </div>

      <textarea
        value={localValue}
        onChange={handleChange}
        placeholder="Jot down your thoughts, quick notes, or anything on your mind..."
        className="flex-1 w-full resize-none rounded-xl border p-4 text-sm outline-none transition-colors"
        style={{
          fontFamily: 'var(--font-mono)',
          backgroundColor: 'var(--color-surface-2)',
          borderColor: 'var(--color-border-subtle)',
          color: 'var(--color-text-primary)'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-accent)';
          e.target.style.backgroundColor = 'var(--color-surface-1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--color-border-subtle)';
          e.target.style.backgroundColor = 'var(--color-surface-2)';
        }}
      />
    </div>
  );
}

export default Scratchpad;
