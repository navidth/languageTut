import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";
import { extraPaths } from "@/constants/landing";

export default function ExtraPathsSection() {
  return (
    <section aria-labelledby="extra-paths-heading" className="bg-background px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">فراتر از کلاس</span>
          <h2 id="extra-paths-heading" className="mt-5 text-3xl font-black leading-tight text-foreground sm:text-4xl">
            مسیرهای تکمیلی یادگیری
          </h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            برای هدف‌های مشخص‌تر، کنار مسیر اصلی همراه شما هستیم.
          </p>
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {extraPaths.map(({ icon: Icon, title, text, href, available }) => (
            <li key={href}>
              <Link
                href={href}
                className="surface-card group flex h-full flex-col rounded-[1.75rem] p-6 hover:-translate-y-1 sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-brand-secondary dark:text-brand-accent transition-transform group-hover:scale-105">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${available ? "bg-success-soft text-success" : "bg-primary-soft text-brand-secondary dark:text-brand-accent"}`}
                  >
                    {available ? "در دسترس" : "به‌زودی"}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-black text-foreground">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-7 text-muted-foreground">{text}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-secondary dark:text-brand-accent">
                  {available ? "ارتباط با مشاور" : "اطلاعات بیشتر"}
                  <HiArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
