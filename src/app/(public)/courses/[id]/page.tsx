import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BACKEND_BASE_URL } from "@/lib/apiClient";
import { Course } from "@/lib/courses";

type Props = { params: Promise<{ id: string }> };

async function getCourse(id: string): Promise<Course | null> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/courses/${id}/`, { next: { revalidate: 300 } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("دریافت اطلاعات دوره ناموفق بود.");
  return response.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) return { title: "دوره پیدا نشد", robots: { index: false } };
  return {
    title: course.title,
    description: course.description.slice(0, 160),
    alternates: { canonical: `/courses/${id}` },
    openGraph: { title: course.title, description: course.description, url: `/courses/${id}`, type: "article" },
  };
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": "Course", name: course.title, description: course.description, educationalLevel: course.level_detail.code, provider: { "@type": "Organization", name: "آموزش آیلتس" }, offers: { "@type": "Offer", price: course.price, priceCurrency: "IRR", availability: course.is_active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" } };
  return (
    <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link href="/courses" className="mb-8 inline-block text-blue-600">بازگشت به دوره‌ها</Link>
      <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-10">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">سطح {course.level_detail.code}</span>
        <h1 className="my-6 text-3xl font-extrabold md:text-4xl">{course.title}</h1>
        <p className="mb-8 text-lg leading-9 text-gray-600 dark:text-gray-300">{course.description}</p>
        <dl className="grid gap-4 border-t pt-6 sm:grid-cols-3">
          <div><dt className="text-sm text-gray-500">تعداد درس‌ها</dt><dd className="mt-1 font-bold">{course.lessons_count.toLocaleString("fa-IR")}</dd></div>
          <div><dt className="text-sm text-gray-500">سطح</dt><dd className="mt-1 font-bold">{course.level_detail.title}</dd></div>
          <div><dt className="text-sm text-gray-500">هزینه</dt><dd className="mt-1 font-bold">{course.is_free ? "رایگان" : `${course.price.toLocaleString("fa-IR")} تومان`}</dd></div>
        </dl>
      </div>
    </article>
  );
}
