"use client";

import { useSearchParams } from "next/navigation";
import { parseHomeworkSearchParams } from "@/lib/homeworkPresentation";
import HomeworkListPage from "./HomeworkListPage";

/**
 * Seeds the homework list from the URL query (for example `?course=15` from a
 * course page). Reading the query on the client keeps the route a static
 * shell that the router can prefetch and cache.
 */
export default function HomeworkListRoute() {
  const searchParams = useSearchParams();
  const { page, course, scope } = parseHomeworkSearchParams({
    page: searchParams.get("page") ?? undefined,
    course: searchParams.get("course") ?? undefined,
    scope: searchParams.get("scope") ?? undefined,
  });

  return (
    <HomeworkListPage
      // A different query is a different starting point for the filters.
      key={searchParams.toString()}
      initialPage={page}
      initialCourse={course}
      initialScope={scope}
    />
  );
}
