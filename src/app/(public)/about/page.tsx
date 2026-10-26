import type { Metadata } from "next";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";
import AuthModalButton from "@/components/auth/AuthModalButton";
import AboutApproach from "@/components/landing/about/AboutApproach";
import AboutStory from "@/components/landing/about/AboutStory";
import AboutSection from "@/components/landing/AboutSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import PageHero from "@/components/landing/PageHero";

const description =
  "ExamificatioN پلتفرم آموزش زبانی است که زبان‌آموز و مدرس را در یک مسیر مشترک کنار هم قرار می‌دهد؛ از تعیین سطح تا تمرین، تکلیف و دیدن پیشرفت.";

export const metadata: Metadata = {
  title: "درباره ما",
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "درباره ما | ExamificatioN",
    description,
    url: "/about",
    type: "website",
    locale: "fa_IR",
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="درباره ما"
        title="یادگیری زبان باید شخصی، روشن و قابل‌اندازه‌گیری باشد"
        description="ما ابزارهایی می‌سازیم که به زبان‌آموز نشان می‌دهد کجای مسیر است و به مدرس کمک می‌کند دقیق‌تر همراهش باشد."
      >
        <AuthModalButton className="min-h-12 px-7 text-base">
          <span className="flex items-center gap-2">
            شروع یادگیری
            <HiArrowLeft className="size-5" aria-hidden="true" />
          </span>
        </AuthModalButton>
        <Link href="/features" className="ghost-button inline-flex min-h-12 items-center justify-center rounded-full px-7 text-base">
          آشنایی با امکانات
        </Link>
      </PageHero>
      <AboutStory />
      <AboutSection />
      <AboutApproach />
      <FinalCTASection />
    </>
  );
}
