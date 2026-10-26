"use client";

import Image from "next/image";
import Link from "next/link";
import { HiSparkles } from "react-icons/hi";
import AuthModalButton from "../auth/AuthModalButton";

// Poses of the site's character, cut from the character sheet in
// public/images/character. Decorative, so they carry no alt text.
const learnerPose = {
  src: "/images/character/03-celebrate.png",
  width: 363,
  height: 691,
};
const teacherPose = {
  src: "/images/character/09-confident.png",
  width: 370,
  height: 732,
};
const poseSizes =
  "(min-width: 1280px) 250px, (min-width: 1024px) 200px, (min-width: 768px) 140px, 160px";
// The feet sit on the bottom edge of the half; the ellipse is their shadow.
const poseFrameClass =
  "relative flex shrink-0 items-end after:absolute after:inset-x-[12.5%] after:bottom-0 after:h-3 after:rounded-[100%] after:bg-black/25 after:blur-md";
// 290px on phones; the md step is smaller because the halves are narrowest there.
const poseImageClass =
  "relative h-[290px] w-auto md:h-[260px] lg:h-[360px] xl:h-[460px]";

export default function HeroSplit() {
  return (
    <section className="relative min-h-[720px] w-full overflow-hidden md:min-h-[680px]">
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
        {/* Each half keeps its text at the outer edge and its character toward
            the centre, so the two characters frame the AI button. The inner
            padding from lg up is the room that button needs. */}
        <div className="relative flex overflow-hidden bg-[linear-gradient(59deg,rgba(220,220,220,1)_0%,rgba(255,255,255,1)_100%)] px-5 text-foreground sm:px-6 md:pe-10 lg:pe-18 xl:pe-20 dark:bg-[linear-gradient(59deg,var(--muted)_0%,var(--secondary-soft)_100%)]">
          <div
            className="pointer-events-none absolute -bottom-16 end-6 size-64 rounded-full bg-brand-accent/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto flex w-full max-w-xl items-stretch justify-between gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
            <div className="flex min-w-0 flex-1 flex-col items-start justify-center pb-10 pt-24 text-start md:py-20">
              {/* Hidden where the column beside the character is too narrow for it: the smallest phones and md tablets. */}
              <span className="brand-badge mb-6 hidden max-w-full rounded-full px-3 py-2 text-xs font-bold min-[375px]:inline-flex md:hidden lg:inline-flex xl:px-4 xl:text-sm">
                مسیر شخصی شما برای پیشرفت
              </span>
              <h1 className="mb-4 text-3xl font-bold lg:text-4xl xl:text-5xl">
                زبان آموز هستید؟
              </h1>
              <p className="mb-6 text-muted-foreground">از اینجا آغاز کنید</p>
              <AuthModalButton className="cursor-pointer text-center">
                شروع یادگیری
              </AuthModalButton>
            </div>
            <div className={poseFrameClass}>
              <Image
                {...learnerPose}
                alt=""
                aria-hidden="true"
                priority
                sizes={poseSizes}
                className={poseImageClass}
              />
            </div>
          </div>
        </div>

        <div className="relative flex overflow-hidden bg-gradient-to-br from-brand-primary to-brand-secondary px-5 text-white sm:px-6 md:ps-10 lg:ps-18 xl:ps-20">
          <div
            className="pointer-events-none absolute -bottom-16 start-6 size-64 rounded-full bg-brand-accent/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto flex w-full max-w-xl items-stretch justify-between gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
            <div className={poseFrameClass}>
              <Image
                {...teacherPose}
                alt=""
                aria-hidden="true"
                priority
                sizes={poseSizes}
                className={poseImageClass}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start justify-center py-10 text-start md:py-20">
              <span className="mb-6 hidden max-w-full rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white min-[375px]:inline-flex md:hidden lg:inline-flex xl:px-4 xl:text-sm">
                مدیریت حرفه‌ای آموزش
              </span>
              <h1 className="mb-4 text-3xl font-bold lg:text-4xl xl:text-5xl">
                مدرس هستید؟
              </h1>
              <p className="mb-6 text-white/75">
                کلاس ها و شاگردانتان را هوشمند مدیریت کنید
              </p>
              <Link
                href="/teacher"
                className="brand-button-inverse inline-flex cursor-pointer rounded-full px-6 py-2.5"
              >
                شروع تدریس
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
        <Link
          href="/ai"
          className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-full bg-background text-brand-primary shadow-2xl transition hover:scale-105 dark:ring-1 dark:ring-white/15"
        >
          <HiSparkles className="mb-2 h-8 w-8 text-brand-primary dark:text-brand-accent" />
          <span className="text-sm font-semibold dark:text-white">
            شروع هوشمند با AI
          </span>
        </Link>
      </div>
    </section>
  );
}
