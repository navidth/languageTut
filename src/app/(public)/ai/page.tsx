import type { Metadata } from "next";
import { HiSparkles } from "react-icons/hi";
import ComingSoonPage from "@/components/landing/ComingSoonPage";

export const metadata: Metadata = {
  title: "دستیار هوش مصنوعی — به‌زودی",
  description: "دستیار هوش مصنوعی ExamificatioN به‌زودی در دسترس قرار می‌گیرد.",
};

export default function AiPage() {
  return (
    <ComingSoonPage
      eyebrow="هوش مصنوعی ExamificatioN"
      title="دستیار هوشمند یادگیری"
      description="دستیار شخصی‌سازی‌شده یادگیری زبان در حال توسعه است و به‌زودی برای تمرین، تحلیل پیشرفت و پیشنهاد مسیر آموزشی در دسترس خواهد بود."
      icon={HiSparkles}
    />
  );
}
