import {
  HiOutlineBookOpen,
  HiOutlineMicrophone,
  HiOutlinePencilAlt,
  HiOutlineVolumeUp,
} from "react-icons/hi";

const skills = [
  {
    icon: HiOutlineVolumeUp,
    english: "Listening",
    persian: "شنیدن",
    text: "درک بهتر گفت‌وگوها، لحن‌ها و کاربرد واژه‌ها در موقعیت واقعی.",
    accent: "bg-brand-accent text-brand-primary",
  },
  {
    icon: HiOutlineMicrophone,
    english: "Speaking",
    persian: "صحبت‌کردن",
    text: "ساختن جمله‌های روان‌تر و بیان مطمئن‌تر منظور در مکالمه.",
    accent: "bg-white text-brand-secondary",
  },
  {
    icon: HiOutlineBookOpen,
    english: "Reading",
    persian: "خواندن",
    text: "فهم متن، گسترش واژگان و تشخیص سریع‌تر ایده‌های اصلی.",
    accent: "bg-white text-brand-secondary",
  },
  {
    icon: HiOutlinePencilAlt,
    english: "Writing",
    persian: "نوشتن",
    text: "نوشتن روشن‌تر با ساختار، واژگان و دستور زبان مناسب هر سطح.",
    accent: "bg-brand-accent text-brand-primary",
  },
] as const;

export default function TrustSection() {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="relative overflow-hidden bg-brand-primary px-4 py-24 text-white sm:px-6 lg:py-32">
      <div className="pointer-events-none absolute -start-44 top-0 size-[30rem] rounded-full bg-brand-secondary/45 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-56 -end-24 size-[32rem] rounded-full bg-brand-accent/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.75fr]">
          <div>
            <span className="inline-flex rounded-full border border-brand-accent/35 bg-brand-accent/10 px-4 py-2 text-sm font-bold text-brand-accent">
              چهار مهارت، یک مسیر
            </span>
            <h2 id="skills-heading" className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
              زبان را یکپارچه یاد بگیرید، نه تکه‌تکه
            </h2>
          </div>
          <p className="text-base leading-8 text-white/65 lg:pb-1">
            پیشرفت واقعی زمانی شکل می‌گیرد که مهارت‌های اصلی در کنار واژگان و دستور زبان، هماهنگ با یکدیگر تمرین شوند.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map(({ icon: Icon, english, persian, text, accent }, index) => (
            <article key={english} className="group rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-brand-accent/45 hover:bg-white/[0.085]">
              <div className="flex items-start justify-between gap-4">
                <span className={`grid size-12 place-items-center rounded-2xl ${accent}`}>
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span lang="en" dir="ltr" className="text-xs font-bold tracking-[0.18em] text-white/30">0{index + 1}</span>
              </div>
              <p lang="en" dir="ltr" className="mt-8 text-start text-sm font-bold tracking-wide text-brand-accent">{english}</p>
              <h3 className="mt-1 text-2xl font-black">{persian}</h3>
              <p className="mt-4 text-sm leading-7 text-white/60">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/10 pt-8 text-sm font-semibold text-white/50">
          <span>واژگان کاربردی</span>
          <span className="size-1.5 rounded-full bg-brand-accent" aria-hidden="true" />
          <span>دستور زبان در بافت</span>
          <span className="size-1.5 rounded-full bg-brand-accent" aria-hidden="true" />
          <span>تمرین متناسب با سطح</span>
        </div>
      </div>
    </section>
  );
}
