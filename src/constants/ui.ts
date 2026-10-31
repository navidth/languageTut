/**
 * Native inputs, selects and text areas in forms, so they all look alike.
 * Merge extras with `twMerge`, e.g. `border-destructive` on an error.
 */
export const FIELD_CLASS_NAME = "w-full rounded-xl border border-input bg-card p-3";

/** Flowbite's Progress bar in the brand colours. */
export const BRAND_PROGRESS_THEME = {
  base: "w-full overflow-hidden rounded-full bg-secondary-soft dark:bg-white/10",
  color: { default: "bg-brand-accent" },
};

// Menu items. Shared by the landing bar and dock and the panel menus, so
// every menu marks the current page the same way.
export const activeMenuItemClass =
  "bg-card text-foreground shadow-[0_1px_2px_rgb(19_9_18/0.08),0_4px_12px_-4px_rgb(85_38_79/0.3)] ring-1 ring-border dark:bg-white/12 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_2px_6px_rgb(0_0_0/0.5)] dark:ring-white/10";

// The hover fill is left to each menu, because it must contrast with the
// surface behind that menu.
export const idleMenuItemClass =
  "text-muted-foreground hover:text-foreground dark:text-foreground/65 dark:hover:bg-white/5 dark:hover:text-foreground";
