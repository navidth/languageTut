import Link from "next/link";
import BrandMark from "@/components/ui/BrandMark";
import { PLACEMENT_SECTION_ID } from "@/lib/routes";

const footerGroups = [
  {
    title: "یادگیری",
    links: [
      { label: "دوره‌های زبان", href: "/courses" },
      { label: "تعیین سطح", href: `/#${PLACEMENT_SECTION_ID}` },
      { label: "مهارت‌های زبان", href: "/#skills" },
    ],
  },
  {
    title: "ExamificatioN",
    links: [
      { label: "امکانات", href: "/#features" },
      { label: "نحوه کار", href: "/#how-it-works" },
      { label: "درباره ما", href: "/#about" },
    ],
  },
  {
    title: "دسترسی سریع",
    links: [
      { label: "دستیار هوشمند", href: "/ai" },
      { label: "فضای مدرس‌ها", href: "/teacher" },
      { label: "سؤالات متداول", href: "/#faq" },
    ],
  },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-brand-primary px-4 text-white sm:px-6">
      <div className="mx-auto max-w-6xl py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1.85fr]">
          <div>
            <BrandMark variant="wordmark" inverse />
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
              پلتفرم هوشمند آموزش زبان برای تعیین سطح، یادگیری شخصی‌سازی‌شده و مدیریت بهتر تجربه آموزش.
            </p>
          </div>

          <nav aria-label="لینک‌های پایین صفحه" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerGroups.map(({ title, links }) => (
              <div key={title}>
                <h2 className="text-sm font-black text-white">{title}</h2>
                <ul className="mt-5 space-y-3">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-sm text-white/55 hover:text-brand-accent">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ExamificatioN. تمامی حقوق محفوظ است.</p>
          <p>طراحی‌شده برای یک تجربه یادگیری روشن‌تر</p>
        </div>
      </div>
    </footer>
  );
}
