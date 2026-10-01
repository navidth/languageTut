import type { Metadata } from "next";
import HomeworkDetailPage from "@/components/dashboard/homework/HomeworkDetailPage";

export const metadata: Metadata = { title: "جزئیات تکلیف" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HomeworkDetailPage id={Number(id)} />;
}
