import type { Metadata } from "next";
import SkillDetail from "@/components/dashboard/skills/SkillDetail";

export const metadata: Metadata = { title: "جزئیات مهارت" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SkillDetail id={Number(id)} />;
}
