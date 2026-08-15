import type { Metadata } from "next";
import SkillsDashboard from "@/components/dashboard/skills/SkillsDashboard";

export const metadata: Metadata = { title: "مهارت‌های زبان" };

export default function Page() {
  return <SkillsDashboard />;
}
