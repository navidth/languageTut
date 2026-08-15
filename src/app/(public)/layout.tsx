import type { Metadata } from "next";
import NavbarIndex from "@/components/landing/navbar";
import SiteFooter from "@/components/landing/SiteFooter";

export const metadata: Metadata = {
  title: "آموزش هوشمند زبان",
  description: "آموزش آنلاین زبان در ExamificatioN با دوره‌های سطح‌بندی‌شده از A1 تا C2.",
};

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="public-site">
      <a
        href="#main-content"
        className="fixed start-4 top-4 z-[1000] -translate-y-24 rounded-full bg-brand-accent px-5 py-3 font-bold text-brand-primary focus:translate-y-0"
      >
        رفتن به محتوای اصلی
      </a>
      <NavbarIndex />
      <main id="main-content" className="min-h-screen bg-background">{children}</main>
      <SiteFooter />
    </div>
  );
}
