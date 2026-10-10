import type { Metadata } from "next";
import TestDetailPage from "@/components/dashboard/student/TestDetailPage";
export const metadata: Metadata = { title: "جزئیات آزمون" };
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ course?: string }>;
}) {
  const [{ id }, { course }] = await Promise.all([params, searchParams]);
  const courseId = Number(course);
  return (
    <TestDetailPage
      id={Number(id)}
      courseId={Number.isInteger(courseId) && courseId > 0 ? courseId : undefined}
    />
  );
}
