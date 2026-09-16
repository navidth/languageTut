"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CourseBackLink() {
  const pathname = usePathname();
  const href = pathname.startsWith("/student/") ? "/student/all-courses" : "/courses";

  return <Link href={href} className="brand-link mb-8 inline-block">بازگشت به دوره‌ها</Link>;
}
