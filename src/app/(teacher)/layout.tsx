import NavbarIndex from "@/components/landing/navbar";
import SiteFooter from "@/components/landing/SiteFooter";

export default function TeacherLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="public-site">
      <NavbarIndex />
      <main className="min-h-screen bg-background">{children}</main>
      <SiteFooter />
    </div>
  );
}
