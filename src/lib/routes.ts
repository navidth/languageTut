export const ROUTES = {
  home: "/",
  studentDashboard: "/student",
  teacherDashboard: "/teacher",
  placementTest: "/student/placement-test",
  studentTests: "/student/tests",
  studentHomework: "/student/homework",
  ai: "/ai",
} as const;

/** `course` lets the test page offer that course for purchase on a 403. */
export function studentTestPath(testId: number, course?: number) {
  return course
    ? `${ROUTES.studentTests}/${testId}?course=${course}`
    : `${ROUTES.studentTests}/${testId}`;
}

export function studentExamResultPath(testId: number) {
  return `${ROUTES.studentTests}/${testId}/result`;
}

export function studentHomeworkDetailPath(homeworkId: number) {
  return `${ROUTES.studentHomework}/${homeworkId}`;
}

export function studentHomeworkPath(filters: { course?: number } = {}) {
  return filters.course
    ? `${ROUTES.studentHomework}?course=${filters.course}`
    : ROUTES.studentHomework;
}

export const PLACEMENT_SECTION_ID = "placement-test";
