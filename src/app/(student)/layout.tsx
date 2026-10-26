"use client";

import "@/styles/globals.css";
import AppSidebar from "@/components/dashboard/navbar/AppSidebar";
import { itemsStudent } from "@/lib/constants";
import NavbarMobile from "@/components/dashboard/navbar/NavbarMobile";
import AppHeader from "@/components/dashboard/navbar/AppHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar from the tablet width up (an icon rail below lg), bottom bar on phones. */}
      <AppSidebar items={itemsStudent} />
      <NavbarMobile items={itemsStudent} />
      <div className="min-w-0 sm:ms-24 lg:ms-52">
        <AppHeader />
        <main id="main-content" className="mx-auto p-4 pb-28 sm:pb-6 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
