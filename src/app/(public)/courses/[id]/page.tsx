import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BACKEND_BASE_URL } from "@/lib/apiClient";
import type { Course, Lesson, PaginatedLessons } from "@/lib/courses";

type Props = { params: Promise<{ id: string }> };

const skillNames: Record<string, string> = {
  listening: "شنیداری",
  reading: "خواندن",
  writing: "نوشتن",
  speaking: "مکالمه",
};

async function getCourse(id: string): Promise<Course | null> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/courses/${id}/`, { next: { revalidate: 300 } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("دریافت اطلاعات دوره ناموفق بود.");
  return response.json();
}

async function getCourseLessons(id: string): Promise<PaginatedLessons> {
  const response = await fetch(
    `${BACKEND_BASE_URL}/api/courses/${id}/lessons/`,
    { next: { revalidate: 300 } },
  );

  if (!response.ok) throw new Error("دریافت درس‌های دوره از سرور ناموفق بود.");
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
  const lessons = await getCourseLessons(id);
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

      <section className="mt-10" aria-labelledby="course-lessons-title">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="course-lessons-title" className="text-2xl font-extrabold">
            درس‌های دوره
          </h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-200">
            {lessons.count.toLocaleString("fa-IR")} درس
          </span>
        </div>

        {lessons.results.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800">
            هنوز درسی برای این دوره منتشر نشده است.
          </p>
        ) : (
          <ol className="space-y-4">
            {lessons.results.map((lesson) => (
              <LessonItem key={lesson.id} lesson={lesson} />
            ))}
          </ol>
        )}
      </section>
    </article>
  );
}

function LessonItem({ lesson }: { lesson: Lesson }) {
  const skill = skillNames[lesson.skill_detail.name] ?? lesson.skill_detail.name;

  return (
    <li className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-200">
          {skill}
        </span>
        <span className="text-sm text-gray-500">
          درس {lesson.order.toLocaleString("fa-IR")}
        </span>
      </div>

      <h3 className="mt-4 text-xl font-bold">{lesson.title}</h3>
      <p className="mt-3 whitespace-pre-line leading-8 text-gray-600 dark:text-gray-300">
        {lesson.content}
      </p>

      {(lesson.audio_url || lesson.video_url || lesson.attachment_url) && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
          {lesson.audio_url && (
            <MediaLink href={lesson.audio_url} label="فایل صوتی" />
          )}
          {lesson.video_url && (
            <MediaLink href={lesson.video_url} label="ویدئو" />
          )}
          {lesson.attachment_url && (
            <MediaLink href={lesson.attachment_url} label="پیوست درس" />
          )}
        </div>
      )}
    </li>
  );
}

function MediaLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
    >
      {label}
    </a>
  );
}
