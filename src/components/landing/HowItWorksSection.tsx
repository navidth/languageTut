import Link from "next/link";
import { HiArrowLeft, HiOutlineClipboardCheck, HiOutlineLightBulb, HiOutlinePresentationChartLine } from "react-icons/hi";
import { PLACEMENT_SECTION_ID } from "@/lib/routes";

const steps = [
  {
    icon: HiOutlineClipboardCheck,
    title: "سطح فعلی‌تان را بشناسید",
    text: "با تعیین سطح شروع کنید تا نقطه آغاز مسیر بر اساس توانایی واقعی شما مشخص شود.",
  },
  {
    icon: HiOutlineLightBulb,
    title: "مسیر مناسب را دریافت کنید",
    text: "هدف و سطح شما به یک برنامه روشن از دوره‌ها، تمرین‌ها و اولویت‌های یادگیری تبدیل می‌شود.",
  },
  {
    icon: HiOutlinePresentationChartLine,
    title: "تمرین کنید و مسیر را بسنجید",
    text: "با ادامه تمرین، روند پیشرفت را ببینید و قدم‌های بعدی را دقیق‌تر انتخاب کنید.",
  },
] as const;

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="bg-background px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <span className="section-eyebrow">سه قدم تا شروع</span>
            <h2 id="how-heading" className="mt-5 text-3xl font-black leading-tight text-foreground sm:text-4xl">
              مسیر خوب از یک نقطه روشن آغاز می‌شود
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              لازم نیست از میان ده‌ها انتخاب حدس بزنید. از شناخت سطح شروع کنید و قدم‌به‌قدم جلو بروید.
            </p>
            <Link href={`/#${PLACEMENT_SECTION_ID}`} className="ghost-button mt-7 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm">
              رفتن به تعیین سطح
              <HiArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <ol className="relative space-y-4 before:absolute before:bottom-10 before:start-7 before:top-10 before:w-px before:bg-border sm:before:start-9">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="surface-card relative flex gap-5 rounded-[1.75rem] p-5 sm:gap-7 sm:p-7">
                <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-primary text-brand-accent sm:size-[4.5rem]">
                  <Icon className="size-7" aria-hidden="true" />
                </span>
                <div className="pt-1 sm:pt-2">
                  <span lang="en" dir="ltr" className="text-xs font-bold tracking-[0.22em] text-brand-accent">STEP 0{index + 1}</span>
                  <h3 className="mt-2 text-xl font-black text-foreground">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
