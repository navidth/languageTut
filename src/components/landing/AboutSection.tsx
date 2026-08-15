import { HiAcademicCap, HiSparkles, HiUserGroup } from "react-icons/hi";
import BrandMark from "@/components/ui/BrandMark";

const principles = [
  {
    icon: HiAcademicCap,
    title: "یادگیری هدفمند",
    text: "هر تمرین باید به یک نیاز روشن در مسیر زبان‌آموز پاسخ دهد.",
  },
  {
    icon: HiUserGroup,
    title: "همراهی انسانی",
    text: "فناوری ابزار مدرس و زبان‌آموز است، نه جایگزین ارتباط میان آن‌ها.",
  },
  {
    icon: HiSparkles,
    title: "هوشمندی کاربردی",
    text: "هوش مصنوعی باید انتخاب قدم بعدی را دقیق‌تر و ساده‌تر کند.",
  },
] as const;

export default function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-heading" className="bg-secondary-soft px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-[var(--shadow-brand-md)]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative flex min-h-[24rem] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-secondary to-brand-primary p-8 text-white sm:p-12">
              <div className="pointer-events-none absolute -end-16 -top-20 size-72 rounded-full border-[3rem] border-white/[0.04]" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-32 -start-24 size-80 rounded-full bg-brand-accent/15 blur-3xl" aria-hidden="true" />
              <BrandMark variant="wordmark" inverse className="relative" />
              <blockquote className="relative mt-20">
                <span className="text-7xl font-black leading-none text-brand-accent" aria-hidden="true">“</span>
                <p className="-mt-5 max-w-md text-2xl font-black leading-relaxed sm:text-3xl">
                  مسیر یادگیری باید به‌اندازه هدف هر آدم، شخصی و روشن باشد.
                </p>
              </blockquote>
            </div>

            <div className="p-8 sm:p-12 lg:p-14">
              <span className="section-eyebrow">درباره ExamificatioN</span>
              <h2 id="about-heading" className="mt-5 text-3xl font-black leading-tight text-foreground sm:text-4xl">
                فناوری در خدمت یک تجربه آموزشی بهتر
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">
                ExamificatioN یک پلتفرم آموزش زبان است که زبان‌آموز و مدرس را در یک مسیر مشترک قرار می‌دهد. تعیین سطح، پیشنهادهای هوشمند، تمرین مهارت‌ها و مشاهده روند پیشرفت، اجزای این تجربه یکپارچه‌اند.
              </p>

              <div className="mt-9 space-y-5">
                {principles.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-brand-secondary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-black text-foreground">{title}</h3>
                      <p className="mt-1 text-sm leading-7 text-muted-foreground">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
