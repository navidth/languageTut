import { useState } from "react";
import { menuItems } from "@/lib/constants";

export const isMenuLinkActive = (link: string, pathName: string) => {
  if (link === "/") return pathName === "/";
  return !link.includes("#") && pathName.startsWith(link);
};

/**
 * The item to mark as current. A tap marks its item at once, before the
 * route changes, and keeps section links such as "/#features" marked, which
 * the pathname alone cannot tell apart from "/".
 */
export function useActiveMenuLink(pathName: string) {
  const [selection, setSelection] = useState<{ link: string; from: string } | null>(null);
  const routeLink = menuItems.find((item) => isMenuLinkActive(item.link, pathName))?.link;
  const selectedPath = selection ? selection.link.split("#")[0] || "/" : null;
  const activeLink =
    selection && (pathName === selection.from || pathName === selectedPath)
      ? selection.link
      : routeLink;

  return {
    activeLink,
    select: (link: string) => setSelection({ link, from: pathName }),
  };
}

// Shared by the desktop bar and the mobile dock, so both menus mark the
// current page the same way.
export const activeMenuItemClass =
  "bg-card text-foreground shadow-[0_1px_2px_rgb(19_9_18/0.08),0_4px_12px_-4px_rgb(85_38_79/0.3)] ring-1 ring-border dark:bg-white/12 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_2px_6px_rgb(0_0_0/0.5)] dark:ring-white/10";

// The hover fill is left to each menu, because it must contrast with the
// surface behind that menu.
export const idleMenuItemClass =
  "text-muted-foreground hover:text-foreground dark:text-foreground/65 dark:hover:bg-white/5 dark:hover:text-foreground";
