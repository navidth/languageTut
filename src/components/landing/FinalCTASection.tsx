import Link from "next/link";
import { HiArrowLeft, HiSparkles } from "react-icons/hi";
import AuthModalButton from "@/components/auth/AuthModalButton";

export default function FinalCTASection() {
  return (
    <section aria-labelledby="final-cta-heading" className="bg-background px-4 pb-24 sm:px-6 lg:pb-32">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-brand-primary px-6 py-16 text-center text-white shadow-[var(--shadow-brand-md)] sm:px-10 lg:py-20">
        <div className="pointer-events-none absolute -start-20 -top-24 size-72 rounded-full bg-brand-secondary/70 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-36 -end-20 size-80 rounded-full bg-brand-accent/15 blur-3xl" aria-hidden="true" />
        <HiSparkles className="absolute end-[12%] top-12 hidden size-10 rotate-12 text-brand-accent/40 sm:block" aria-hidden="true" />

        <div className="relative mx-auto max-w-3xl">
          <p className="text-sm font-bold text-brand-accent">یک قدم کوچک، یک مسیر روشن‌تر</p>
          <h2 id="final-cta-heading" className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
            آماده‌اید زبان را هدفمندتر ادامه دهید؟
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
            به‌عنوان زبان‌آموز مسیر خود را بسازید یا به‌عنوان مدرس، تجربه آموزشی منظم‌تری برای زبان‌آموزانتان فراهم کنید.
          </p>
          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <AuthModalButton className="min-h-12 px-7 text-base">
              <span className="flex items-center gap-2">
                شروع یادگیری
                <HiArrowLeft className="size-5" aria-hidden="true" />
              </span>
            </AuthModalButton>
            <Link href="/teacher" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.07] px-7 text-base font-bold text-white hover:border-brand-accent hover:bg-white/[0.12]">
              ورود به بخش مدرس‌ها
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
