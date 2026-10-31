import Link from "next/link";
import {
  HiArrowLeft,
} from "react-icons/hi";
import { teacherTools } from "@/constants/landing";

export default function TeacherFeatures() {
  return (
    <section
      aria-labelledby="teacher-features-heading"
      className="relative overflow-hidden bg-brand-primary px-4 py-24 text-white sm:px-6 lg:py-32"
    >
      <div className="pointer-events-none absolute -start-40 top-0 size-120 rounded-full bg-brand-secondary/45 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-56 -end-24 size-128 rounded-full bg-brand-accent/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <span className="inline-flex rounded-full border border-brand-accent/35 bg-brand-accent/10 px-4 py-2 text-sm font-bold text-brand-accent">
            برای مدرس
          </span>
          <h2 id="teacher-features-heading" className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
            مدیریت کمتر، تمرکز بیشتر بر آموزش
          </h2>
          <p className="mt-5 text-base leading-8 text-white/65">
            کلاس‌ها، زبان‌آموزان و روند یادگیری را در یک قاب ببینید و زمان بیشتری برای آموزش باکیفیت داشته باشید.
          </p>
          <Link
            href="/teacher"
            className="brand-button-inverse mt-8 inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-2.5"
          >
            ورود به فضای مدرس
            <HiArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="space-y-4">
          {teacherTools.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex gap-5 rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-sm transition hover:border-brand-accent/45 hover:bg-white/[0.085] sm:p-7"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-accent text-brand-primary">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-black sm:text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/60 sm:text-base">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
