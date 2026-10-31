import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { HiSparkles } from "react-icons/hi";
import AuthModalButton from "../auth/AuthModalButton";
// Poses of the site's character, cut from the character sheet in
// public/images/character. Decorative, so they carry no alt text. Static
// imports give each one a blur placeholder that paints with the HTML, so the
// characters never pop into an empty space.
import learnerPose from "../../../public/images/character/03-celebrate.png";
import teacherPose from "../../../public/images/character/09-confident.png";
import { Button } from "flowbite-react";

const poseSizes =
  "(min-width: 1280px) 250px, (min-width: 1024px) 200px, (min-width: 768px) 140px, 160px";
// The feet sit on the bottom edge of the half; the ellipse is their shadow.
const poseFrameClass =
  "hero-pose-enter relative flex shrink-0 items-end after:absolute after:inset-x-[12.5%] after:bottom-0 after:h-3 after:rounded-[100%] after:bg-black/25 after:blur-md";
// 290px on phones; the md step is smaller because the halves are narrowest there.
const poseImageClass =
  "relative h-[290px] w-auto md:h-[260px] lg:h-[360px] xl:h-[460px]";

/** Delay for the `.hero-enter` animation (globals.css), to stagger the pieces. */
function enter(ms: number) {
  return { style: { "--hero-delay": `${ms}ms` } as CSSProperties };
}

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
              {/* Hidden where the column beside the character is too narrow for it: the smallest phones and md tablets.
                  The heading stays on one line from 390px; narrower phones wrap it, or it runs over the character. */}
              <span
                {...enter(0)}
                className="hero-enter brand-badge mb-6  max-w-full rounded-full px-3 py-2 text-xs font-bold min-[375px]:inline-flex md:hidden lg:inline-flex xl:px-4 whitespace-nowrap"
              >
                {/* Swapped in CSS rather than by measuring the window, so the
                    server HTML already matches the screen. */}
                <span className="min-[401px]:hidden">مسیر پیشرفت شما</span>
                <span className="hidden min-[401px]:inline">مسیر شخصی شما برای پیشرفت</span>
              </span>
              <h1
                {...enter(80)}
                className="hero-enter sm:mb-4 mb-1 sm:text-3xl text-2xl font-bold min-[370px]:whitespace-nowrap! lg:text-4xl xl:text-5xl"
              >
                زبان آموز هستید؟
              </h1>
              <p
                {...enter(160)}
                className="hero-enter mb-6 text-muted-foreground sm:text-base text-xs"
              >
                از اینجا آغاز کنید
              </p>
              <div {...enter(240)} className="hero-enter">
                <AuthModalButton className=" text-center">
                  شروع یادگیری
                </AuthModalButton>
              </div>
            </div>
            <div className={poseFrameClass} {...enter(120)}>
              <Image
                src={learnerPose}
                alt=""
                aria-hidden="true"
                priority
                // The largest thing in the first view, so the browser fetches
                // it ahead of the other preloads.
                fetchPriority="high"
                placeholder="blur"
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
            <div className={poseFrameClass} {...enter(240)}>
              <Image
                src={teacherPose}
                alt=""
                aria-hidden="true"
                priority
                fetchPriority="high"
                placeholder="blur"
                sizes={poseSizes}
                className={poseImageClass}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start justify-center py-10 text-start md:py-20">
              <span
                {...enter(120)}
                className="hero-enter mb-6  max-w-full rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white min-[375px]:inline-flex md:hidden lg:inline-flex xl:px-4 xl:text-sm"
              >
                مدیریت حرفه‌ای آموزش
              </span>
              <h1
                {...enter(200)}
                className="hero-enter sm:mb-4 mb-1 sm:text-3xl text-2xl font-bold lg:text-4xl xl:text-5xl"
              >
                مدرس هستید؟
              </h1>
              <p
                {...enter(280)}
                className="hero-enter mb-6 text-xs sm:text-base text-white/75"
              >
                <span className="min-[401px]:hidden">مدیریت هوشمند کلاس‌ها</span>
                <span className="hidden min-[401px]:inline">کلاس ها و شاگردانتان را هوشمند مدیریت کنید</span>
              </p>
              <div {...enter(360)} className="hero-enter">
                <Button href="/teacher" className="brand-button-inverse rounded-full font-semibold">
                  شروع تدریس
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        {...enter(420)}
        className="hero-enter absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block"
      >
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
