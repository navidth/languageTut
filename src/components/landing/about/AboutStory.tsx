import { HiOutlineEye, HiOutlineFlag } from "react-icons/hi";

const pillars = [
  {
    icon: HiOutlineFlag,
    title: "مأموریت ما",
    text: "کمک به هر زبان‌آموز برای یافتن مسیری متناسب با سطح و هدفش، و دادن ابزارهای دقیق‌تر به مدرس‌ها برای همراهی او.",
  },
  {
    icon: HiOutlineEye,
    title: "چشم‌انداز ما",
    text: "تجربه‌ای از یادگیری زبان که در آن هر جلسه تمرین به پیشرفتی قابل‌مشاهده تبدیل شود.",
  },
] as const;

export default function AboutStory() {
  return (
    <section aria-labelledby="about-story-heading" className="bg-background px-4 pb-24 sm:px-6 lg:pb-32">
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <span className="section-eyebrow">چرا ExamificatioN</span>
          <h2 id="about-story-heading" className="mt-5 text-3xl font-black leading-tight text-foreground sm:text-4xl">
            از محتوای پراکنده تا یک مسیر روشن
          </h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-muted-foreground">
            <p>
              بسیاری از زبان‌آموزان با انبوهی از کتاب، اپلیکیشن و ویدیو شروع می‌کنند، اما نمی‌دانند از کجا باید ادامه دهند. مدرس‌ها هم برای دیدن روند هر زبان‌آموز، باید اطلاعات را از جاهای مختلف کنار هم بگذارند.
            </p>
            <p>
              ExamificatioN برای حل همین مسئله ساخته شده است: فضایی یکپارچه که در آن سطح هر زبان‌آموز سنجیده می‌شود، مسیر یادگیری روشن است و درس‌ها، تمرین‌ها، تکالیف و نتیجه‌ها کنار هم دیده می‌شوند.
            </p>
          </div>
        </div>

        <ul className="space-y-4">
          {pillars.map(({ icon: Icon, title, text }, index) => (
            <li
              key={title}
              className={`relative overflow-hidden rounded-[1.75rem] p-7 sm:p-8 ${index === 0 ? "bg-gradient-to-br from-brand-secondary to-brand-primary text-white shadow-[var(--shadow-brand-md)]" : "surface-card"}`}
            >
              {index === 0 && (
                <div className="pointer-events-none absolute -bottom-16 -end-10 size-44 rounded-full bg-brand-accent/20 blur-3xl" aria-hidden="true" />
              )}
              <div className="relative flex gap-5">
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl ${index === 0 ? "bg-brand-accent text-brand-primary" : "bg-accent-soft text-brand-secondary dark:text-brand-accent"}`}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className={`text-xl font-black ${index === 0 ? "" : "text-foreground"}`}>{title}</h3>
                  <p className={`mt-2 leading-8 ${index === 0 ? "text-white/75" : "text-muted-foreground"}`}>{text}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
