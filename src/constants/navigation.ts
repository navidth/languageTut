import type { MenuItems, PanelLink, PanelNavEntry } from "@/types/navigation";
import { ROUTES } from "@/constants/routes";
import { BsPersonCircle } from "react-icons/bs";
import { FaLayerGroup, FaQuestionCircle, FaReadme } from "react-icons/fa";
import {
  HiAcademicCap,
  HiChartBar,
  HiCollection,
  HiOutlineInformationCircle,
  HiPencilAlt,
  HiSparkles,
  HiTrendingUp,
} from "react-icons/hi";
import {
  MdAssignment,
  MdCastForEducation,
  MdMenuBook,
  MdOutlineAssignmentTurnedIn,
  MdQuiz,
} from "react-icons/md";
import { RiHome4Fill } from "react-icons/ri";

export const menuItems: MenuItems = [
  { id: 1, link: "/", label: "خانه", icon: RiHome4Fill },
  { id: 2, link: "/courses", label: "دوره‌ها", icon: MdCastForEducation },
  { id: 5, link: "/ielts", label: "IELTS", icon: HiChartBar },
  { id: 3, link: "/features", label: "امکانات", icon: HiSparkles },
  {
    id: 4,
    link: "/about",
    label: "درباره ما",
    icon: HiOutlineInformationCircle,
  },
];

// Student panel

const studentPages = {
  dashboard: { id: "dashboard", link: ROUTES.studentDashboard, label: "داشبورد", hint: "خلاصه پیشرفت و قدم بعدی", icon: RiHome4Fill, exact: true },
  myCourses: { id: "my-courses", link: "/student/courses", label: "کورس‌های من", hint: "دوره‌هایی که ثبت‌نام کرده‌ای", icon: MdCastForEducation },
  allCourses: { id: "all-courses", link: ROUTES.studentCourses, label: "همه دوره‌ها", hint: "فهرست دوره‌ها و ثبت‌نام", icon: HiCollection },
  lessons: { id: "lessons", link: "/student/lessons", label: "درس‌ها", hint: "محتوای آموزشی و وضعیت مطالعه", icon: MdMenuBook },
  tests: { id: "tests", link: ROUTES.studentTests, label: "تمرین‌های تستی", hint: "آزمون زمان‌دار و نمره فوری", icon: MdQuiz },
  questions: { id: "questions", link: "/student/questions", label: "سؤال‌ها", hint: "بانک سؤال‌های تمرینی", icon: FaQuestionCircle },
  skills: { id: "skills", link: "/student/skills", label: "مهارت‌ها", hint: "شنیدن، خواندن، نوشتن و گفتار", icon: FaReadme },
  homework: { id: "homework", link: ROUTES.studentHomework, label: "تکالیف", hint: "ارسال و پیگیری تکلیف‌ها", icon: MdAssignment },
  placement: { id: "placement", link: ROUTES.placementTest, label: "تعیین سطح", hint: "آزمون کوتاه برای پیدا کردن سطح", icon: MdOutlineAssignmentTurnedIn },
  levels: { id: "levels", link: "/student/levels", label: "سطح‌های زبان", hint: "مسیر استاندارد A1 تا C2", icon: FaLayerGroup },
  profile: { id: "profile", link: "/student/profile", label: "پروفایل من", hint: "اطلاعات حساب و امنیت", icon: BsPersonCircle },
} satisfies Record<string, PanelLink>;

/**
 * The student menu: five entries, with related pages grouped, so the phone
 * dock fits them like the landing page dock. The profile sits apart, at the
 * foot of the sidebar; on phones it is in the header's user menu.
 */
export const studentNavigation: PanelNavEntry[] = [
  studentPages.dashboard,
  {
    id: "courses",
    label: "دوره‌ها",
    shortLabel: "دوره‌ها",
    icon: HiAcademicCap,
    links: [studentPages.myCourses, studentPages.allCourses, studentPages.lessons],
  },
  {
    id: "practice",
    label: "تمرین و آزمون",
    shortLabel: "تمرین",
    icon: HiPencilAlt,
    links: [studentPages.tests, studentPages.questions, studentPages.skills],
  },
  studentPages.homework,
  {
    id: "level",
    label: "سطح من",
    shortLabel: "سطح من",
    icon: HiTrendingUp,
    links: [studentPages.placement, studentPages.levels],
  },
];

export const studentProfileLink = studentPages.profile;

/** Shortcut tiles at the foot of the student dashboard. */
export const studentQuickLinks: PanelLink[] = [
  studentPages.skills,
  studentPages.tests,
  studentPages.homework,
  studentPages.questions,
  studentPages.profile,
];
