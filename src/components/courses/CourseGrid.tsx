"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Course } from "@/lib/courses";
import { hydrateCourses } from "@/store/coursesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function CourseGrid({ initialCourses, count }: { initialCourses: Course[]; count: number }) {
  const dispatch = useAppDispatch();
  const courses = useAppSelector((state) => state.courses.items);

  useEffect(() => {
    dispatch(hydrateCourses({ items: initialCourses, count }));
  }, [dispatch, initialCourses, count]);

  const items = courses.length ? courses : initialCourses;
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((course) => (
        <article key={course.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">سطح {course.level_detail.code}</span>
            <span className="text-sm text-gray-500">{course.lessons_count} درس</span>
          </div>
          <h2 className="mb-3 text-xl font-bold">{course.title}</h2>
          <p className="mb-6 grow leading-7 text-gray-600 dark:text-gray-300">{course.description}</p>
          <div className="flex items-center justify-between">
            <strong>{course.is_free ? "رایگان" : `${course.price.toLocaleString("fa-IR")} تومان`}</strong>
            <Link href={`/courses/${course.id}`} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">مشاهده دوره</Link>
          </div>
        </article>
      ))}
    </div>
  );
}
