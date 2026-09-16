import type { Metadata } from "next";
import StudentCourseDetailPage from "@/components/dashboard/student/StudentCourseDetailPage";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = { title: "جزئیات دوره" };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <StudentCourseDetailPage courseId={Number(id)} />;
}
