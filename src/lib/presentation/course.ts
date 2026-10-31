import type { Course, CourseType } from "@/types/course";
import { courseTypeLabels } from "@/constants/course";

export function formatCourseType(type: CourseType) {
  return courseTypeLabels[type] ?? type;
}

export function formatCoursePrice(course: Pick<Course, "is_free" | "price">) {
  return course.is_free || course.price === 0
    ? "رایگان"
    : `${course.price.toLocaleString("fa-IR")} تومان`;
}
