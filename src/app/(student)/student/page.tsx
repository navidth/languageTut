import type { Metadata } from "next";
import StudentDashboardUI from "@/components/dashboard/student/StudentDashboardUI"

export const metadata: Metadata = { title: "داشبورد دانش‌آموز" };

const page = () => {
  return (
    <div>
      <StudentDashboardUI />
    </div>
  )
}

export default page
