import type { StaticImageData } from "next/image";
import type { IconType } from "react-icons";

export type Icon = StaticImageData | IconType | React.ReactNode

export type MenuItem = {
      id: number;
      label?: string;
      icon?: Icon
      link: string;
}

export type MenuItems = MenuItem[];

/** A page in a panel menu, also used for dashboard shortcut tiles. */
export type PanelLink = {
      id: string;
      link: string;
      label: string;
      /** One line about the page, under its label in the phone menu and on tiles. */
      hint: string;
      icon: IconType;
      /** Marked only on this path, not on the pages under it. */
      exact?: boolean;
};

/** Related pages under one heading, which opens them instead of navigating. */
export type PanelGroup = {
      id: string;
      label: string;
      /** For the phone dock, where the full label does not fit. */
      shortLabel: string;
      icon: IconType;
      links: PanelLink[];
};

export type PanelNavEntry = PanelLink | PanelGroup;
