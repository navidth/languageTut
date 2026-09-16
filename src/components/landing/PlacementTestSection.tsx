import Link from "next/link";
import {
  HiArrowLeft,
  HiChartBar,
  HiOutlineClipboardCheck,
  HiSparkles,
} from "react-icons/hi";
import AuthModalButton from "@/components/auth/AuthModalButton";
import { PLACEMENT_SECTION_ID } from "@/lib/routes";

const benefits = [
  { icon: HiOutlineClipboardCheck, text: "مشاهده دوره‌ها", href: "/courses" },
  { icon: HiChartBar, text: "IELTS", href: "/ielts" },
  { icon: HiSparkles, text: "مشاوره آنلاین", href: "/consultation" },
];

export default function PlacementTestSection() {
  return (
    <section
      id={PLACEMENT_SECTION_ID}
      tabIndex={-1}
      aria-labelledby="placement-heading"
      className="scroll-mt-24 bg-background px-4 py-16 outline-none sm:px-6 lg:py-10"
    >
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary px-6 py-14 text-white shadow-[var(--shadow-brand-md)] sm:px-10 lg:px-16 lg:py-20">
        <div
          className="pointer-events-none absolute -start-20 -top-24 size-72 rounded-full border border-white/10 bg-brand-accent/10 blur-sm"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-44 -end-24 size-80 rounded-full border-[3rem] border-white/5"
          aria-hidden="true"
        />
        <HiSparkles
          className="pointer-events-none absolute end-12 top-10 hidden size-16 rotate-12 text-brand-accent/35 sm:block"
          aria-hidden="true"
        />

        <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-accent/35 bg-brand-accent/10 px-4 py-2 text-sm font-bold text-brand-accent">
              <HiSparkles aria-hidden="true" />
              نقطه شروع مسیر شما
            </span>
            <h2
              id="placement-heading"
              className="mt-6 text-4xl font-black leading-tight sm:text-5xl"
            >
              آزمون تعیین سطح
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              آزمون تعیین سطح کمک می‌کند دانش فعلی شما را بهتر بشناسیم و مسیر
              یادگیری مناسب‌تری بسازیم؛ مسیری که نه بیش از حد ساده باشد و نه شما
              را سردرگم کند.
            </p>
            <AuthModalButton
              intent="placement"
              className="mt-8 min-h-12 px-7 text-base"
            >
              <span className="flex items-center gap-2">
                همین حالا شروع کنید
                <HiArrowLeft className="size-5" aria-hidden="true" />
              </span>
            </AuthModalButton>
          </div>
          <div className="grid grid-cols-3 items-center justify-center gap-5 sm:gap-6">
            {benefits.map(({ icon: Icon, text, href }, index) => (
              <Link
                key={text}
                href={href}
                className={`group flex min-w-0 flex-col items-center justify-center gap-4 rounded-2xl border p-4 text-center backdrop-blur-sm hover:-translate-y-1 hover:border-brand-accent/60 hover:bg-white/[0.12] ${index === 1 ? "min-h-36 scale-[1.06] border-brand-accent/35 bg-white/[0.1]" : "min-h-32 border-white/10 bg-white/[0.07]"}`}
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-accent font-black text-brand-primary transition-transform group-hover:scale-105">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold leading-6 text-white sm:text-base">{text}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
