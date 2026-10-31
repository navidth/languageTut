"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeMenuItemClass, idleMenuItemClass } from "@/constants/ui";
import { isPanelEntryActive, isPanelGroup, isPanelLinkActive } from "@/lib/utils/navigation";
import type { PanelGroup, PanelNavEntry } from "@/types/navigation";

const panelId = (groupId: string) => `dock-group-${groupId}`;

/**
 * The panel menu on phones, a floating dock in the landing page's style:
 * icons only, and the current entry opens into a pill with its label. A
 * group opens a card with its pages above the dock.
 */
export default function NavbarMobile({ entries }: { entries: PanelNavEntry[] }) {
  const pathname = usePathname();
  // The open group and the page it was opened on, so navigating closes it.
  const [open, setOpen] = useState<{ id: string; from: string } | null>(null);
  const openId = open?.from === pathname ? open.id : null;
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openId) return;
    const root = rootRef.current;
    root?.querySelector<HTMLElement>(`#${panelId(openId)} a`)?.focus({ preventScroll: true });

    function onPointerDown(event: PointerEvent) {
      if (!root?.contains(event.target as Node)) setOpen(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(null);
      root?.querySelector<HTMLElement>(`[aria-controls="${panelId(openId!)}"]`)?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openId]);

  return (
    <>
      {/* Dims the page while a group is open; a tap on it closes the group. */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-[45] bg-brand-primary/25 backdrop-blur-[2px] transition-opacity duration-300 sm:hidden ${
          openId ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        ref={rootRef}
        dir="rtl"
        className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-sm sm:hidden"
      >
        {entries.filter(isPanelGroup).map((group) => (
          <GroupPanel
            key={group.id}
            group={group}
            open={openId === group.id}
            pathname={pathname}
            onNavigate={() => setOpen(null)}
          />
        ))}

        <nav
          aria-label="منوی پنل"
          className="flex items-center justify-between rounded-full border border-border bg-muted/95 p-1.5 shadow-[var(--shadow-brand-md)] backdrop-blur-xl dark:border-white/10 dark:bg-[var(--glass)]"
        >
          {entries.map((entry) => {
            const current = isPanelEntryActive(entry, pathname);
            // While a group's card shows, that group holds the label pill.
            const highlighted = openId ? entry.id === openId : current;
            const Icon = entry.icon;
            const className = `flex h-12 min-w-10 items-center justify-center rounded-full px-2.5 min-[360px]:min-w-12 min-[360px]:px-3 ${
              highlighted ? activeMenuItemClass : `${idleMenuItemClass} hover:bg-card/60`
            }`;
            const content = (
              <>
                <Icon
                  size={22}
                  aria-hidden="true"
                  className={`shrink-0 ${highlighted ? "animate-[nav-icon-pop_450ms_ease-out] text-brand-accent" : ""}`}
                />
                {/* The column grows from 0fr to 1fr, so the label opens to its own width. */}
                <span
                  className={`grid transition-[grid-template-columns] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    highlighted ? "grid-cols-[1fr]" : "grid-cols-[0fr]"
                  }`}
                >
                  <span className="min-w-0 overflow-hidden">
                    <span
                      className={`block whitespace-nowrap ps-2 text-xs font-medium transition-[opacity,translate,filter] duration-300 min-[360px]:text-sm ${
                        highlighted ? "translate-x-0 opacity-100 blur-none delay-100" : "translate-x-3 opacity-0 blur-[2px]"
                      }`}
                    >
                      {isPanelGroup(entry) ? entry.shortLabel : entry.label}
                    </span>
                  </span>
                </span>
              </>
            );

            return isPanelGroup(entry) ? (
              <button
                key={entry.id}
                type="button"
                aria-label={entry.label}
                aria-expanded={openId === entry.id}
                aria-controls={panelId(entry.id)}
                onClick={() => setOpen(openId === entry.id ? null : { id: entry.id, from: pathname })}
                className={className}
              >
                {content}
              </button>
            ) : (
              <Link
                key={entry.id}
                href={entry.link}
                aria-current={current ? "page" : undefined}
                onClick={() => setOpen(null)}
                className={className}
              >
                {content}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

function GroupPanel({
  group,
  open,
  pathname,
  onNavigate,
}: {
  group: PanelGroup;
  open: boolean;
  pathname: string;
  onNavigate: () => void;
}) {
  const GroupIcon = group.icon;

  return (
    <div
      id={panelId(group.id)}
      role="group"
      aria-label={group.label}
      inert={!open}
      className={`absolute inset-x-0 bottom-full mb-3 origin-bottom rounded-[1.75rem] border border-border bg-card/95 p-2 shadow-[var(--shadow-brand-md)] backdrop-blur-xl transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:bg-[var(--glass)] ${
        open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-95 opacity-0"
      }`}
    >
      <p className="flex items-center gap-2 px-3 pb-1.5 pt-2 text-xs font-black text-muted-foreground">
        <GroupIcon className="size-4 text-brand-accent" aria-hidden="true" />
        {group.label}
      </p>
      <ul className="space-y-1">
        {group.links.map((link, index) => {
          const current = isPanelLinkActive(link, pathname);
          const Icon = link.icon;
          return (
            <li
              key={link.id}
              // The rows rise in one after another.
              style={{ transitionDelay: open ? `${80 + index * 45}ms` : "0ms" }}
              className={`transition duration-300 motion-reduce:transition-none ${open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
            >
              <Link
                href={link.link}
                aria-current={current ? "page" : undefined}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-2xl p-2.5 transition ${current ? "bg-accent-soft" : "hover:bg-secondary-soft/70"}`}
              >
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                    current ? "bg-brand-accent text-brand-primary" : "bg-secondary-soft text-brand-secondary dark:text-white"
                  }`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-foreground">{link.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{link.hint}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
