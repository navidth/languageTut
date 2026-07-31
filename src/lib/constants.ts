import { MenuItems } from "@/types";
import { BsPersonCircle } from "react-icons/bs";
import { FaLayerGroup, FaQuestionCircle, FaReadme } from "react-icons/fa";
import { MdCastForEducation, MdHomeWork, MdQuiz } from "react-icons/md";
import { RiArticleFill, RiHome4Fill } from "react-icons/ri";

export const menuItems: MenuItems = [
  { id: 1, link: "/", label: "خانه", icon: RiHome4Fill },
  { id: 2, link: "/courses", label: "دوره‌ها", icon: MdCastForEducation },
  { id: 3, link: "/aboutUs", label: "درباره ما", icon: FaReadme },
  { id: 4, link: "/blogs", label: "مقاله‌ها", icon: RiArticleFill },
];

export const itemsStudent: MenuItems = [
  { id: 1, link: "/student", label: "داشبورد", icon: RiHome4Fill },
  { id: 2, link: "/student/levels", label: "سطح زبان", icon: FaLayerGroup },
  { id: 3, link: "/student/skills", label: "مهارت‌ها", icon: FaReadme },
  { id: 4, link: "/student/courses", label: "کورس‌های من", icon: MdCastForEducation },
  { id: 5, link: "/student/lessons", label: "درس‌ها", icon: MdHomeWork },
  { id: 6, link: "/student/questions", label: "سؤال‌ها", icon: FaQuestionCircle },
  { id: 7, link: "/student/tests", label: "تمرین‌های تستی", icon: MdQuiz },
  { id: 8, link: "/student/profile", label: "پروفایل", icon: BsPersonCircle },
];

export const itemsTeacher: MenuItems = [
  { id: 1, link: "/teacher", label: "داشبورد", icon: RiHome4Fill },
];
