import AppHeader from "@/components/dashboard/navbar/AppHeader";
import StudentNavigation from "@/components/dashboard/navbar/StudentNavigation";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <StudentNavigation />
      <div className="min-w-0 sm:ms-24 lg:ms-52">
        <AppHeader />
        <main id="main-content" className="mx-auto p-4 pb-28 sm:pb-6 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
