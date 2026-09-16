import type { Metadata } from "next";
import { HiChartBar } from "react-icons/hi";
import ComingSoonPage from "@/components/landing/ComingSoonPage";

export const metadata: Metadata = {
  title: "IELTS — به‌زودی",
  description: "بخش تخصصی IELTS در ExamificatioN به‌زودی در دسترس قرار می‌گیرد.",
};

export default function IeltsPage() {
  return (
    <ComingSoonPage
      eyebrow="IELTS در ExamificatioN"
      title="آمادگی تخصصی آزمون IELTS"
      description="دوره‌ها، آزمون‌های آزمایشی و مسیر تخصصی آمادگی آیلتس در حال آماده‌سازی است و به‌زودی در دسترس قرار می‌گیرد."
      icon={HiChartBar}
    />
  );
}
