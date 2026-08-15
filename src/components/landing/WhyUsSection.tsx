import {
  HiCheck,
  HiLightningBolt,
  HiOutlineAdjustments,
  HiOutlineChartBar,
  HiOutlineLightBulb,
  HiSparkles,
} from "react-icons/hi";

const recommendations = [
  { title: "مرور واژگان جلسه قبل", meta: "۱۰ دقیقه", done: true },
  { title: "تمرین شنیداری سطح شما", meta: "۱۵ دقیقه", done: false },
  { title: "مکالمه موقعیت‌محور", meta: "۲۰ دقیقه", done: false },
];

export default function WhyUsSection() {
  return (
    <section id="features" aria-labelledby="features-heading" className="bg-secondary-soft px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_0.72fr]">
          <div>
            <span className="section-eyebrow">یادگیری با منطق، نه با حدس</span>
            <h2 id="features-heading" className="mt-5 max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-5xl">
              هر بار که برمی‌گردید، قدم بعدی روشن است
            </h2>
          </div>
          <p className="text-base leading-8 text-muted-foreground lg:pb-1">
            تمرین‌ها، پیشنهادها و گزارش‌ها کنار هم قرار می‌گیرند تا بدانید اکنون کجا هستید و برای ادامه چه کاری بیشترین ارزش را دارد.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          <article className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:col-span-7 lg:row-span-2">
            <div className="pointer-events-none absolute -end-16 -top-16 size-52 rounded-full bg-accent-soft blur-3xl" aria-hidden="true" />
            <div className="relative flex items-start justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-secondary dark:text-brand-accent">
                  <HiOutlineAdjustments className="size-5" aria-hidden="true" />
                  پیشنهاد متناسب با شما
                </span>
                <h3 className="mt-3 text-2xl font-black text-foreground">برنامه امروز، بدون سردرگمی</h3>
              </div>
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-primary text-brand-accent dark:bg-brand-accent dark:text-brand-primary">
                <HiSparkles className="size-6" aria-hidden="true" />
              </span>
            </div>

            <div className="relative mt-8 rounded-3xl border border-border bg-background/80 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-muted-foreground">مسیر پیشنهادی امروز</p>
                  <p className="mt-1 font-black text-foreground">تقویت درک شنیداری</p>
                </div>
                <div className="grid size-14 place-items-center rounded-full border-4 border-accent-soft bg-card text-sm font-black text-brand-secondary dark:text-brand-accent">
                  ۳/۱
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {recommendations.map(({ title, meta, done }, index) => (
                  <div key={title} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                    <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-black ${done ? "bg-success-soft text-success" : "bg-primary-soft text-brand-secondary dark:text-brand-accent"}`}>
                      {done ? <HiCheck className="size-5" aria-hidden="true" /> : index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[2rem] bg-brand-primary p-7 text-white lg:col-span-5">
            <HiLightningBolt className="absolute -bottom-5 -end-4 size-32 rotate-12 text-white/[0.05]" aria-hidden="true" />
            <span className="grid size-11 place-items-center rounded-2xl bg-brand-accent text-brand-primary">
              <HiOutlineLightBulb className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-7 text-xl font-black">هوش مصنوعی در نقش راهنما</h3>
            <p className="relative mt-3 max-w-md text-sm leading-7 text-white/70">
              پیشنهاد هوشمند زمانی مفید است که تصمیم را ساده‌تر کند؛ نه اینکه جای هدف، تمرین و بازخورد انسانی را بگیرد.
            </p>
          </article>

          <article className="surface-card rounded-[2rem] p-7 lg:col-span-5">
            <div className="flex items-center gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-brand-secondary">
                <HiOutlineChartBar className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl font-black text-foreground">پیشرفت قابل مشاهده</h3>
                <p className="mt-1 text-sm text-muted-foreground">تصویر روشن از ادامه مسیر</p>
              </div>
            </div>
            <div className="mt-7 flex h-20 items-end gap-2" aria-hidden="true">
              {[35, 46, 42, 58, 66, 74, 86].map((height, index) => (
                <span key={height} className={`flex-1 rounded-t-lg ${index === 6 ? "bg-brand-accent" : "bg-primary-soft"}`} style={{ height: `${height}%` }} />
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
