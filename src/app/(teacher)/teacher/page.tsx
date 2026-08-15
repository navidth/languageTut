import type { Metadata } from "next";
import { HiAcademicCap } from "react-icons/hi";
import ComingSoonPage from "@/components/landing/ComingSoonPage";

export const metadata: Metadata = {
  title: "پنل مدرس — به‌زودی",
  description: "پنل اختصاصی مدرس‌های ExamificatioN به‌زودی در دسترس قرار می‌گیرد.",
};

export default function TeacherPage() {
  return (
    <ComingSoonPage
      eyebrow="ویژه مدرس‌ها"
      title="پنل هوشمند مدرس"
      description="ابزارهای مدیریت کلاس، زبان‌آموزها و گزارش‌های آموزشی در حال آماده‌سازی هستند. به‌زودی این بخش در دسترس شما قرار می‌گیرد."
      icon={HiAcademicCap}
    />
  );
}
