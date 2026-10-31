import Link from "next/link";
import {
  HiAcademicCap,
  HiArrowLeft,
  HiUserGroup,
} from "react-icons/hi";
import AuthModalButton from "@/components/auth/AuthModalButton";
import Reveal from "@/components/ui/Reveal";
import { LearnerPreview, TeacherPreview } from "@/components/landing/audiences/AudiencePreviews";
import { learnerBenefits, teacherBenefits } from "@/constants/landing";

// Each card is copy plus a cropped product preview. Phones stack the preview
// under the copy; from md the cards become full-width rows with the preview
// beside the copy, and the teacher row is mirrored so the two read as a
// zigzag. The preview is absolutely placed and runs to the card's bottom
// edge, so it never sets the card's height and is cropped like a screenshot.
const cardLayoutClass = "relative flex flex-col overflow-hidden rounded-[2rem] md:grid";
const copyClass = "p-7 sm:p-9 lg:p-12";
const stageClass = "relative h-80 overflow-hidden mask-b-from-80% md:h-auto md:min-h-80";
const previewPositionClass =
  "absolute inset-x-5 bottom-0 top-7 sm:inset-x-8 sm:top-9 md:inset-x-6 lg:inset-x-10 lg:top-12 xl:inset-x-14";

export default function UserTypeSection() {
  return (
    <section
      id="audiences"
      aria-labelledby="audiences-heading"
      className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 lg:py-32"
    >
      <div className="landing-dot-grid pointer-events-none absolute inset-x-0 top-0 h-72 opacity-55" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="grid items-end gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <span className="section-eyebrow">برای هر دو سوی یادگیری</span>
            <h2
              id="audiences-heading"
              className="mt-5 max-w-2xl text-3xl font-black leading-tight text-foreground sm:text-5xl sm:leading-[1.2]"
            >
              یک فضای یکپارچه برای یادگرفتن و یاددادن
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg lg:pb-1.5">
            زبان‌آموز مسیر روشن‌تری برای پیشرفت می‌بیند و مدرس، ابزارهای لازم برای همراهی دقیق‌تر را در اختیار دارد.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:mt-16 lg:gap-6">
          <Reveal
            as="article"
            aria-labelledby="audience-learner"
            className={`surface-card ${cardLayoutClass} md:grid-cols-[1.1fr_1fr]`}
          >
            <div className={copyClass}>
              <p className="inline-flex items-center gap-2 text-sm font-bold text-brand-secondary dark:text-brand-accent">
                <HiAcademicCap className="size-5" aria-hidden="true" />
                برای زبان‌آموز
              </p>
              <h3 id="audience-learner" className="mt-3 text-2xl font-black leading-snug text-foreground sm:text-[1.75rem]">
                پیشرفت، قدم‌به‌قدم و قابل‌فهم
              </h3>
              <p className="mt-3 leading-8 text-muted-foreground">
                به‌جای انتخاب‌های پراکنده، از سطح فعلی خود شروع کنید و روی تمرین‌هایی وقت بگذارید که به هدف شما نزدیک‌ترند.
              </p>
              <ul className="mt-6 divide-y divide-border border-y border-border" aria-label="امکانات زبان‌آموزان">
                {learnerBenefits.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 py-3 text-sm font-semibold text-foreground/85">
                    <Icon className="size-5 shrink-0 text-brand-secondary/70 dark:text-brand-accent/80" aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
              <AuthModalButton className="mt-7 px-6">
                <span className="flex items-center gap-2">
                  ساخت مسیر یادگیری
                  <HiArrowLeft className="size-4" aria-hidden="true" />
                </span>
              </AuthModalButton>
            </div>
            <div
              aria-hidden="true"
              className={`${stageClass} border-t border-border bg-secondary-soft/70 md:border-s md:border-t-0 dark:bg-background/60`}
            >
              <div className={previewPositionClass}>
                <LearnerPreview />
              </div>
            </div>
          </Reveal>

          <Reveal
            as="article"
            aria-labelledby="audience-teacher"
            className={`${cardLayoutClass} bg-linear-to-br from-brand-primary via-brand-primary to-brand-secondary text-white shadow-(--shadow-brand-md) md:grid-cols-[1fr_1.1fr] dark:ring-1 dark:ring-white/10`}
          >
            {/* Copy stays first for reading order; from md it moves to the end side. */}
            <div className={`${copyClass} md:order-2`}>
              <p className="inline-flex items-center gap-2 text-sm font-bold text-brand-accent">
                <HiUserGroup className="size-5" aria-hidden="true" />
                برای مدرس
              </p>
              <h3 id="audience-teacher" className="mt-3 text-2xl font-black leading-snug sm:text-[1.75rem]">
                مدیریت کمتر، تمرکز بیشتر بر آموزش
              </h3>
              <p className="mt-3 leading-8 text-white/70">
                کلاس‌ها، زبان‌آموزان و روند یادگیری را در یک قاب ببینید و زمان بیشتری برای بازخورد و آموزش باکیفیت داشته باشید.
              </p>
              <ul className="mt-6 divide-y divide-white/10 border-y border-white/10" aria-label="امکانات مدرسان">
                {teacherBenefits.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 py-3 text-sm font-semibold text-white/85">
                    <Icon className="size-5 shrink-0 text-brand-accent/80" aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
              <Link
                href="/teacher"
                className="brand-button-inverse mt-7 inline-flex min-h-10 items-center gap-2 rounded-full px-6 py-2.5"
              >
                ورود به فضای مدرس
                <HiArrowLeft className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div
              aria-hidden="true"
              className={`${stageClass} border-t border-white/10 bg-white/4 md:order-1 md:border-e md:border-t-0`}
            >
              <div className={previewPositionClass}>
                <TeacherPreview />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
