import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HiCheckCircle, HiCollection, HiLockClosed, HiSparkles } from "react-icons/hi";
import MediaGallery from "@/components/media/MediaGallery";
import Pagination from "@/components/ui/Pagination";
import { BACKEND_BASE_URL } from "@/lib/apiClient";
import type { Course, Lesson, PaginatedLessons } from "@/lib/courses";
import { parsePageParam } from "@/lib/pagination";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lessonPage?: string | string[] }>;
};

export const dynamic = "force-dynamic";

const skillNames: Record<string, string> = {
  listening: "شنیداری",
  reading: "خواندن",
  writing: "نوشتن",
  speaking: "مکالمه",
};

const courseTypeLabels: Record<string, string> = {
  general: "زبان عمومی",
  ielts: "آیلتس",
};

function formatPrice(course: Course) {
  return course.is_free || course.price === 0
    ? "رایگان"
    : `${course.price.toLocaleString("fa-IR")} تومان`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
}

async function getCourse(id: string): Promise<Course | null> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/courses/${id}/`, {
    next: { revalidate: 300 },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("دریافت اطلاعات دوره ناموفق بود.");
  return response.json();
}

async function getCourseLessons(id: string, page: number): Promise<PaginatedLessons | null> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/courses/${id}/lessons/?page=${page}`, {
    next: { revalidate: 300 },
  });

  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error("دریافت درس‌های دوره از سرور ناموفق بود.");
  return response.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) return { title: "دوره پیدا نشد", robots: { index: false } };

  const description = course.description || `دوره ${course.title} در سطح ${course.level_detail.code}`;
  return {
    title: course.title,
    description: description.slice(0, 160),
    alternates: { canonical: `/courses/${id}` },
    openGraph: {
      title: course.title,
      description,
      url: `/courses/${id}`,
      type: "article",
    },
  };
}

export default async function CoursePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { lessonPage: lessonPageParam } = await searchParams;
  const lessonPage = parsePageParam(lessonPageParam);
  const course = await getCourse(id);
  if (!course) notFound();

  const lessons = await getCourseLessons(id, lessonPage);
  const courseType = courseTypeLabels[course.course_type] ?? course.course_type;
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
    <article className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Link href="/courses" className="brand-link mb-8 inline-block">بازگشت به دوره‌ها</Link>

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
            <strong className="mt-1 block text-2xl text-brand-accent">{formatPrice(course)}</strong>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-white/75">
              {course.has_access ? (
                <>
                  <HiCheckCircle className="size-5 text-success" aria-hidden="true" />
                  دسترسی شما فعال است
                </>
              ) : (
                <>
                  <HiLockClosed className="size-5 text-brand-accent" aria-hidden="true" />
                  برای مشاهده کامل، دوره را تهیه کنید
                </>
              )}
            </div>
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
          <CourseInfo label="تاریخ ایجاد" value={formatDate(course.created_at)} />
          <CourseInfo label="آخرین به‌روزرسانی" value={formatDate(course.updated_at)} />
          <CourseInfo label="وضعیت حذف" value={course.deleted_at ? `حذف‌شده در ${formatDate(course.deleted_at)}` : "حذف نشده"} />
          <CourseInfo label="قیمت ثبت‌شده" value={formatPrice(course)} />
        </dl>
      </section>

      <section className="mt-10" aria-labelledby="course-lessons-title">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="course-lessons-title" className="text-2xl font-black">درس‌های دوره</h2>
          <span className="rounded-full bg-secondary-soft px-3 py-1 text-sm text-muted-foreground">
            {(lessons?.count ?? course.lessons_count).toLocaleString("fa-IR")} درس
          </span>
        </div>

        {!lessons ? (
          <div className="surface-card rounded-2xl p-8 text-center">
            <HiLockClosed className="mx-auto size-8 text-brand-accent" aria-hidden="true" />
            <p className="mt-4 font-bold">فهرست درس‌ها برای این حساب در دسترس نیست.</p>
            <p className="mt-2 text-sm text-muted-foreground">برای مشاهده محتوای دوره وارد شوید یا دسترسی دوره را فعال کنید.</p>
          </div>
        ) : lessons.results.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            هنوز درسی برای این دوره منتشر نشده است.
          </p>
        ) : (
          <>
            <ol className="space-y-4">
              {lessons.results.map((lesson) => <LessonItem key={lesson.id} lesson={lesson} />)}
            </ol>
            <Pagination
              currentPage={lessonPage}
              count={lessons.count}
              resultsCount={lessons.results.length}
              next={lessons.next}
              previous={lessons.previous}
              basePath={`/courses/${id}`}
              pageParam="lessonPage"
              ariaLabel="صفحه‌بندی درس‌های دوره"
            />
          </>
        )}
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

function LessonItem({ lesson }: { lesson: Lesson }) {
  const skill = skillNames[lesson.skill_detail.name] ?? lesson.skill_detail.name;

  return (
    <li className="surface-card rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-secondary-soft px-3 py-1 text-sm font-bold text-brand-secondary dark:text-white">
          {skill}
        </span>
        <span className="text-sm text-muted-foreground">درس {lesson.order.toLocaleString("fa-IR")}</span>
      </div>

      <h3 className="mt-4 text-xl font-bold">{lesson.title}</h3>
      <p className="mt-3 whitespace-pre-line leading-8 text-muted-foreground">{lesson.content}</p>

      {(lesson.audio_url || lesson.video_url || lesson.attachment_url) && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          {lesson.audio_url && <MediaLink href={lesson.audio_url} label="فایل صوتی" />}
          {lesson.video_url && <MediaLink href={lesson.video_url} label="ویدئو" />}
          {lesson.attachment_url && <MediaLink href={lesson.attachment_url} label="پیوست درس" />}
        </div>
      )}
    </li>
  );
}

function MediaLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="ghost-button rounded-lg px-3 py-2 text-sm">
      {label}
    </a>
  );
}
