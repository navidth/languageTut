import type { Metadata } from "next";
import ExamResultPage from "@/components/dashboard/student/ExamResultPage";

export const metadata: Metadata = { title: "نتیجه آزمون" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExamResultPage id={Number(id)} />;
}
