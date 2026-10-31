import Link from "next/link";
import { Progress } from "flowbite-react";
import { HiArrowLeft, HiChevronLeft } from "react-icons/hi";
import { MdCastForEducation } from "react-icons/md";
import AsyncState from "@/components/ui/AsyncState";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import { ROUTES } from "@/constants/routes";
import { DASHBOARD_MORE_COURSES } from "@/constants/student";
import { BRAND_PROGRESS_THEME } from "@/constants/ui";
import { coursePercent } from "@/lib/presentation/dashboard";
import { formatPersianDate } from "@/lib/utils/date";
import { studentCoursePath } from "@/lib/utils/routes";
import type { CourseProgress, LearningSummary } from "@/types/student";
import type { SectionStatus } from "@/types/ui";
import DashboardSection from "./DashboardSection";

const fa = (value: number) => value.toLocaleString("fa-IR");

/** The course to pick up again, then the student's other courses. */
export default function ContinueLearning({
  learning,
  enrollmentCount,
  status,
}: {
  learning: LearningSummary;
  enrollmentCount: number;
  status: SectionStatus;
}) {
  const featured = learning.continueCourse ?? learning.courses[0] ?? null;
  const others = learning.courses.filter((course) => course !== featured).slice(0, DASHBOARD_MORE_COURSES);

  return (
    <DashboardSection
      id="dashboard-courses-title"
      title="ادامه یادگیری"
      description="دوره‌هایی که در آن‌ها پیش رفته‌ای"
      icon={MdCastForEducation}
      action={{ href: "/student/courses", label: "کورس‌های من" }}
    >
      {status.loading ? (
        <div aria-hidden="true">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="mt-4 h-12" />
        </div>
      ) : status.error && !featured ? (
        <AsyncState message={status.error} retry={status.retry} />
      ) : !featured ? (
        enrollmentCount > 0 ? (
          <EmptyState
            icon={MdCastForEducation}
            headingLevel="h3"
            title="دوره‌هایت آماده شروع‌اند"
            description="اولین درس را باز کن تا پیشرفتت اینجا نمایش داده شود."
            action={<Link href="/student/courses" className="brand-button rounded-xl px-5 py-2.5 text-sm">رفتن به کورس‌های من</Link>}
          />
        ) : (
          <EmptyState
            icon={MdCastForEducation}
            headingLevel="h3"
            title="هنوز در دوره‌ای ثبت‌نام نکرده‌ای"
            description="از میان دوره‌ها، دوره مناسب سطح خودت را انتخاب کن."
            action={<Link href={ROUTES.studentCourses} className="brand-button rounded-xl px-5 py-2.5 text-sm">مشاهده همه دوره‌ها</Link>}
          />
        )
      ) : (
        <>
          <FeaturedCourse course={featured} />
          {others.length > 0 && (
            <ul className="mt-3 divide-y divide-border">
              {others.map((course) => (
                <li key={course.id}>
                  <CourseRow course={course} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </DashboardSection>
  );
}

function FeaturedCourse({ course }: { course: CourseProgress }) {
  const percent = Math.round(coursePercent(course));
  const finished = percent >= 100;

  return (
    <article className="relative overflow-hidden rounded-2xl bg-linear-to-br from-secondary-soft via-secondary-soft/60 to-accent-soft/70 p-5 sm:p-6 dark:to-secondary-soft/30">
      <div className="pointer-events-none absolute -end-10 -top-12 size-40 rounded-full bg-brand-accent/10 blur-2xl" aria-hidden="true" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="info">سطح {course.level}</StatusBadge>
          {finished && <StatusBadge tone="success">تکمیل شده</StatusBadge>}
        </div>
        <h3 className="mt-3 text-xl font-black leading-8 sm:text-2xl">{course.course_title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          آخرین فعالیت: {formatPersianDate(course.updated_at, { day: "numeric", month: "long", year: "numeric" })}
        </p>

        {/* Flowbite puts `className` on the inner bar, so the wrapper grows. */}
        <div className="mt-5 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <Progress
              progress={percent}
              size="md"
              theme={BRAND_PROGRESS_THEME}
              textLabel={`پیشرفت ${course.course_title}`}
            />
          </div>
          <span className="text-sm font-black">{fa(percent)}٪</span>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{fa(course.completed_lessons)}</strong> از{" "}
            {fa(course.total_lessons)} درس تکمیل شده
          </p>
          <Link
            href={studentCoursePath(course.course)}
            className="brand-button inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
          >
            {finished ? "مرور دوره" : "ادامه دوره"}
            <HiArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CourseRow({ course }: { course: CourseProgress }) {
  const percent = Math.round(coursePercent(course));

  return (
    <Link href={studentCoursePath(course.course)} className="group flex items-center gap-4 py-3.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate font-bold transition group-hover:text-brand-secondary dark:group-hover:text-brand-accent">
            {course.course_title}
          </p>
          <span className="shrink-0 text-xs font-black text-muted-foreground">{fa(percent)}٪</span>
        </div>
        <Progress
          progress={percent}
          size="sm"
          theme={BRAND_PROGRESS_THEME}
          textLabel={`پیشرفت ${course.course_title}`}
          className="mt-2"
        />
      </div>
      <HiChevronLeft
        className="size-5 shrink-0 text-muted-foreground transition group-hover:-translate-x-0.5 group-hover:text-brand-accent"
        aria-hidden="true"
      />
    </Link>
  );
}
