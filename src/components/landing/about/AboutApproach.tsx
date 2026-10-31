import Link from "next/link";
import {
  HiArrowLeft,
} from "react-icons/hi";
import { aboutApproachSteps } from "@/constants/landing";

export default function AboutApproach() {
  return (
    <section aria-labelledby="about-approach-heading" className="bg-background px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">رویکرد ما</span>
          <h2 id="about-approach-heading" className="mt-5 text-3xl font-black leading-tight text-foreground sm:text-4xl">
            یک چرخه ساده، برای پیشرفتی پیوسته
          </h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            هر بخش ExamificatioN یکی از این چهار قدم را دقیق‌تر و ساده‌تر می‌کند.
          </p>
        </div>

        <ol className="relative mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* Joins the steps on wide screens: the cards cover it, so it shows
              only in the gaps, level with the icons' centres. */}
          <span className="pointer-events-none absolute inset-x-[12.5%] top-15 hidden border-t-2 border-dashed border-brand-accent/50 lg:block" aria-hidden="true" />
          {aboutApproachSteps.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="surface-card relative rounded-[1.75rem] p-6 text-center">
              <span className="mx-auto grid size-18 place-items-center rounded-2xl bg-brand-primary text-brand-accent">
                <Icon className="size-7" aria-hidden="true" />
              </span>
              <span className="mt-5 block text-xs font-bold text-brand-accent">
                گام {(index + 1).toLocaleString("fa-IR")}
              </span>
              <h3 className="mt-2 text-xl font-black text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-[1.75rem] border border-dashed border-border bg-secondary-soft p-6 text-center sm:flex-row sm:p-8 sm:text-start">
          <div>
            <h3 className="text-lg font-black text-foreground">برای شروع، راهنمایی لازم دارید؟</h3>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">مشاوران ما در انتخاب دوره و مسیر مناسب کنار شما هستند.</p>
          </div>
          <Link
            href="/consultation"
            className="ghost-button inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm"
          >
            گفت‌وگو با مشاور
            <HiArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
