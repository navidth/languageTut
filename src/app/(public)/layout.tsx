import type { Metadata } from "next";
import NavbarIndex from "@/components/landing/navbar";
import SiteFooter from "@/components/landing/SiteFooter";

export const metadata: Metadata = {
  title: "آموزش آنلاین آیلتس",
  description: "آموزش آنلاین آیلتس با دوره‌های سطح‌بندی‌شده از A1 تا C2.",
};

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><NavbarIndex /><main>{children}</main><SiteFooter /></>;
}
