import {
  HiArrowLeft,
  HiChartBar,
  HiOutlineClipboardCheck,
  HiSparkles,
} from "react-icons/hi";
import AuthModalButton from "@/components/auth/AuthModalButton";
import { PLACEMENT_SECTION_ID } from "@/lib/routes";

const benefits = [
  { icon: HiOutlineClipboardCheck, text: "سنجش دقیق مهارت‌های فعلی" },
  { icon: HiChartBar, text: "پیشنهاد مسیر متناسب با سطح شما" },
  { icon: HiSparkles, text: "تجربه یادگیری شخصی‌سازی‌شده" },
];

export default function PlacementTestSection() {
  return (
    <section
      id={PLACEMENT_SECTION_ID}
      tabIndex={-1}
      aria-labelledby="placement-heading"
      className="scroll-mt-24 bg-background px-4 py-24 outline-none sm:px-6 lg:py-32"
    >
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary px-6 py-14 text-white shadow-[var(--shadow-brand-md)] sm:px-10 lg:px-16 lg:py-20">
        <div className="pointer-events-none absolute -start-20 -top-24 size-72 rounded-full border border-white/10 bg-brand-accent/10 blur-sm" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-28 -end-16 size-80 rounded-full border-[3rem] border-white/5" aria-hidden="true" />
        <HiSparkles className="pointer-events-none absolute end-12 top-10 hidden size-16 rotate-12 text-brand-accent/35 sm:block" aria-hidden="true" />

        <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-accent/35 bg-brand-accent/10 px-4 py-2 text-sm font-bold text-brand-accent">
              <HiSparkles aria-hidden="true" />
              نقطه شروع مسیر شما
            </span>
            <h2 id="placement-heading" className="mt-6 text-4xl font-black leading-tight sm:text-5xl">
              شما چه سطحی هستید؟
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              آزمون تعیین سطح کمک می‌کند دانش فعلی شما را بهتر بشناسیم و مسیر یادگیری مناسب‌تری بسازیم؛ مسیری که نه بیش از حد ساده باشد و نه شما را سردرگم کند.
            </p>
            <AuthModalButton
              intent="placement"
              className="mt-8 min-h-12 px-7 text-base"
            >
              <span className="flex items-center gap-2">
                شروع تعیین سطح
                <HiArrowLeft className="size-5" aria-hidden="true" />
              </span>
            </AuthModalButton>
          </div>

          <div className="grid gap-3">
            {benefits.map(({ icon: Icon, text }, index) => (
              <div
                key={text}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-accent font-black text-brand-primary">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <span lang="en" dir="ltr" className="text-xs text-white/45">
                    0{index + 1}
                  </span>
                  <p className="mt-0.5 font-bold text-white">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
