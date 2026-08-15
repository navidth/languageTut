import type { Metadata } from "next";
import StudentResourcePage from "@/components/dashboard/student/StudentResourcePage";
export const metadata: Metadata = { title: "تمرین‌های تستی" };
export default function Page() { return <StudentResourcePage kind="tests" />; }
