import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from ".";

/**
 * Titles of every course already present in the store, keyed by course id.
 * Lets pages that only know a course id show its name without a new request.
 */
export const selectKnownCourseTitles = createSelector(
  [
    (state: RootState) => state.courses.pages,
    (state: RootState) => state.student.enrollmentPages,
    (state: RootState) => state.student.enrolledCoursePages,
    (state: RootState) => state.student.overview.progress.courses,
  ],
  (coursePages, enrollmentPages, enrolledCoursePages, progressCourses) => {
    const titles: Record<number, string> = {};

    for (const progress of progressCourses) {
      titles[progress.course] = progress.course_title;
    }
    for (const entry of Object.values(enrollmentPages)) {
      for (const enrollment of entry.data?.results ?? []) {
        titles[enrollment.course] = enrollment.course_title;
      }
    }
    for (const entry of [
      ...Object.values(coursePages),
      ...Object.values(enrolledCoursePages),
    ]) {
      for (const course of entry.data?.results ?? []) {
        titles[course.id] = course.title;
      }
    }

    return titles;
  },
);
