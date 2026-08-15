import type { Metadata } from "next";
import ProfilePage from "@/components/dashboard/student/ProfilePage";
export const metadata: Metadata = { title: "پروفایل دانش‌آموز" };
export default function Page() { return <ProfilePage />; }
