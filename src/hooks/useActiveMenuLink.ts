import { useState } from "react";
import { menuItems } from "@/constants/navigation";
import { isMenuLinkActive } from "@/lib/utils/navigation";

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
