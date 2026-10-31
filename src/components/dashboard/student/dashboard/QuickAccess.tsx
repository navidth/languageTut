import Link from "next/link";
import { studentQuickLinks } from "@/constants/navigation";

/** Shortcut tiles to the student's other pages. */
export default function QuickAccess() {
  return (
    <section aria-labelledby="dashboard-quick-title">
      <h2 id="dashboard-quick-title" className="mb-4 text-xl font-black">
        دسترسی سریع
      </h2>
      {/* On phones the fifth tile spans both columns instead of sitting alone. */}
      <ul className="grid grid-cols-2 gap-3 max-sm:[&>li:last-child:nth-child(odd)]:col-span-2 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
        {studentQuickLinks.map(({ link, label, hint, icon: Icon }) => (
          <li key={link}>
            <Link
              href={link}
              className="surface-card group flex h-full flex-col gap-3 rounded-2xl p-4 transition hover:-translate-y-0.5 sm:p-5"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-secondary-soft text-brand-secondary transition group-hover:bg-brand-accent group-hover:text-brand-primary dark:text-white">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-bold">{label}</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">{hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
