import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { HiCollection, HiSparkles } from "react-icons/hi";
import CourseBackLink from "@/components/courses/CourseBackLink";
import CourseLessonList from "@/components/courses/CourseLessonList";
import CourseStartAction from "@/components/courses/CourseStartAction";
import MediaGallery from "@/components/media/MediaGallery";
import { formatCoursePrice, formatCourseType } from "@/lib/presentation/course";
import { formatPersianDate } from "@/lib/utils/date";
import { publicCoursesApi } from "@/lib/services/publicCoursesApi";
import { coursePath } from "@/lib/utils/routes";
import { COURSE_LESSONS_SECTION_ID } from "@/constants/routes";

type Props = { params: Promise<{ id: string }> };

// Built ahead (or on the first visit), then regenerated in the background.
// The page reads no search params, so it stays static.
export const revalidate = 300;

// generateMetadata and the page share one request.
const getCourse = cache(publicCoursesApi.get);

/** The first page of courses is built ahead; the rest on their first visit. */
export async function generateStaticParams() {
  const courses = await publicCoursesApi.list(1).catch(() => null);
  return courses?.results.map((course) => ({ id: String(course.id) })) ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) return { title: "دوره پیدا نشد", robots: { index: false } };

  const description = course.description || `دوره ${course.title} در سطح ${course.level_detail.code}`;
  return {
    title: course.title,
    description: description.slice(0, 160),
    alternates: { canonical: coursePath(id) },
    openGraph: {
      title: course.title,
      description,
      url: coursePath(id),
      type: "article",
    },
  };
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();

  const lessons = await publicCoursesApi.lessons(id);
  const courseType = formatCourseType(course.course_type);
  const available = course.is_active && !course.deleted_at;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description || `دوره ${course.title}`,
    educationalLevel: course.level_detail.code,
    courseCode: String(course.id),
    isAccessibleForFree: course.is_free,
    provider: { "@type": "Organization", name: "ExamificatioN" },
    offers: {
      "@type": "Offer",
      price: course.is_free ? 0 : course.price * 10,
      priceCurrency: "IRR",
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <article className="mx-auto max-w-6xl px-4 pb-14 pt-28 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <CourseBackLink />

      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary p-7 text-white shadow-[var(--shadow-brand-md)] md:p-10">
        <div className="pointer-events-none absolute -end-20 -top-24 size-72 rounded-full border-[3rem] border-white/[0.04]" aria-hidden="true" />
        <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-accent px-3 py-1 text-xs font-black text-brand-primary">
                سطح {course.level_detail.code}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold">
                {courseType}
              </span>
              {course.is_recommended && (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-xs font-bold text-brand-accent">
                  <HiSparkles className="size-3.5" aria-hidden="true" />
                  دوره پیشنهادی
                </span>
              )}
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${available ? "bg-success/20 text-white" : "bg-white/10 text-white/60"}`}>
                {available ? "فعال" : "غیرفعال"}
              </span>
            </div>
            <h1 className="mt-6 text-3xl font-black leading-tight md:text-5xl">{course.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 md:text-lg">
              {course.description || "برای این دوره هنوز توضیحی ثبت نشده است."}
            </p>
          </div>

          <div className="min-w-64 rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm">
            <p className="text-xs text-white/55">هزینه دوره</p>
            <strong className="mt-1 block text-2xl text-brand-accent">{formatCoursePrice(course)}</strong>
            <CourseStartAction initialCourse={course} />
          </div>
        </div>
      </header>

      <MediaGallery
        media={course.media}
        title="رسانه‌های دوره"
        description="فایل‌های ویدئویی و صوتی معرفی یا محتوای دوره را همین‌جا پخش کنید."
        audioLabel="فایل صوتی دوره"
        videoLabel="ویدئوی دوره"
        className="mt-8"
      />

      <section className="surface-card mt-8 rounded-3xl p-6 sm:p-8" aria-labelledby="course-details-title">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-brand-accent">
            <HiCollection className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 id="course-details-title" className="text-xl font-black">جزئیات کامل دوره</h2>
            <p className="mt-1 text-sm text-muted-foreground">اطلاعات ثبت‌شده برای این دوره در سامانه</p>
          </div>
        </div>

        <dl className="mt-7 grid gap-x-6 gap-y-5 border-t border-border pt-7 sm:grid-cols-2 lg:grid-cols-4">
          <CourseInfo label="شناسه دوره" value={course.id.toLocaleString("fa-IR")} />
          <CourseInfo label="نوع دوره" value={courseType} />
          <CourseInfo label="سطح" value={`${course.level_detail.title} (${course.level_detail.code})`} />
          <CourseInfo label="مقدار level" value={course.level.toLocaleString("fa-IR")} />
          <CourseInfo label="شناسه سطح" value={course.level_detail.id.toLocaleString("fa-IR")} />
          <CourseInfo label="ترتیب سطح" value={course.level_detail.order.toLocaleString("fa-IR")} />
          <CourseInfo label="تعداد درس‌ها" value={course.lessons_count.toLocaleString("fa-IR")} />
          <CourseInfo label="تعداد منابع" value={course.resources_count.toLocaleString("fa-IR")} />
          <CourseInfo label="تعداد رسانه‌ها" value={(course.media?.length ?? 0).toLocaleString("fa-IR")} />
          <CourseInfo label="وضعیت دسترسی" value={course.has_access ? "دسترسی فعال" : "نیاز به تهیه دوره"} />
          <CourseInfo label="رایگان" value={course.is_free ? "بله" : "خیر"} />
          <CourseInfo label="پیشنهادی" value={course.is_recommended ? "بله" : "خیر"} />
          <CourseInfo label="اولویت پیشنهاد" value={course.recommendation_order?.toLocaleString("fa-IR") ?? "—"} />
          <CourseInfo label="وضعیت انتشار" value={course.is_active ? "فعال" : "غیرفعال"} />
          <CourseInfo label="تاریخ ایجاد" value={formatPersianDate(course.created_at, { year: "numeric", month: "long", day: "numeric" })} />
          <CourseInfo label="آخرین به‌روزرسانی" value={formatPersianDate(course.updated_at, { year: "numeric", month: "long", day: "numeric" })} />
          <CourseInfo label="وضعیت حذف" value={course.deleted_at ? `حذف‌شده در ${formatPersianDate(course.deleted_at, { year: "numeric", month: "long", day: "numeric" })}` : "حذف نشده"} />
          <CourseInfo label="قیمت ثبت‌شده" value={formatCoursePrice(course)} />
        </dl>
      </section>

      <section className="mt-10" aria-labelledby={COURSE_LESSONS_SECTION_ID}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id={COURSE_LESSONS_SECTION_ID} className="text-2xl font-black">درس‌های دوره</h2>
          <span className="rounded-full bg-secondary-soft px-3 py-1 text-sm text-muted-foreground">
            {(lessons?.count ?? course.lessons_count).toLocaleString("fa-IR")} درس
          </span>
        </div>

        <CourseLessonList courseId={course.id} initialLessons={lessons} />
      </section>
    </article>
  );
}

function CourseInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-sm font-bold text-foreground">{value}</dd>
    </div>
  );
}
