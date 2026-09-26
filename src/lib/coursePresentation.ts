import type { Course, CourseType } from "./courses";

export const courseTypeLabels: Record<string, string> = {
  general: "زبان عمومی",
  ielts: "آیلتس",
};

export function formatCourseType(type: CourseType) {
  return courseTypeLabels[type] ?? type;
}

export function formatCoursePrice(course: Pick<Course, "is_free" | "price">) {
  return course.is_free || course.price === 0
    ? "رایگان"
    : `${course.price.toLocaleString("fa-IR")} تومان`;
}
