import Link from "next/link";
import { HiChevronLeft } from "react-icons/hi";
import { MdQuiz } from "react-icons/md";
import AsyncState from "@/components/ui/AsyncState";
import EmptyState from "@/components/ui/EmptyState";
import ProgressRing from "@/components/ui/ProgressRing";
import { Skeleton } from "@/components/ui/Skeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import { ROUTES } from "@/constants/routes";
import { DASHBOARD_RECENT_RESULTS } from "@/constants/student";
import { scoreTone } from "@/lib/presentation/dashboard";
import { formatExamType } from "@/lib/presentation/exam";
import { formatPersianDate } from "@/lib/utils/date";
import { formatDecimal, parseDecimal } from "@/lib/utils/format";
import { studentExamResultPath } from "@/lib/utils/routes";
import type { ExamSubmission } from "@/types/exam";
import type { ExamSummary } from "@/types/student";
import type { RingTone, SectionStatus } from "@/types/ui";
import DashboardSection from "./DashboardSection";

const scoreTextTones: Record<RingTone, string> = {
  accent: "text-brand-accent",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
};

/** The latest finished attempt at each test, newest first. */
export default function RecentResults({ exams, status }: { exams: ExamSummary; status: SectionStatus }) {
  const recent = exams.recent.slice(0, DASHBOARD_RECENT_RESULTS);

  return (
    <DashboardSection
      id="dashboard-results-title"
      title="نتایج اخیر آزمون‌ها"
      description="آخرین نمره تو در هر آزمون"
      icon={MdQuiz}
      action={{ href: ROUTES.studentTests, label: "همه آزمون‌ها" }}
    >
      {status.loading ? (
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : status.error ? (
        <AsyncState message={status.error} retry={status.retry} />
      ) : recent.length === 0 ? (
        <EmptyState
          icon={MdQuiz}
          headingLevel="h3"
          title="هنوز آزمونی نداده‌ای"
          description="با یک آزمون تمرینی کوتاه، نقاط قوت و ضعفت را بشناس."
          action={<Link href={ROUTES.studentTests} className="brand-button rounded-xl px-5 py-2.5 text-sm">رفتن به تمرین‌های تستی</Link>}
        />
      ) : (
        <ul className="-mx-2 space-y-1">
          {recent.map((submission) => (
            <li key={submission.id}>
              <ResultRow submission={submission} />
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  );
}

function ResultRow({ submission }: { submission: ExamSubmission }) {
  const pending = submission.grading_status === "pending";
  const percent = parseDecimal(submission.percentage);
  const tone = scoreTone(submission);
  const score = `${formatDecimal(submission.percentage)}٪`;

  return (
    <Link
      href={studentExamResultPath(submission.practice_test)}
      className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-secondary-soft/60 sm:gap-4"
    >
      <ProgressRing
        value={pending ? null : percent}
        label={pending ? "در انتظار تصحیح" : `نمره: ${score}`}
        tone={tone}
        thickness={14}
        className="size-12 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{submission.practice_test_title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatExamType(submission.exam_type)} ·{" "}
          {formatPersianDate(submission.submitted_at, { day: "numeric", month: "long" })}
        </p>
        {/* Under the title, so a narrow row keeps the test's name readable. */}
        {pending && <StatusBadge tone="warning" className="mt-1.5">در انتظار تصحیح</StatusBadge>}
      </div>
      {!pending && <strong className={`shrink-0 text-lg font-black ${scoreTextTones[tone]}`}>{score}</strong>}
      <HiChevronLeft
        className="size-5 shrink-0 text-muted-foreground transition group-hover:-translate-x-0.5 group-hover:text-brand-accent"
        aria-hidden="true"
      />
    </Link>
  );
}
