"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

const ITEM_SELECTOR = '[role="menuitem"]:not([aria-disabled="true"])';

function menuItems(menu: HTMLElement | null) {
  return Array.from(menu?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []);
}

type HeaderMenuProps = {
  /** Fixed ids are safe because the header renders each menu once. */
  id: string;
  ariaLabel: string;
  label: ReactNode;
  triggerClassName: string;
  menuClassName: string;
  /** Closes the menu once an item is chosen. */
  dismissOnClick?: boolean;
  children: ReactNode;
};

/**
 * A small dropdown menu for the dashboard header. It opens below its trigger,
 * aligned to the trigger's end edge, and supports the usual menu keys.
 */
export default function HeaderMenu({
  id,
  ariaLabel,
  label,
  triggerClassName,
  menuClassName,
  dismissOnClick = true,
  children,
}: HeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const focusFirstItem = useRef(false);
  const triggerId = `${id}-trigger`;
  const menuId = `${id}-menu`;

  useEffect(() => {
    if (!open) return;
    if (focusFirstItem.current) {
      focusFirstItem.current = false;
      menuItems(menuRef.current)[0]?.focus();
    } else {
      menuRef.current?.focus();
    }

    function closeOnOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  function moveFocus(target: "next" | "previous" | "first" | "last") {
    const items = menuItems(menuRef.current);
    if (!items.length) return;
    const current = items.indexOf(document.activeElement as HTMLElement);
    const index =
      target === "first"
        ? 0
        : target === "last"
          ? items.length - 1
          : target === "next"
            ? (current + 1) % items.length
            : (current - 1 + items.length) % items.length;
    items[index].focus();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusFirstItem.current = true;
      setOpen(true);
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, Parameters<typeof moveFocus>[0]> = {
      ArrowDown: "next",
      ArrowUp: "previous",
      Home: "first",
      End: "last",
    };
    if (event.key in moves) {
      event.preventDefault();
      moveFocus(moves[event.key]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  function handleMenuClick(event: MouseEvent<HTMLDivElement>) {
    if (dismissOnClick && (event.target as HTMLElement).closest(ITEM_SELECTOR)) {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        className={triggerClassName}
      >
        {label}
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
          onClick={handleMenuClick}
          className={`absolute end-0 top-full mt-2 min-w-full ${menuClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** Class names of a menu item, matching the header's previous dropdown. */
export const headerMenuItemClassName =
  "w-full cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:bg-gray-600 dark:focus:text-white";

/**
 * Class names of the menu panel, matching the header's previous dropdown.
 * `w-max` sizes it to its content, since the trigger it hangs from is narrow.
 */
export const headerMenuPanelClassName =
  "z-10 w-max rounded-xl border border-border !bg-popover !text-popover-foreground shadow-[var(--shadow-brand-md)] focus:outline-none dark:border-none";

/** Class names of the header block at the top of a menu. */
export const headerMenuTitleClassName =
  "block border-b border-border bg-secondary-soft px-4 py-2 text-sm text-foreground dark:text-gray-200";
