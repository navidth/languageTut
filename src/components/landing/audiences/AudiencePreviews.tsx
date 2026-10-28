import type { IconType } from "react-icons";
import { HiOutlineBookOpen, HiOutlinePencilAlt, HiOutlineVolumeUp } from "react-icons/hi";

// Illustrative product previews for the audiences section on the home page.
// They are drawn in HTML so they cost no image requests, follow the theme
// tokens, and stay sharp at every size. The caller hides them from assistive
// technology: the names and numbers are examples, not real records.
// Each fills its frame's height and clips, so its open bottom edge always
// meets the card's edge.

/** CEFR codes need a Latin font: IRANSans FaNum draws every digit in Persian. */
function Code({ children }: { children: string }) {
  return (
    <span lang="en" dir="ltr" className="latin-code">
      {children}
    </span>
  );
}

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const CURRENT = 2;
const TARGET = 4;

function segmentClass(index: number) {
  if (index < CURRENT) return "bg-brand-secondary/75 dark:bg-white/35";
  if (index === CURRENT) return "bg-brand-accent";
  if (index === TARGET) return "border border-dashed border-brand-accent";
  if (index < TARGET) return "bg-brand-accent/25";
  return "bg-border";
}

const practice: { icon: IconType; skill: string; title: string; progress: number }[] = [
  { icon: HiOutlineVolumeUp, skill: "Listening", title: "گفت‌وگوهای روزمره", progress: 72 },
  { icon: HiOutlinePencilAlt, skill: "Writing", title: "نوشتن ایمیل رسمی", progress: 40 },
  { icon: HiOutlineBookOpen, skill: "Reading", title: "درک مطلب کوتاه", progress: 18 },
];

// The Iranian week starts on Saturday; Thursday is "today", Friday is still ahead.
const week = [
  { day: "ش", value: 40 },
  { day: "ی", value: 65 },
  { day: "د", value: 30 },
  { day: "س", value: 80 },
  { day: "چ", value: 55 },
  { day: "پ", value: 90, today: true },
  { day: "ج", value: 8, ahead: true },
];

/** A learner's dashboard card: the level path, today's practice and the week. */
export function LearnerPreview() {
  return (
    <div className="h-full overflow-hidden rounded-t-2xl border border-b-0 border-border bg-card p-5 text-foreground shadow-[0_20px_44px_-16px_rgb(85_38_79/0.35)] sm:p-6 dark:shadow-[0_20px_44px_-16px_rgb(0_0_0/0.7)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">مسیر یادگیری شما</p>
          <p className="mt-1 text-sm font-black">
            از <Code>B1</Code> تا <Code>C1</Code>
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold text-warning">
          هفته ۶ از ۱۲
        </span>
      </div>

      <ol className="mt-4 grid grid-cols-6 gap-1.5">
        {levels.map((level, index) => (
          <li key={level}>
            <span className={`block h-2 rounded-full ${segmentClass(index)}`} />
            <span
              className={`mt-1.5 block text-center text-[11px] ${
                index === CURRENT ? "font-black text-foreground" : "text-muted-foreground"
              }`}
            >
              <Code>{level}</Code>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs font-bold text-muted-foreground">تمرین‌های امروز</p>
        <ul className="mt-3 space-y-3.5">
          {practice.map(({ icon: Icon, skill, title, progress }) => (
            <li key={skill} className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary-soft text-brand-secondary dark:text-brand-accent">
                <Icon className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-bold">{title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    <Code>{skill}</Code>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary-soft">
                  <span
                    className="reveal-grow block h-full rounded-full bg-brand-accent"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-bold text-muted-foreground">فعالیت این هفته</p>
          <p className="text-xs font-black">۵ روز پیاپی</p>
        </div>
        <ol className="mt-3 grid grid-cols-7 gap-2">
          {week.map(({ day, value, today, ahead }) => (
            <li key={day}>
              <div className="flex h-14 items-end">
                <span
                  className={`reveal-rise block w-full rounded-md ${
                    today ? "bg-brand-accent" : ahead ? "bg-border" : "bg-brand-secondary/60 dark:bg-white/30"
                  }`}
                  style={{ height: `${value}%` }}
                />
              </div>
              <span
                className={`mt-1.5 block text-center text-[11px] ${
                  today ? "font-black text-foreground" : "text-muted-foreground"
                }`}
              >
                {day}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const breakdown = [
  { label: "تحویل‌شده", share: 64, bar: "bg-success", dot: "bg-success" },
  { label: "منتظر بازخورد", share: 22, bar: "bg-brand-accent", dot: "bg-brand-accent" },
  { label: "دیر تحویل", share: 14, bar: "bg-destructive", dot: "bg-destructive" },
] as const;

const submissions = [
  { initial: "س", name: "سارا محمدی", time: "۲ ساعت پیش", status: "تحویل‌شده", tone: "bg-success-soft text-success", score: "۱۸٫۵" },
  { initial: "ا", name: "امیر حسینی", time: "امروز", status: "منتظر بازخورد", tone: "bg-accent-soft text-warning", score: "—" },
  { initial: "ن", name: "نگار کریمی", time: "دیروز", status: "دیر تحویل", tone: "bg-destructive-soft text-destructive", score: "۱۴" },
  { initial: "م", name: "محمد رضایی", time: "دیروز", status: "تحویل‌شده", tone: "bg-success-soft text-success", score: "۱۷" },
] as const;

/**
 * A teacher's class card: how this week's homework stands, then the latest
 * submissions. It sits on the dark plum panel in both themes, so it takes the
 * dark tokens through its own `dark` class.
 */
export function TeacherPreview() {
  return (
    <div className="dark h-full overflow-hidden rounded-t-2xl border border-b-0 border-border bg-card p-5 text-foreground shadow-[0_20px_44px_-16px_rgb(0_0_0/0.75)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            کلاس <Code>B1</Code> · ۱۴ زبان‌آموز
          </p>
          <p className="mt-1 text-sm font-black">تکلیف این هفته: نامه به یک دوست</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold text-warning">
          ۳ روز تا پایان مهلت
        </span>
      </div>

      <div className="reveal-grow mt-4 flex h-2 gap-0.5 overflow-hidden rounded-full">
        {breakdown.map(({ label, share, bar }) => (
          <span key={label} className={`h-full ${bar}`} style={{ width: `${share}%` }} />
        ))}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {breakdown.map(({ label, share, dot }) => (
          <li key={label} className="inline-flex items-center gap-1.5">
            <span className={`size-1.5 rounded-full ${dot}`} />
            {label} {share.toLocaleString("fa-IR")}٪
          </li>
        ))}
      </ul>

      <ul className="mt-4 divide-y divide-border border-t border-border">
        {submissions.map(({ initial, name, time, status, tone, score }) => (
          <li key={name} className="flex items-center gap-3 py-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-black">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{name}</p>
              <p className="text-[11px] text-muted-foreground">{time}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${tone}`}>{status}</span>
            <span className="w-8 shrink-0 text-end text-sm font-black">{score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
