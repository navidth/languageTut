import { MenuItems } from "@/types";
import { FaReadme } from "react-icons/fa";
import { RiArticleFill, RiHome4Fill } from "react-icons/ri";

export const menuItems: MenuItems = [
  {
    id: 1,
    link: "",
    label: "خانه",
    icon: RiHome4Fill
  },
  {
    id: 2,
    link: "/aboutUs",
    label: "درباره ما",
    icon: FaReadme,
  }, 
  {
    id: 3,
    link: "/blogs",
    label: "مقاله‌ها",
    icon: RiArticleFill,
  },

];
