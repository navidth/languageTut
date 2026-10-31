import Link from "next/link";
import { FaLayerGroup } from "react-icons/fa";
import { HiArrowLeft } from "react-icons/hi";
import { LanguageLevelGauge } from "@/components/dashboard/student/LanguageLevelGauge";
import { CEFR_LEVELS } from "@/constants/levels";
import { ROUTES } from "@/constants/routes";
import type { CurrentLevel } from "@/types/level";
import DashboardSection from "./DashboardSection";

/** The student's CEFR level on the A1–C2 path, or the way to find it. */
export default function LevelCard({ level }: { level: CurrentLevel | null }) {
  const reached = level ? CEFR_LEVELS.indexOf(level) : -1;

  return (
    <DashboardSection
      id="dashboard-level-title"
      title="سطح زبان"
      icon={FaLayerGroup}
      action={{ href: "/student/levels", label: "سطح‌ها" }}
    >
      {level ? (
        <>
          <LanguageLevelGauge level={level} />
          <ol className="mt-5 grid grid-cols-6 gap-1.5" aria-label="مسیر سطح‌های زبان">
            {CEFR_LEVELS.map((code, index) => (
              <li
                key={code}
                aria-current={code === level ? "step" : undefined}
                className={`rounded-lg py-1.5 text-center text-xs font-black ${
                  code === level
                    ? "bg-brand-accent text-brand-primary shadow-[0_0_0_4px_var(--accent-soft)]"
                    : index < reached
                      ? "bg-accent-soft text-brand-accent"
                      : "bg-secondary-soft text-muted-foreground"
                }`}
              >
                <span dir="ltr">{code}</span>
              </li>
            ))}
          </ol>
          <Link
            href={ROUTES.placementTest}
            className="ghost-button mt-5 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm"
          >
            آزمون تعیین سطح
            <HiArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </>
      ) : (
        <div className="py-2 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-accent-soft text-brand-accent">
            <FaLayerGroup className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-4 font-black">سطحت هنوز مشخص نشده است</p>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-7 text-muted-foreground">
            با یک آزمون کوتاه، سطح دقیق خودت را پیدا کن تا دوره‌های مناسب را ببینی.
          </p>
          <Link
            href={ROUTES.placementTest}
            className="brand-button mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
          >
            شروع آزمون تعیین سطح
            <HiArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </DashboardSection>
  );
}
