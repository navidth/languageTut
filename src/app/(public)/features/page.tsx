import type { Metadata } from "next";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";
import AuthModalButton from "@/components/auth/AuthModalButton";
import ExtraPathsSection from "@/components/landing/features/ExtraPathsSection";
import LearnerFeatures from "@/components/landing/features/LearnerFeatures";
import TeacherFeatures from "@/components/landing/features/TeacherFeatures";
import FinalCTASection from "@/components/landing/FinalCTASection";
import PageHero from "@/components/landing/PageHero";

const title = "امکانات ExamificatioN";
const description =
  "تعیین سطح، دوره‌های سطح‌بندی‌شده از A1 تا C2، تمرین چهار مهارت، تکالیف آنلاین، آزمون تمرینی با کارنامه و ابزارهای مدیریت کلاس برای مدرس‌ها.";

export const metadata: Metadata = {
  title: "امکانات",
  description,
  alternates: { canonical: "/features" },
  openGraph: {
    title: `${title} | ExamificatioN`,
    description,
    url: "/features",
    type: "website",
    locale: "fa_IR",
  },
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow={title}
        title="هر آنچه برای پیشرفت در زبان لازم دارید، در یک مسیر"
        description="از تعیین سطح تا درس، تکلیف و کارنامه؛ هر بخش ExamificatioN کمک می‌کند بدانید کجای مسیر هستید و قدم بعدی‌تان چیست."
        highlights={["شش سطح، از مبتدی تا پیشرفته", "چهار مهارت اصلی", "تکالیف آنلاین", "کارنامه آزمون"]}
      >
        <AuthModalButton className="min-h-12 px-7 text-base">
          <span className="flex items-center gap-2">
            شروع یادگیری
            <HiArrowLeft className="size-5" aria-hidden="true" />
          </span>
        </AuthModalButton>
        <Link href="/courses" className="ghost-button inline-flex min-h-12 items-center justify-center rounded-full px-7 text-base">
          مشاهده دوره‌ها
        </Link>
      </PageHero>
      <LearnerFeatures />
      <TeacherFeatures />
      <ExtraPathsSection />
      <FinalCTASection />
    </>
  );
}
