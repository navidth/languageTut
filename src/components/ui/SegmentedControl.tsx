"use client";

import { useRef, type CSSProperties, type KeyboardEvent } from "react";
import type { IconType } from "react-icons";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: IconType;
};

export type SegmentedControlProps<T extends string> = {
  /** Names the group for screen readers. */
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * A one-of-many switch drawn as joined segments, with radio semantics: arrow
 * keys move the choice (mirrored in RTL), Home and End jump to the ends, and
 * only the chosen segment is in the tab order. Flowbite's ButtonGroup has no
 * selection state or keyboard model.
 */
export default function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  className = "",
}: SegmentedControlProps<T>) {
  const groupRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));

  function select(index: number) {
    const option = options[index];
    if (!option) return;
    if (option.value !== value) onChange(option.value);
    groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    const group = groupRef.current;
    const direction = group
      ? getComputedStyle(group).direction || group.closest("[dir]")?.getAttribute("dir")
      : null;
    const rtl = direction === "rtl";
    const last = options.length - 1;
    const steps: Record<string, number> = {
      ArrowRight: rtl ? -1 : 1,
      ArrowLeft: rtl ? 1 : -1,
      ArrowDown: 1,
      ArrowUp: -1,
    };
    let next: number | null = null;
    if (event.key in steps) next = (selectedIndex + steps[event.key] + options.length) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    select(next);
  }

  // The highlight slides under the chosen segment; inset-inline-start works
  // in both writing directions.
  const thumbStyle = {
    width: `calc((100% - 0.5rem) / ${options.length})`,
    insetInlineStart: `calc(0.25rem + (100% - 0.5rem) / ${options.length} * ${selectedIndex})`,
  } as CSSProperties;

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      onKeyDown={handleKeyDown}
      className={`relative grid auto-cols-fr grid-flow-col gap-0 rounded-2xl border border-border bg-secondary-soft/45 p-1 ${className}`}
    >
      <span
        aria-hidden="true"
        style={thumbStyle}
        className="pointer-events-none absolute inset-y-1 rounded-xl bg-card shadow-(--shadow-brand-sm) transition-[inset-inline-start] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      />
      {options.map(({ value: optionValue, label: optionLabel, icon: Icon }, index) => {
        const selected = index === selectedIndex;
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            onClick={() => select(index)}
            className={`relative z-10 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors ${
              selected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {Icon && (
              <Icon
                className={`size-4 ${selected ? "text-brand-secondary dark:text-brand-accent" : ""}`}
                aria-hidden="true"
              />
            )}
            {optionLabel}
          </button>
        );
      })}
    </div>
  );
}
