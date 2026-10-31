"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiChevronDown } from "react-icons/hi";
import BrandMark from "@/components/ui/BrandMark";
import { isPanelEntryActive, isPanelGroup, isPanelLinkActive } from "@/lib/utils/navigation";
import type { PanelGroup, PanelLink, PanelNavEntry } from "@/types/navigation";

// An icon over a small label in the tablet rail, a row from lg.
const entryClassName =
  "relative flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-[11px] leading-4 transition lg:flex-row lg:gap-3 lg:px-3 lg:py-2.5 lg:text-start lg:text-sm";
const activeEntryClassName = "bg-sidebar-primary font-bold text-sidebar-primary-foreground shadow-sm";
const idleEntryClassName = "text-sidebar-foreground/80 hover:bg-white/8 hover:text-white";

/**
 * The panel menu from the tablet width up: an icon rail below lg, the full
 * sidebar from lg. Groups fold their pages away; the one holding the current
 * page starts open. Phones use NavbarMobile.
 */
export default function AppSidebar({
  entries,
  footerLink,
}: {
  entries: PanelNavEntry[];
  /** Kept apart at the foot, e.g. the profile. */
  footerLink?: PanelLink;
}) {
  const pathname = usePathname();
  // Groups the user opened or closed; the others follow the current page.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  return (
    <aside className="fixed start-0 top-0 z-50 hidden h-dvh w-24 flex-col border-e border-sidebar-border bg-sidebar px-3 text-sidebar-foreground shadow-xl sm:flex lg:w-52">
      <BrandMark compact inverse prefetch={false} className="mt-5 shrink-0 justify-center lg:hidden" />
      <BrandMark inverse prefetch={false} className="mt-5 hidden shrink-0 px-1 lg:inline-flex" />
      <div className="mx-1 mt-5 h-px shrink-0 bg-white/10" />
      {/* Scrolls on its own when the window is too short for every item. */}
      <nav className="-mx-1 mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-4 lg:mt-5" aria-label="منوی پنل">
        <ul className="space-y-1">
          {entries.map((entry) =>
            isPanelGroup(entry) ? (
              <SidebarGroup
                key={entry.id}
                group={entry}
                pathname={pathname}
                expanded={toggled[entry.id] ?? isPanelEntryActive(entry, pathname)}
                onToggle={(open) => setToggled((current) => ({ ...current, [entry.id]: open }))}
              />
            ) : (
              <li key={entry.id}>
                <SidebarLink link={entry} active={isPanelLinkActive(entry, pathname)} />
              </li>
            ),
          )}
        </ul>
      </nav>
      {footerLink && (
        <div className="relative shrink-0 py-3 before:absolute before:inset-x-1 before:top-0 before:h-px before:bg-white/10">
          <SidebarLink link={footerLink} active={isPanelLinkActive(footerLink, pathname)} />
        </div>
      )}
    </aside>
  );
}

function SidebarLink({ link, active }: { link: PanelLink; active: boolean }) {
  const Icon = link.icon;

  return (
    <Link
      href={link.link}
      aria-current={active ? "page" : undefined}
      className={`${entryClassName} ${active ? activeEntryClassName : idleEntryClassName}`}
    >
      <Icon className="size-6 shrink-0 lg:size-5" aria-hidden="true" />
      <span className="block w-full">{link.label}</span>
    </Link>
  );
}

function SidebarGroup({
  group,
  pathname,
  expanded,
  onToggle,
}: {
  group: PanelGroup;
  pathname: string;
  expanded: boolean;
  onToggle: (open: boolean) => void;
}) {
  const Icon = group.icon;
  const active = isPanelEntryActive(group, pathname);
  const listId = `panel-group-${group.id}`;

  return (
    <li>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={listId}
        onClick={() => onToggle(!expanded)}
        className={`${entryClassName} ${
          active ? `font-bold text-white ${expanded ? "" : "bg-white/10"}` : idleEntryClassName
        }`}
      >
        <Icon className={`size-6 shrink-0 lg:size-5 ${active ? "text-brand-accent" : ""}`} aria-hidden="true" />
        <span className="block w-full">{group.label}</span>
        <HiChevronDown
          className={`absolute end-1 top-1.5 size-3.5 shrink-0 opacity-70 transition-transform duration-300 lg:static lg:size-4 ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {/* The row grows from 0fr to 1fr, so the list slides open at its own height. */}
      <div
        id={listId}
        inert={!expanded}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        {/* Padding sits inside the clipped box, so a closed group takes no room. */}
        <div className="min-h-0 overflow-hidden">
        {/* In the rail a tinted block sets the pages apart; from lg a guide line. */}
        <ul className="relative mt-1 space-y-0.5 rounded-xl bg-white/5 p-1 lg:ms-5 lg:rounded-none lg:bg-transparent lg:p-0 lg:ps-3 lg:before:absolute lg:before:inset-y-1.5 lg:before:start-0 lg:before:w-px lg:before:bg-white/15">
          {group.links.map((link) => {
            const current = isPanelLinkActive(link, pathname);
            const LinkIcon = link.icon;
            return (
              <li key={link.id}>
                <Link
                  href={link.link}
                  aria-current={current ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-center text-[10.5px] leading-4 transition lg:flex-row lg:gap-2.5 lg:px-2.5 lg:py-2 lg:text-start lg:text-sm ${
                    current ? "bg-white/10 font-bold text-brand-accent" : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <LinkIcon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        </div>
      </div>
    </li>
  );
}
