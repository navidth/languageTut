import type { SkillName } from "@/types/skill";
import type { IconType } from "react-icons";
import { FaHeadphones, FaBookOpen, FaPen, FaMicrophone } from "react-icons/fa";

export const SKILL_NAMES = [
  "listening",
  "reading",
  "writing",
  "speaking",
] as const;

export const skillLabels: Record<SkillName, string> = {
  listening: "شنیداری",
  reading: "خواندن",
  writing: "نوشتن",
  speaking: "مکالمه",
};

export const skillDescriptions: Record<SkillName, string> = {
  listening: "تقویت درک گفت‌وگوها، سخنرانی‌ها و فایل‌های صوتی انگلیسی",
  reading: "تمرین درک مطلب، یافتن اطلاعات و تحلیل متن‌های انگلیسی",
  writing: "ساختاردهی ایده‌ها و نوشتن پاسخ‌های دقیق و منسجم",
  speaking: "افزایش روانی، دقت و اعتمادبه‌نفس در مکالمه انگلیسی",
};

export const skillIcons: Record<SkillName, IconType> = {
  listening: FaHeadphones,
  reading: FaBookOpen,
  writing: FaPen,
  speaking: FaMicrophone,
};
