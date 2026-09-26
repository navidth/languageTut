"use client";

import "@/styles/globals.css";
import AppSidebar from "@/components/dashboard/navbar/AppSidebar";
import { itemsStudent } from "@/lib/constants";
import NavbarMobile from "@/components/dashboard/navbar/NavbarMobile";
import AppHeader from "@/components/dashboard/navbar/AppHeader";

export default function RootLayout({ children }: Readonly<{
      children: React.ReactNode;
}>) {
      return (
            <main className="min-h-screen bg-background sm:flex">
                  <div className="hidden sm:block">
                        <AppSidebar items={itemsStudent} />
                  </div>
                  <div className="sm:hidden">
                        <NavbarMobile items={itemsStudent} />
                  </div>
                  <div className="min-w-0 flex-1 transition-all duration-300 ease-in-out sm:ms-52">
                        <AppHeader />
                        <div className="mx-auto p-4 pb-24 sm:pb-6 md:p-6">
                              {children}
                        </div>
                  </div>
            </main>
      );
}
