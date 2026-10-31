import Link from "next/link";
import { HiCheckCircle, HiChevronLeft, HiClock } from "react-icons/hi";
import { MdAssignment } from "react-icons/md";
import AsyncState from "@/components/ui/AsyncState";
import { Skeleton } from "@/components/ui/Skeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import { ROUTES } from "@/constants/routes";
import { DASHBOARD_UPCOMING_HOMEWORK } from "@/constants/student";
import { describeDueDate, resolveHomeworkStatus } from "@/lib/presentation/homework";
import { studentHomeworkDetailPath } from "@/lib/utils/routes";
import type { Homework } from "@/types/homework";
import type { HomeworkSummary } from "@/types/student";
import type { SectionStatus } from "@/types/ui";
import DashboardSection from "./DashboardSection";

/** Homework still to send, nearest deadline first. */
export default function UpcomingHomework({
  homework,
  fetchedAt,
  status,
}: {
  homework: HomeworkSummary;
  /** Deadlines count down from when the list was read. */
  fetchedAt: number | null;
  status: SectionStatus;
}) {
  const shown = homework.pending.slice(0, DASHBOARD_UPCOMING_HOMEWORK);
  const hidden = homework.pending.length - shown.length;

  return (
    <DashboardSection
      id="dashboard-homework-title"
      title="تکالیف پیش رو"
      icon={MdAssignment}
      action={{ href: ROUTES.studentHomework, label: "همه تکالیف" }}
    >
      {status.loading ? (
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : status.error ? (
        <AsyncState message={status.error} retry={status.retry} />
      ) : shown.length === 0 ? (
        <p className="flex items-center gap-3 rounded-2xl bg-success-soft p-4 text-sm font-bold text-success">
          <HiCheckCircle className="size-6 shrink-0" aria-hidden="true" />
          تکلیف در انتظاری نداری؛ عالیه!
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {shown.map((item) => (
              <li key={item.id}>
                <HomeworkRow homework={item} fetchedAt={fetchedAt} />
              </li>
            ))}
          </ul>
          {(hidden > 0 || homework.partial) && (
            <p className="mt-3 text-xs text-muted-foreground">
              {hidden > 0
                ? `و ${hidden.toLocaleString("fa-IR")} تکلیف دیگر در فهرست تکالیف`
                : "تکالیف بیشتری در فهرست تکالیف هست"}
            </p>
          )}
        </>
      )}
    </DashboardSection>
  );
}

function HomeworkRow({ homework, fetchedAt }: { homework: Homework; fetchedAt: number | null }) {
  const due = describeDueDate(homework.due_at, fetchedAt);
  const late = resolveHomeworkStatus(homework) === "late-open";

  return (
    <Link
      href={studentHomeworkDetailPath(homework.id)}
      className="group block rounded-2xl bg-secondary-soft/45 p-4 ring-1 ring-inset ring-transparent transition hover:bg-secondary-soft/70 hover:ring-brand-accent/40"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-bold leading-7">{homework.title}</p>
        <HiChevronLeft
          className="mt-1 size-5 shrink-0 text-muted-foreground transition group-hover:-translate-x-0.5 group-hover:text-brand-accent"
          aria-hidden="true"
        />
      </div>
      <p className="truncate text-xs text-muted-foreground">
        {homework.course_title}
        {homework.lesson_title ? ` · ${homework.lesson_title}` : ""}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge tone={due?.tone ?? "neutral"}>
          <HiClock className="size-3.5" aria-hidden="true" />
          {due?.text ?? "بدون مهلت"}
        </StatusBadge>
        {late && <StatusBadge tone="warning">ارسال با تأخیر پذیرفته می‌شود</StatusBadge>}
      </div>
    </Link>
  );
}
