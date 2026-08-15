import Link from "next/link";
import { HiAcademicCap, HiArrowLeft, HiCheck, HiUserGroup } from "react-icons/hi";
import AuthModalButton from "@/components/auth/AuthModalButton";

const learnerBenefits = [
  "مسیر متناسب با سطح و هدف شما",
  "تمرین هدفمند به‌جای محتوای پراکنده",
  "مشاهده روند پیشرفت در طول مسیر",
];

const teacherBenefits = [
  "مدیریت کلاس‌ها و زبان‌آموزان",
  "دسترسی سریع‌تر به روند عملکرد",
  "بازخورد دقیق‌تر با ابزارهای هوشمند",
];

export default function UserTypeSection() {
  return (
    <section id="audiences" aria-labelledby="audiences-heading" className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 lg:py-32">
      <div className="landing-dot-grid pointer-events-none absolute inset-x-0 top-0 h-72 opacity-55" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-eyebrow">برای هر دو سوی یادگیری</span>
          <h2 id="audiences-heading" className="mt-5 text-3xl font-black leading-tight text-foreground sm:text-5xl">
            یک فضای یکپارچه برای یادگرفتن و یاددادن
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            زبان‌آموز مسیر روشن‌تری برای پیشرفت می‌بیند و مدرس، ابزارهای لازم برای همراهی دقیق‌تر را در اختیار دارد.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <article className="surface-card group relative overflow-hidden rounded-[2rem] p-7 sm:p-10">
            <span className="absolute -end-8 -top-10 select-none text-[10rem] font-black leading-none text-secondary-soft" aria-hidden="true">
              01
            </span>
            <div className="relative">
              <span className="grid size-14 place-items-center rounded-2xl bg-accent-soft text-brand-secondary">
                <HiAcademicCap className="size-7" aria-hidden="true" />
              </span>
              <p className="mt-8 text-sm font-bold text-brand-secondary dark:text-brand-accent">برای زبان‌آموز</p>
              <h3 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">پیشرفت، قدم‌به‌قدم و قابل‌فهم</h3>
              <p className="mt-4 max-w-lg leading-8 text-muted-foreground">
                به‌جای انتخاب‌های پراکنده، از سطح فعلی خود شروع کنید و روی تمرین‌هایی وقت بگذارید که به هدف شما نزدیک‌ترند.
              </p>
              <ul className="mt-7 space-y-3" aria-label="امکانات زبان‌آموزان">
                {learnerBenefits.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-semibold text-foreground/85">
                    <HiCheck className="size-5 shrink-0 text-brand-accent" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <AuthModalButton className="mt-8 px-6">
                <span className="flex items-center gap-2">
                  ساخت مسیر یادگیری
                  <HiArrowLeft className="size-4" aria-hidden="true" />
                </span>
              </AuthModalButton>
            </div>
          </article>

          <article className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary p-7 text-white shadow-[var(--shadow-brand-md)] sm:p-10">
            <span className="absolute -end-8 -top-10 select-none text-[10rem] font-black leading-none text-white/[0.05]" aria-hidden="true">
              02
            </span>
            <div className="absolute -bottom-24 -start-20 size-64 rounded-full bg-brand-accent/15 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <span className="grid size-14 place-items-center rounded-2xl bg-brand-accent text-brand-primary">
                <HiUserGroup className="size-7" aria-hidden="true" />
              </span>
              <p className="mt-8 text-sm font-bold text-brand-accent">برای مدرس</p>
              <h3 className="mt-2 text-2xl font-black sm:text-3xl">مدیریت کمتر، تمرکز بیشتر بر آموزش</h3>
              <p className="mt-4 max-w-lg leading-8 text-white/70">
                کلاس‌ها، زبان‌آموزان و روند یادگیری را در یک قاب ببینید و زمان بیشتری برای بازخورد و آموزش باکیفیت داشته باشید.
              </p>
              <ul className="mt-7 space-y-3" aria-label="امکانات مدرسان">
                {teacherBenefits.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-semibold text-white/85">
                    <HiCheck className="size-5 shrink-0 text-brand-accent" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/teacher" className="brand-button-inverse mt-8 inline-flex min-h-10 items-center gap-2 rounded-full px-6 py-2.5">
                ورود به فضای مدرس
                <HiArrowLeft className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
