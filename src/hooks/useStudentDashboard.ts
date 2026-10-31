"use client";

import { useCallback, useEffect, useMemo } from "react";
import { hasActiveSession, useSessionState } from "@/hooks/useSessionState";
import { summarizeExams, summarizeHomework, summarizeLearning } from "@/lib/presentation/dashboard";
import { fetchHomeworkList, homeworkListKey } from "@/store/homeworkSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchExamSubmissions, fetchStudentOverview } from "@/store/studentSlice";

// The first homework page holds the most recent assignments.
const HOMEWORK_FILTERS = { page: 1 };
const HOMEWORK_KEY = homeworkListKey(HOMEWORK_FILTERS);

/**
 * Everything the student dashboard shows, from three cached requests: the
 * progress overview, the exam history and the first homework page. They
 * run only with a session, and each section reports its own loading and
 * error state, so one slow request holds back no other section.
 */
export function useStudentDashboard() {
  const dispatch = useAppDispatch();
  const session = useSessionState();
  const active = hasActiveSession(session);
  const user = useAppSelector((state) => state.auth.user);
  const overview = useAppSelector((state) => state.student.overview);
  const exams = useAppSelector((state) => state.student.examSubmissions);
  const homework = useAppSelector((state) => state.homework.lists[HOMEWORK_KEY]);

  useEffect(() => {
    if (!active) return;
    void dispatch(fetchStudentOverview());
    void dispatch(fetchExamSubmissions());
    void dispatch(fetchHomeworkList(HOMEWORK_FILTERS));
  }, [active, dispatch]);

  const learning = useMemo(() => summarizeLearning(overview.progress), [overview.progress]);
  const examSummary = useMemo(() => summarizeExams(exams.items), [exams.items]);
  const homeworkSummary = useMemo(() => summarizeHomework(homework?.data), [homework?.data]);

  const retryOverview = useCallback(() => void dispatch(fetchStudentOverview({ force: true })), [dispatch]);
  const retryExams = useCallback(() => void dispatch(fetchExamSubmissions({ force: true })), [dispatch]);
  const retryHomework = useCallback(
    () => void dispatch(fetchHomeworkList({ ...HOMEWORK_FILTERS, force: true })),
    [dispatch],
  );

  return {
    session,
    user,
    overview: {
      enrollmentCount: overview.enrollmentCount,
      learning,
      // Placeholders hold the place of the numbers until the first answer.
      loading: !overview.lastFetched && overview.status !== "failed",
      error: overview.error,
      retry: retryOverview,
    },
    exams: {
      summary: examSummary,
      loading: !exams.lastFetched && exams.status !== "failed",
      error: exams.status === "failed" ? exams.error : null,
      retry: retryExams,
    },
    homework: {
      summary: homeworkSummary,
      /** When the list was read; deadlines count down from it. */
      fetchedAt: homework?.lastFetched ?? null,
      loading: !homework?.data && homework?.status !== "failed",
      error: homework?.status === "failed" && !homework.data ? homework.error : null,
      retry: retryHomework,
    },
  };
}
