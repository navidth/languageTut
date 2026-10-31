import type { PanelGroup, PanelLink, PanelNavEntry } from "@/types/navigation";

export const isMenuLinkActive = (link: string, pathName: string) => {
  if (link === "/") return pathName === "/";
  return !link.includes("#") && pathName.startsWith(link);
};

export function isPanelGroup(entry: PanelNavEntry): entry is PanelGroup {
  return "links" in entry;
}

/** The page itself, or a page under it, such as one course or one test. */
export function isPanelLinkActive(link: Pick<PanelLink, "link" | "exact">, pathName: string) {
  return pathName === link.link || (!link.exact && pathName.startsWith(`${link.link}/`));
}

/** A group is current when one of its pages is. */
export function isPanelEntryActive(entry: PanelNavEntry, pathName: string) {
  return isPanelGroup(entry)
    ? entry.links.some((link) => isPanelLinkActive(link, pathName))
    : isPanelLinkActive(entry, pathName);
}
