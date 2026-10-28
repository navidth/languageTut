"use client";

import Image from "next/image";
import { useState } from "react";
import { HiPause, HiPlay, HiSparkles } from "react-icons/hi";
import Reveal from "@/components/ui/Reveal";

// Monoline "N" in a rounded square, for the partner brand that has no logo
// file yet.
function NMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-10 sm:size-11" fill="none" stroke="currentColor" aria-hidden="true">
      <rect x="2" y="2" width="44" height="44" rx="13" strokeWidth="2.5" />
      <path d="M16 33V15l16 18V15" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const logos = [
  {
    name: "ExamificatioN",
    mark: (
      <Image
        src="/brand-logo.png"
        width={310}
        height={168}
        sizes="(min-width: 640px) 104px, 89px"
        alt=""
        className="h-12 w-auto brightness-0 invert sm:h-14"
      />
    ),
  },
  {
    name: "IELTS",
    mark: <span className="latin-code text-2xl font-black tracking-[0.2em] sm:text-3xl">IELTS</span>,
  },
  { name: "N", mark: <NMark /> },
  {
    // Placeholder until the advertising agency's logo file is added.
    name: "شرکت تبلیغاتی",
    mark: (
      <span className="inline-flex h-10 items-center rounded-xl border border-dashed border-white/35 px-4 text-sm font-bold text-white/60 sm:h-11">
        لوگوی شرکت تبلیغاتی
      </span>
    ),
  },
] as const;

// Each half of the track repeats the logos twice, so one half is wider than
// the widest container and the loop never shows a gap.
const half = [...logos, ...logos];

export default function PromoStrip() {
  const [paused, setPaused] = useState(false);

  return (
    <section
      aria-label="برندها و برنامه‌ها"
      className="relative overflow-hidden border-y border-white/10 bg-brand-primary bg-linear-to-l from-brand-primary via-brand-secondary/45 to-brand-primary py-7 text-white sm:py-9"
    >
      <Reveal className="mx-auto flex max-w-6xl items-center gap-4 px-4 sm:px-6">
        <div className="group min-w-0 flex-1 overflow-hidden mask-[linear-gradient(to_left,transparent,#000_10%,#000_90%,transparent)]">
          {/* In this right-to-left layout the track overflows to the left, so
              it slides right to bring its second half in. The halves are
              identical, so the jump from 50% back to 0 is invisible. */}
          <div
            className={`flex w-max animate-[promo-marquee_36s_linear_infinite] group-hover:paused ${paused ? "paused" : ""}`}
          >
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy === 1 ? true : undefined}
                className="flex shrink-0 items-center gap-12 pe-12 sm:gap-16 sm:pe-16"
              >
                {half.map(({ name, mark }, index) => (
                  <li
                    key={`${name}-${index}`}
                    aria-hidden={index >= logos.length ? true : undefined}
                    className="flex shrink-0 items-center gap-12 sm:gap-16"
                  >
                    <span className="flex items-center opacity-85" role="img" aria-label={name}>
                      {mark}
                    </span>
                    <HiSparkles className="size-4 shrink-0 text-brand-accent" aria-hidden="true" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? "ادامه حرکت نوار" : "توقف حرکت نوار"}
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-white/15 text-white/70 hover:border-brand-accent hover:text-white motion-reduce:hidden"
        >
          {paused ? <HiPlay className="size-4" aria-hidden="true" /> : <HiPause className="size-4" aria-hidden="true" />}
        </button>
      </Reveal>
    </section>
  );
}
