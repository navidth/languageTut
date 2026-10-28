import Link from "next/link";
import {
  HiArrowLeft,
  HiChartBar,
  HiOutlineClipboardCheck,
  HiSparkles,
} from "react-icons/hi";
import AuthModalButton from "@/components/auth/AuthModalButton";
import Reveal from "@/components/ui/Reveal";
import { PLACEMENT_SECTION_ID } from "@/lib/routes";

// IELTS sits in the middle as the featured link; the two beside it share one
// size whatever their label length.
const benefits = [
  { icon: HiOutlineClipboardCheck, text: "مشاهده دوره‌ها", href: "/courses", featured: false },
  { icon: HiChartBar, text: "IELTS", href: "/ielts", featured: true },
  { icon: HiSparkles, text: "مشاوره آنلاین", href: "/consultation", featured: false },
];

export default function PlacementTestSection() {
  return (
    <section
      id={PLACEMENT_SECTION_ID}
      tabIndex={-1}
      aria-labelledby="placement-heading"
      className="scroll-mt-24 bg-background px-4 py-16 outline-none sm:px-6 lg:py-10"
    >
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary px-6 py-14 text-white shadow-[var(--shadow-brand-md)] sm:px-10 lg:px-16 lg:py-20 dark:border dark:border-white/10">
        <div
          className="pointer-events-none absolute -start-20 -top-24 size-72 rounded-full border border-white/10 bg-brand-accent/10 blur-sm"
          aria-hidden="true"
        />
        <div
          // An inset shadow rather than a border: the global `* { border-color }`
          // rule in globals.css overrides border colour utilities, which drew
          // this 5% white ring as a solid light one over the links.
          className="pointer-events-none absolute -bottom-44 -end-24 size-80 rounded-full shadow-[inset_0_0_0_3rem_rgb(255_255_255/0.05)]"
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
          {/* Fixed heights rather than min-heights: a label that wraps to two
              lines no longer makes its card taller than its neighbour. The
              middle column is wider and the IELTS card taller, without a
              scale transform, so its text stays sharp. */}
          <div className="grid grid-cols-[1fr_1.2fr_1fr] items-center gap-3 sm:gap-5">
            {benefits.map(({ icon: Icon, text, href, featured }) => (
              <Link
                key={text}
                href={href}
                className={`group flex min-w-0 flex-col items-center justify-center rounded-2xl border p-3 text-center backdrop-blur-sm hover:-translate-y-1 hover:bg-white/[0.12] sm:p-4 ${
                  featured
                    ? "h-44 gap-3 bg-white/[0.11] shadow-[0_18px_44px_-14px_rgb(231_121_23/0.55)] ring-1 ring-brand-accent/60 hover:ring-brand-accent sm:h-52 sm:gap-4"
                    : "h-36 gap-3 border-white/10 bg-white/[0.06] hover:border-brand-accent/60 sm:h-40"
                }`}
              >
                <span
                  className={`grid shrink-0 place-items-center rounded-2xl bg-brand-accent text-brand-primary transition-transform group-hover:scale-105 ${
                    featured ? "size-14 shadow-[0_8px_24px_rgb(231_121_23/0.4)] sm:size-16" : "size-11 sm:size-12"
                  }`}
                >
                  <Icon className={featured ? "size-7 sm:size-8" : "size-5 sm:size-6"} aria-hidden="true" />
                </span>
                {/* Side labels reserve two lines, so both icons sit at the same height. */}
                <span
                  className={`grid place-items-center font-bold text-white ${
                    featured ? "text-base sm:text-xl" : "min-h-12 text-sm leading-6"
                  }`}
                >
                  {text}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
