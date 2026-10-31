import Link from "next/link";
import {
  HiArrowLeft,
  HiOutlineClipboardCheck,
  HiOutlineCollection,
} from "react-icons/hi";
import AuthModalButton from "@/components/auth/AuthModalButton";
import { CEFR_LEVELS } from "@/constants/levels";
import { FEATURE_SAMPLE_LEVEL, learnerFeatureSkills, learnerFeatureTools } from "@/constants/landing";

export default function LearnerFeatures() {
  return (
    <section aria-labelledby="learner-features-heading" className="bg-secondary-soft px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_0.72fr]">
          <div>
            <span className="section-eyebrow">برای زبان‌آموز</span>
            <h2
              id="learner-features-heading"
              className="mt-5 max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-5xl"
            >
              از شناخت سطح تا تسلط، قدم‌به‌قدم
            </h2>
          </div>
          <p className="text-base leading-8 text-muted-foreground lg:pb-1">
            ابزارهایی که کنار هم کار می‌کنند تا وقت شما صرف تمرین درست شود، نه پیدا کردن آن.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          <article className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:col-span-7 lg:row-span-2">
            <div className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-accent-soft blur-3xl" aria-hidden="true" />
            <div className="relative">
              <span className="grid size-12 place-items-center rounded-2xl bg-brand-primary text-brand-accent dark:bg-brand-accent dark:text-brand-primary">
                <HiOutlineClipboardCheck className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-7 text-sm font-bold text-brand-secondary dark:text-brand-accent">تعیین سطح</p>
              <h3 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">نقطه شروع واقعی خود را پیدا کنید</h3>
              <p className="mt-4 max-w-xl leading-8 text-muted-foreground">
                آزمون تعیین سطح دانش فعلی شما را می‌سنجد تا مسیر یادگیری نه بیش از حد ساده باشد و نه زودتر از آمادگی‌تان دشوار شود.
              </p>

              {/* Illustration of the A1–C2 scale; the real level comes from the test. */}
              <div className="mt-8 rounded-3xl border border-border bg-background/80 p-5 sm:p-6" aria-hidden="true">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>مقیاس سطح‌بندی</span>
                  <span lang="en" dir="ltr" className="latin-code">CEFR</span>
                </div>
                <div dir="ltr" className="mt-5 flex h-32 items-end gap-2 sm:gap-3">
                  {CEFR_LEVELS.map((level, index) => {
                    const current = level === FEATURE_SAMPLE_LEVEL;
                    return (
                      <div key={level} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                        {current && (
                          <span dir="rtl" className="whitespace-nowrap rounded-full bg-brand-accent px-2.5 py-1 text-[0.7rem] font-black text-brand-primary">
                            سطح شما
                          </span>
                        )}
                        <span
                          className={`w-full rounded-t-xl ${current ? "bg-brand-accent" : index < CEFR_LEVELS.indexOf(FEATURE_SAMPLE_LEVEL) ? "bg-brand-secondary/70 dark:bg-brand-secondary" : "bg-primary-soft"}`}
                          style={{ height: `${28 + index * 12}%` }}
                        />
                        <span lang="en" className={`latin-code text-xs font-bold ${current ? "text-foreground" : "text-muted-foreground"}`}>
                          {level}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <AuthModalButton intent="placement" className="mt-8 px-6">
                <span className="flex items-center gap-2">
                  شروع آزمون تعیین سطح
                  <HiArrowLeft className="size-4" aria-hidden="true" />
                </span>
              </AuthModalButton>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[2rem] bg-brand-primary p-6 text-white sm:p-8 lg:col-span-5">
            <div className="pointer-events-none absolute -bottom-20 -start-16 size-56 rounded-full bg-brand-secondary/60 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <p className="text-sm font-bold text-brand-accent">چهار مهارت اصلی</p>
              <h3 className="mt-2 text-xl font-black sm:text-2xl">مهارت‌ها هماهنگ با هم، نه جدا از هم</h3>
              <ul className="mt-6 grid grid-cols-2 gap-3">
                {learnerFeatureSkills.map(({ icon: Icon, english, persian }) => (
                  <li key={english} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-accent text-brand-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">{persian}</span>
                      <span lang="en" dir="ltr" className="block text-xs text-white/55">{english}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="surface-card flex flex-col rounded-[2rem] p-6 sm:p-8 lg:col-span-5">
            <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-brand-secondary dark:text-brand-accent">
              <HiOutlineCollection className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-6 text-xl font-black text-foreground sm:text-2xl">دوره‌ها و درس‌های سطح‌بندی‌شده</h3>
            <p className="mt-3 leading-7 text-muted-foreground">
              دوره‌ها از <span lang="en" className="latin-code">A1</span> تا <span lang="en" className="latin-code">C2</span> سطح‌بندی شده‌اند و هر دوره از درس‌هایی تشکیل می‌شود که پیشرفت خود را در آن‌ها دنبال می‌کنید.
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex items-center gap-2 self-start text-sm font-bold text-brand-secondary hover:text-brand-primary dark:text-brand-accent dark:hover:text-white"
            >
              مشاهده دوره‌ها
              <HiArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </article>
        </div>

        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {learnerFeatureTools.map(({ icon: Icon, title, text }) => (
            <li key={title} className="surface-card rounded-[1.75rem] p-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-brand-secondary dark:text-brand-accent">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-black text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
