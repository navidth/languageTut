import { HiPlus } from "react-icons/hi";

export const faqItems = [
  {
    question: "برای شروع یادگیری زبان از کجا باید شروع کنم؟",
    answer:
      "بهترین نقطه شروع، آزمون تعیین سطح است. پس از شناخت سطح فعلی، می‌توانید دوره‌ها و تمرین‌هایی را انتخاب کنید که با هدف و توانایی شما هماهنگ‌اند.",
  },
  {
    question: "آزمون تعیین سطح ExamificatioN چه کمکی می‌کند؟",
    answer:
      "این آزمون تصویری روشن‌تر از مهارت‌های فعلی شما می‌سازد تا مسیر آموزشی نه بیش از حد ساده باشد و نه زودتر از آمادگی شما دشوار شود.",
  },
  {
    question: "آیا مسیر یادگیری برای هر زبان‌آموز متفاوت است؟",
    answer:
      "بله. سطح فعلی، هدف، روند تمرین و نقاط نیازمند تقویت در پیشنهاد مسیر اثر می‌گذارند تا تجربه یادگیری با شرایط هر زبان‌آموز هماهنگ‌تر باشد.",
  },
  {
    question: "کدام مهارت‌های زبان انگلیسی پوشش داده می‌شوند؟",
    answer:
      "مسیر آموزشی بر چهار مهارت اصلی خواندن، شنیدن، نوشتن و صحبت‌کردن تمرکز دارد و به واژگان و دستور زبان موردنیاز هر سطح نیز توجه می‌کند.",
  },
  {
    question: "مدرس‌ها چه امکاناتی در اختیار دارند؟",
    answer:
      "مدرس می‌تواند کلاس‌ها و زبان‌آموزان را از یک فضای یکپارچه مدیریت کند، روند یادگیری را ببیند و بر اساس عملکرد هر فرد بازخورد دقیق‌تری ارائه دهد.",
  },
] as const;

export default function FAQSection() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="bg-background px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <span className="section-eyebrow">پاسخ کوتاه و روشن</span>
          <h2 id="faq-heading" className="mt-5 text-3xl font-black leading-tight text-foreground sm:text-4xl">
            سؤال‌هایی که شاید قبل از شروع داشته باشید
          </h2>
          <p className="mt-5 max-w-md text-base leading-8 text-muted-foreground">
            اگر پاسخ سؤال شما اینجا نیست، بعد از ورود می‌توانید از مسیر راهنمایی داخل پلتفرم استفاده کنید.
          </p>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {faqItems.map(({ question, answer }, index) => (
            <details key={question} className="group py-1" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-start text-lg font-bold text-foreground marker:content-none">
                <span>{question}</span>
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-brand-secondary group-open:bg-brand-accent group-open:text-brand-primary">
                  <HiPlus className="size-5 transition-transform group-open:rotate-45" aria-hidden="true" />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 pe-0 text-sm leading-8 text-muted-foreground sm:pe-14 sm:text-base">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
