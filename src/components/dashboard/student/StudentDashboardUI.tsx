"use client";

import LoginPrompt from "@/components/auth/LoginPrompt";
import ContinueLearning from "@/components/dashboard/student/dashboard/ContinueLearning";
import DashboardHero from "@/components/dashboard/student/dashboard/DashboardHero";
import DashboardStats from "@/components/dashboard/student/dashboard/DashboardStats";
import LevelCard from "@/components/dashboard/student/dashboard/LevelCard";
import QuickAccess from "@/components/dashboard/student/dashboard/QuickAccess";
import RecentResults from "@/components/dashboard/student/dashboard/RecentResults";
import UpcomingHomework from "@/components/dashboard/student/dashboard/UpcomingHomework";
import Reveal from "@/components/ui/Reveal";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";

export default function StudentDashboardUI() {
  const { session, user, overview, exams, homework } = useStudentDashboard();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DashboardHero
        user={user}
        learning={overview.learning}
        loading={overview.loading}
        pendingHomework={homework.summary.pending}
        homeworkFetchedAt={homework.fetchedAt}
      />

      {session === "anonymous" ? (
        <LoginPrompt message="برای دیدن پیشرفت، تکالیف و نتیجه آزمون‌هایت، وارد حساب دانش‌آموزی شو." />
      ) : (
        <>
          <p role="status" className="sr-only">
            {overview.loading ? "در حال دریافت اطلاعات داشبورد..." : ""}
          </p>
          <DashboardStats
            enrollmentCount={overview.enrollmentCount}
            learning={overview.learning}
            exams={exams.summary}
            homework={homework.summary}
            homeworkFetchedAt={homework.fetchedAt}
            loading={{ overview: overview.loading, exams: exams.loading, homework: homework.loading }}
          />
          <Reveal className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-6">
              <ContinueLearning learning={overview.learning} enrollmentCount={overview.enrollmentCount} status={overview} />
              <RecentResults exams={exams.summary} status={exams} />
            </div>
            <div className="grid content-start gap-6 md:grid-cols-2 xl:grid-cols-1">
              <LevelCard level={user?.current_level ?? null} />
              <UpcomingHomework homework={homework.summary} fetchedAt={homework.fetchedAt} status={homework} />
            </div>
          </Reveal>
        </>
      )}

      <Reveal>
        <QuickAccess />
      </Reveal>
    </div>
  );
}
