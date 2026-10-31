export const ROUTES = {
  home: "/",
  courses: "/courses",
  studentCourses: "/student/all-courses",
  studentDashboard: "/student",
  teacherDashboard: "/teacher",
  placementTest: "/student/placement-test",
  studentTests: "/student/tests",
  studentHomework: "/student/homework",
  ai: "/ai",
} as const;

export const PLACEMENT_SECTION_ID = "placement-test";

/** The lessons heading on both course pages; links jump to it. */
export const COURSE_LESSONS_SECTION_ID = "course-lessons-title";
