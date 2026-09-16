import type { Metadata } from "next";
import CourseCatalogPage from "@/components/dashboard/student/CourseCatalogPage";

export const metadata: Metadata = { title: "همه دوره‌ها" };

export default function Page() {
  return <CourseCatalogPage />;
}
