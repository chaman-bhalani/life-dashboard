import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly DropdownOption<T>[] | DropdownOption<T>[];
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  direction?: 'down' | 'up';
  size?: 'sm' | 'md';
  placeholder?: string;
  labelPrefix?: React.ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
}

export default function CustomDropdown<T extends string>({
  value,
  onChange,
  options,
  className,
  triggerClassName,
  menuClassName,
  align = 'left',
  direction = 'down',
  size = 'md',
  placeholder,
  labelPrefix,
  onOpenChange,
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Notify parent of open state changes
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Find currently active option
  const activeOption = options.find((opt) => opt.value === value);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Handle keyboard events for accessibility
  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault();
      setIsOpen(true);
    }
  }

  function handleSelect(optionValue: T) {
    onChange(optionValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={clsx('relative inline-block text-left', className)}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={clsx(
          'flex items-center justify-between gap-1.5 rounded-xl border border-[var(--color-border-subtle)] text-left outline-none transition-all active:scale-[0.98]',
          size === 'sm' ? 'px-2.5 py-1.5 text-xs font-semibold' : 'px-3.5 py-2.5 text-sm font-medium',
          isOpen ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent-tint)]' : 'hover:border-black/15 dark:hover:border-white/15',
          triggerClassName
        )}
        style={{
          backgroundColor: 'var(--color-surface-2)',
          color: 'var(--color-text-primary)',
        }}
      >
        <span className="flex items-center gap-1.5 truncate">
          {labelPrefix && <span className="flex shrink-0 items-center justify-center">{labelPrefix}</span>}
          {activeOption?.icon && <span className="flex shrink-0 items-center justify-center">{activeOption.icon}</span>}
          <span className="truncate">{activeOption ? activeOption.label : placeholder || 'Select option'}</span>
        </span>

        {/* Micro-animated Chevron */}
        <ChevronDown
          className={clsx(
            'h-4 w-4 shrink-0 transition-transform duration-200 ease-in-out',
            isOpen && 'rotate-180'
          )}
          style={{ color: 'var(--color-text-muted)' }}
        />
      </button>

      {/* Floating Menu Panel */}
      <div
        role="listbox"
        className={clsx(
          'dropdown-menu dropdown-panel absolute z-50 mt-1.5 w-max min-w-[140px] max-w-[240px] rounded-2xl p-1.5 outline-none',
          isOpen && 'dropdown-menu--open',
          align === 'right' ? 'right-0' : 'left-0',
          direction === 'up' ? 'bottom-full mb-1.5 mt-0' : 'top-full mt-1.5',
          menuClassName
        )}
      >
        <div className="flex flex-col gap-0.5">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={clsx(
                  'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors outline-none cursor-pointer',
                  isSelected
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-text-primary)] font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]'
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  {option.icon && <span className="flex shrink-0 items-center justify-center opacity-70">{option.icon}</span>}
                  <span className="truncate">{option.label}</span>
                </span>

                {/* Indented indicator space or checkmark to prevent layout shift */}
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {isSelected && (
                    <Check className="h-3.5 w-3.5" style={{ color: 'var(--color-accent)' }} />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
