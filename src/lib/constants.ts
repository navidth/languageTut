import { MenuItems } from "@/types";
import { BsPersonCircle } from "react-icons/bs";
import { FaLayerGroup, FaQuestionCircle, FaReadme } from "react-icons/fa";
import { HiOutlineInformationCircle, HiSparkles } from "react-icons/hi";
import { MdCastForEducation, MdHomeWork, MdOutlineAssignmentTurnedIn, MdQuiz } from "react-icons/md";
import { RiHome4Fill } from "react-icons/ri";

export const menuItems: MenuItems = [
  { id: 1, link: "/", label: "خانه", icon: RiHome4Fill },
  { id: 2, link: "/courses", label: "دوره‌ها", icon: MdCastForEducation },
  { id: 3, link: "/#features", label: "امکانات", icon: HiSparkles },
  { id: 4, link: "/#about", label: "درباره ما", icon: HiOutlineInformationCircle },
];

export const itemsStudent: MenuItems = [
  { id: 1, link: "/student", label: "داشبورد", icon: RiHome4Fill },
  { id: 2, link: "/student/placement-test", label: "تعیین سطح", icon: MdOutlineAssignmentTurnedIn },
  { id: 3, link: "/student/levels", label: "سطح زبان", icon: FaLayerGroup },
  { id: 4, link: "/student/skills", label: "مهارت‌ها", icon: FaReadme },
  { id: 5, link: "/student/courses", label: "کورس‌های من", icon: MdCastForEducation },
  { id: 6, link: "/student/lessons", label: "درس‌ها", icon: MdHomeWork },
  { id: 7, link: "/student/questions", label: "سؤال‌ها", icon: FaQuestionCircle },
  { id: 8, link: "/student/tests", label: "تمرین‌های تستی", icon: MdQuiz },
  { id: 9, link: "/student/profile", label: "پروفایل", icon: BsPersonCircle },
];

export const itemsTeacher: MenuItems = [
  { id: 1, link: "/teacher", label: "داشبورد", icon: RiHome4Fill },
];
