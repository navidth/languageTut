import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { StaticImageData } from "next/image";
import { IconType } from "react-icons";

export type Image = string | StaticImageData | StaticImport
export type Icon = StaticImageData | IconType | React.ReactNode

export type MenuItem = {
      id: number;
      label?: string;
      icon?: Icon
      link: string;
      value?: string;
      subitems?: Array<{
            id: number,
            label: string,
            link: string,
      }>
}
export type MenuItems = MenuItem[];
