import { HiPlus } from "react-icons/hi";
import Reveal from "@/components/ui/Reveal";
import { faqItems } from "@/constants/landing";

export default function FAQSection() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="bg-background px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <span className="section-eyebrow">پاسخ کوتاه و روشن</span>
          <h2 id="faq-heading" className="mt-5 text-3xl font-black leading-tight text-foreground sm:text-4xl">
            سؤال‌هایی که شاید قبل از شروع داشته باشید
          </h2>
          <p className="mt-5 max-w-md text-base leading-8 text-muted-foreground">
            اگر پاسخ سؤال شما اینجا نیست، بعد از ورود می‌توانید از مسیر راهنمایی داخل پلتفرم استفاده کنید.
          </p>
        </Reveal>

        <Reveal delay={120} className="divide-y divide-border border-y border-border">
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
        </Reveal>
      </div>
    </section>
  );
}
