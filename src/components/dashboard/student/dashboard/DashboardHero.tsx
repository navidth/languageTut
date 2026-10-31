import Link from "next/link";
import { HiArrowLeft, HiCalendar, HiChartBar } from "react-icons/hi";
import ProgressRing from "@/components/ui/ProgressRing";
import { ROUTES } from "@/constants/routes";
import { dashboardHeadline, firstName } from "@/lib/presentation/dashboard";
import { describeDueDate } from "@/lib/presentation/homework";
import { formatPersianDate } from "@/lib/utils/date";
import { studentCoursePath } from "@/lib/utils/routes";
import type { User } from "@/types/auth";
import type { Homework } from "@/types/homework";
import type { LearningSummary } from "@/types/student";

const chipClassName =
  "inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold ring-1 ring-inset ring-white/15";

/**
 * Greeting, the next step in one sentence, the two most useful actions and
 * the overall progress. The panel is plum in both themes.
 */
export default function DashboardHero({
  user,
  learning,
  loading,
  pendingHomework,
  homeworkFetchedAt,
}: {
  user: User | null;
  learning: LearningSummary;
  loading: boolean;
  /** Nearest deadline first. */
  pendingHomework: Homework[];
  homeworkFetchedAt: number | null;
}) {
  const name = firstName(user?.full_name) ?? "دانش‌آموز";
  const level = user?.current_level ?? null;
  const { continueCourse, overallPercent, completedLessons, totalLessons } = learning;
  const headline = loading
    ? "وضعیت یادگیری و دسترسی سریع به محتوای آموزشی"
    : dashboardHeadline({
        pendingHomework: pendingHomework.length,
        nearestDue: describeDueDate(pendingHomework[0]?.due_at, homeworkFetchedAt),
        continueCourse,
        hasLevel: Boolean(level),
      });
  const primary = continueCourse
    ? { href: studentCoursePath(continueCourse.course), label: "ادامه یادگیری" }
    : { href: ROUTES.studentCourses, label: "انتخاب دوره" };
  const secondary = level
    ? { href: ROUTES.studentTests, label: "تمرین تستی" }
    : { href: ROUTES.placementTest, label: "آزمون تعیین سطح" };

  return (
    <section aria-labelledby="dashboard-title" className="page-hero relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
      <div className="pointer-events-none absolute -end-24 -top-28 size-80 rounded-full bg-white/5" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 start-1/4 size-72 rounded-full bg-brand-accent/20 blur-3xl" aria-hidden="true" />

      <div className="relative grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="page-hero-muted text-sm font-bold">داشبورد آموزشی من</p>
          <h1 id="dashboard-title" className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
            سلام {name}! <span aria-hidden="true">👋</span>
          </h1>
          <p className="page-hero-muted mt-3 max-w-xl text-sm leading-7 sm:text-base sm:leading-8">{headline}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className={chipClassName}>
              <HiChartBar className="size-4 text-brand-accent" aria-hidden="true" />
              {level ? `سطح ${level}` : "سطح هنوز مشخص نشده"}
            </span>
            {user?.date_joined && (
              <span className={chipClassName}>
                <HiCalendar className="size-4 text-brand-accent" aria-hidden="true" />
                عضو از {formatPersianDate(user.date_joined, { year: "numeric", month: "long" })}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primary.href}
              className="brand-button inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm"
            >
              {primary.label}
              <HiArrowLeft className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href={secondary.href}
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white ring-1 ring-inset ring-white/20 transition hover:bg-white/15"
            >
              {secondary.label}
            </Link>
          </div>
        </div>

        {/* `dark`: the panel is plum in both themes, so the ring takes its
            dark-theme colours. */}
        <div className="dark flex items-center gap-5 rounded-3xl bg-white/[0.07] p-5 ring-1 ring-inset ring-white/10 backdrop-blur-sm lg:flex-col lg:px-8 lg:py-6">
          <ProgressRing
            value={loading ? null : overallPercent}
            label={
              overallPercent === null
                ? "پیشرفت کل: هنوز درسی شروع نشده"
                : `پیشرفت کل: ${overallPercent.toLocaleString("fa-IR")}٪`
            }
            caption="پیشرفت کل"
            className="size-28 shrink-0 sm:size-32"
          >
            {loading || overallPercent === null ? "—" : `${overallPercent.toLocaleString("fa-IR")}٪`}
          </ProgressRing>
          <dl className="space-y-3 text-sm lg:text-center">
            <div>
              <dt className="text-xs text-muted-foreground">درس‌های تکمیل‌شده</dt>
              <dd className="mt-0.5 font-black text-foreground">
                {loading
                  ? "—"
                  : totalLessons > 0
                    ? `${completedLessons.toLocaleString("fa-IR")} از ${totalLessons.toLocaleString("fa-IR")}`
                    : completedLessons.toLocaleString("fa-IR")}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">دوره‌های در جریان</dt>
              <dd className="mt-0.5 font-black text-foreground">
                {loading ? "—" : learning.courses.length.toLocaleString("fa-IR")}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
