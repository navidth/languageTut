import { MenuItems } from "@/types";
import { BsPersonCircle } from "react-icons/bs";
import { FaChalkboardTeacher, FaReadme } from "react-icons/fa";
import { MdCastForEducation, MdHomeWork, MdNotificationsActive } from "react-icons/md";
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

export const itemsStudent: MenuItems = [
  {
    id: 1,
    link: "/student",
    label: "خانه",
    icon: RiHome4Fill
  },
  {
    id: 2,
    link: "student/homework",
    label: "تکالیف",
    icon: MdHomeWork
  },
  {
    id: 3,
    link: "student/educiton",
    label: "دوره‌های من",
    icon: MdCastForEducation
  },
  {
    id: 4,
    link: "student/addteach",
    label: "انتخاب استاد",
    icon: FaChalkboardTeacher
  },
  {
    id: 5,
    link: "student/notification",
    label: "اعلان‌ها",
    icon: MdNotificationsActive
  },
  {
    id: 5,
    link: "student/profile",
    label: "صفحه شخصی",
    icon: BsPersonCircle
  },
]
