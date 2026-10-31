import { ROUTES } from "@/constants/routes";

export function coursePath(courseId: number | string) {
  return `${ROUTES.courses}/${courseId}`;
}

export function studentCoursePath(courseId: number) {
  return `${ROUTES.studentCourses}/${courseId}`;
}

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
