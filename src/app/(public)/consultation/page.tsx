import type { Metadata } from "next";
import Link from "next/link";
import { HiArrowLeft, HiPhone, HiSparkles } from "react-icons/hi";
import { FaTelegramPlane } from "react-icons/fa";

export const metadata: Metadata = {
  title: "مشاوره آنلاین",
  description: "راه‌های ارتباط با مشاور آموزشی ExamificatioN از طریق تماس تلفنی و تلگرام.",
};

export default function ConsultationPage() {
  return (
    <section className="relative flex min-h-[72vh] items-center justify-center overflow-hidden px-4 py-28 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(231_121_23_/_0.16),transparent_34%),radial-gradient(circle_at_80%_70%,rgb(85_38_79_/_0.14),transparent_34%)]" />
      <div className="surface-card relative w-full max-w-3xl rounded-3xl p-7 text-center sm:p-12">
        <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-accent-soft text-4xl text-brand-secondary dark:text-brand-accent">
          <HiSparkles aria-hidden="true" />
        </span>
        <p className="mt-7 text-sm font-bold text-brand-secondary dark:text-brand-accent">همراه شما در انتخاب مسیر یادگیری</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">مشاوره آنلاین</h1>
        <p className="mx-auto mt-5 max-w-xl leading-8 text-muted-foreground">
          برای انتخاب دوره، تعیین مسیر یادگیری یا دریافت راهنمایی بیشتر از راه‌های زیر با ما در ارتباط باشید.
        </p>

        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          <a href="tel:09104873278" className="group rounded-2xl border border-border bg-secondary-soft p-6 text-start hover:-translate-y-1 hover:border-brand-accent">
            <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-2xl text-brand-accent"><HiPhone aria-hidden="true" /></span>
            <span className="mt-5 block text-sm text-muted-foreground">تماس تلفنی</span>
            <strong dir="ltr" className="mt-2 block text-xl text-foreground">0910 487 3278</strong>
          </a>
          <a href="https://t.me/navid_th" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-border bg-secondary-soft p-6 text-start hover:-translate-y-1 hover:border-brand-accent">
            <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-2xl text-brand-accent"><FaTelegramPlane aria-hidden="true" /></span>
            <span className="mt-5 block text-sm text-muted-foreground">تلگرام</span>
            <strong dir="ltr" className="mt-2 block text-xl text-foreground">@navid_th</strong>
          </a>
        </div>

        <Link href="/" className="brand-link mt-9 inline-flex items-center gap-2">
          بازگشت به صفحه اصلی
          <HiArrowLeft aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
