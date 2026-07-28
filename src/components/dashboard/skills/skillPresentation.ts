import type { SkillName } from "@/lib/skills";

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
