import Link from "next/link";
import type { IconType } from "react-icons";
import { HiArrowLeft, HiCheckCircle } from "react-icons/hi";
import { MdAssignment, MdCastForEducation, MdQuiz } from "react-icons/md";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES } from "@/constants/routes";
import { describeDueDate } from "@/lib/presentation/homework";
import type { ExamSummary, HomeworkSummary, LearningSummary } from "@/types/student";

type StatTone = "secondary" | "success" | "accent" | "primary";

const iconTones: Record<StatTone, string> = {
  secondary: "bg-secondary-soft text-brand-secondary dark:text-white",
  success: "bg-success-soft text-success",
  accent: "bg-accent-soft text-brand-accent",
  primary: "bg-primary-soft text-brand-primary dark:text-brand-accent",
};

const fa = (value: number) => value.toLocaleString("fa-IR");

/** Four headline numbers; each card opens the page behind it. */
export default function DashboardStats({
  enrollmentCount,
  learning,
  exams,
  homework,
  homeworkFetchedAt,
  loading,
}: {
  enrollmentCount: number;
  learning: LearningSummary;
  exams: ExamSummary;
  homework: HomeworkSummary;
  homeworkFetchedAt: number | null;
  /** Each section loads on its own. */
  loading: { overview: boolean; exams: boolean; homework: boolean };
}) {
  const nearestDue = describeDueDate(homework.pending[0]?.due_at, homeworkFetchedAt);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-busy={loading.overview}>
      <StatCard
        href="/student/courses"
        icon={MdCastForEducation}
        tone="secondary"
        label="کورس‌های ثبت‌نام‌شده"
        value={loading.overview ? null : fa(enrollmentCount)}
        caption="مشاهده کورس‌های من"
      />
      <StatCard
        href="/student/lessons"
        icon={HiCheckCircle}
        tone="success"
        label="درس‌های تکمیل‌شده"
        value={loading.overview ? null : fa(learning.completedLessons)}
        caption={
          learning.totalLessons > 0
            ? `از ${fa(learning.totalLessons)} درس دوره‌هایت`
            : "با شروع درس‌ها شمرده می‌شود"
        }
      />
      <StatCard
        href={ROUTES.studentHomework}
        icon={MdAssignment}
        tone="accent"
        label="تکالیف در انتظار"
        value={loading.homework ? null : `${fa(homework.pending.length)}${homework.partial ? "+" : ""}`}
        caption={
          homework.pending.length === 0
            ? "تکلیف معوقه‌ای نداری"
            : nearestDue
              ? `فوری‌ترین: ${nearestDue.text}`
              : "بدون مهلت مشخص"
        }
      />
      <StatCard
        href={ROUTES.studentTests}
        icon={MdQuiz}
        tone="primary"
        label="میانگین نمره آزمون‌ها"
        value={loading.exams ? null : exams.averagePercent === null ? "—" : `${fa(exams.averagePercent)}٪`}
        caption={exams.taken > 0 ? `از ${fa(exams.taken)} آزمون انجام‌شده` : "هنوز آزمونی نداده‌ای"}
      />
    </div>
  );
}

function StatCard({
  href,
  icon: Icon,
  tone,
  label,
  value,
  caption,
}: {
  href: string;
  icon: IconType;
  tone: StatTone;
  label: string;
  /** `null` while loading. */
  value: string | null;
  caption: string;
}) {
  return (
    <Link
      href={href}
      className="surface-card group flex flex-col rounded-3xl p-4 transition hover:-translate-y-0.5 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`grid size-10 place-items-center rounded-2xl ${iconTones[tone]}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <HiArrowLeft
          className="size-4 text-muted-foreground transition group-hover:-translate-x-0.5 group-hover:text-brand-accent"
          aria-hidden="true"
        />
      </div>
      {/* Two lines tall on phones, so the numbers in a row line up. */}
      <p className="mt-4 min-h-10 text-sm font-bold leading-5 text-muted-foreground sm:min-h-0">{label}</p>
      {value === null ? (
        <Skeleton className="mt-2 h-9 w-16" />
      ) : (
        <strong className="mt-1 block text-3xl font-black text-foreground sm:text-4xl">{value}</strong>
      )}
      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{caption}</p>
    </Link>
  );
}
