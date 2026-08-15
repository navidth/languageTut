import type { Metadata } from "next";
import StudentResourcePage from "@/components/dashboard/student/StudentResourcePage";

export const metadata: Metadata = {
  title: "آزمون تعیین سطح",
  description: "آزمون‌های تعیین سطح و سنجش مهارت زبان در ExamificatioN.",
};

export default function PlacementTestPage() {
  return (
    <StudentResourcePage
      kind="tests"
      eyebrow="شروع مسیر شخصی شما"
      heading="آزمون تعیین سطح"
      description="یکی از آزمون‌های موجود را انتخاب کنید تا سطح فعلی شما با دقت بیشتری سنجیده شود."
    />
  );
}
