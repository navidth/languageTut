import Link from "next/link";
import { HiAcademicCap, HiCollection, HiLockClosed, HiSparkles } from "react-icons/hi";
import MediaGallery from "@/components/media/MediaGallery";
import type { Course } from "@/lib/courses";

const courseTypeLabels: Record<string, string> = {
  general: "زبان عمومی",
  ielts: "آیلتس",
};

function formatPrice(course: Course) {
  return course.is_free || course.price === 0
    ? "رایگان"
    : `${course.price.toLocaleString("fa-IR")} تومان`;
}

export default function CourseGrid({
  initialCourses,
}: {
  initialCourses: Course[];
}) {
  return (
    <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {initialCourses.map((course) => (
        <article key={course.id} className="surface-card flex overflow-hidden rounded-3xl p-0 transition hover:-translate-y-1">
          <div className="flex w-full min-w-0 flex-col">
            <MediaGallery
              media={course.media}
              compact
              limit={1}
              audioLabel="فایل صوتی دوره"
              videoLabel="ویدئوی دوره"
            />

            <div className="flex flex-1 flex-col p-6">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="brand-badge rounded-full px-3 py-1 text-xs font-bold">
                  سطح {course.level_detail.code}
                </span>
                <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-bold text-brand-secondary dark:text-white">
                  {courseTypeLabels[course.course_type] ?? course.course_type}
                </span>
                {course.is_recommended && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-warning">
                    <HiSparkles className="size-3.5" aria-hidden="true" />
                    پیشنهادی
                  </span>
                )}
              </div>

              <h2 className="text-xl font-black leading-8 text-foreground">{course.title}</h2>
              <p className="mt-3 line-clamp-3 grow text-sm leading-7 text-muted-foreground">
                {course.description || "برای این دوره هنوز توضیحی ثبت نشده است."}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-3 border-y border-border py-4 text-sm">
                <div className="flex items-center gap-2">
                  <HiAcademicCap className="size-5 shrink-0 text-brand-accent" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-muted-foreground">درس‌ها</dt>
                    <dd className="mt-0.5 font-bold">{course.lessons_count.toLocaleString("fa-IR")}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <HiCollection className="size-5 shrink-0 text-brand-accent" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-muted-foreground">منابع</dt>
                    <dd className="mt-0.5 font-bold">{course.resources_count.toLocaleString("fa-IR")}</dd>
                  </div>
                </div>
              </dl>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">هزینه دوره</p>
                  <strong className={`mt-1 block text-lg ${course.is_free ? "text-success" : "text-foreground"}`}>
                    {formatPrice(course)}
                  </strong>
                  <span className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${course.has_access ? "text-success" : "text-muted-foreground"}`}>
                    {course.has_access ? "دسترسی برای شما فعال است" : (
                      <>
                        <HiLockClosed className="size-3.5" aria-hidden="true" />
                        نیاز به تهیه دوره
                      </>
                    )}
                  </span>
                </div>
                <Link href={`/courses/${course.id}`} className="brand-button shrink-0 rounded-xl px-4 py-2.5 text-sm">
                  مشاهده دوره
                </Link>
              </div>

              {!course.is_active && (
                <p className="feedback-warning mt-4 rounded-xl p-3 text-xs" role="status">
                  این دوره در حال حاضر غیرفعال است.
                </p>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
