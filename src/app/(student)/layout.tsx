"use client";
import "@/styles/globals.css";
import useWindows from "@/hooks/useWindows";
import AppSidebar from "@/components/dashboard/navbar/AppSidebar";
import { itemsStudent } from "@/lib/constants";
import NavbarMobile from "@/components/dashboard/navbar/NavbarMobile";
import AppHeader from "@/components/dashboard/navbar/AppHeader";

export default function RootLayout({ children }: Readonly<{
      children: React.ReactNode;
}>) {
      return (
            <>
                  <ClientLayout>
                        {children}
                  </ClientLayout>
            </>
      );
}

function ClientLayout({ children }: { children: React.ReactNode }) {
      const size = useWindows()
      return (
            <main className="min-h-screen bg-background sm:flex">
                  {size && size.width > 640 ? (
                        <AppSidebar items={itemsStudent} />
                  ) : size && <NavbarMobile items={itemsStudent} />}
                  <div className="min-w-0 flex-1 transition-all duration-300 ease-in-out sm:ms-52">
                        <AppHeader />
                        <div className="mx-auto p-4 pb-24 md:p-6 sm:pb-6">
                              {children}
                        </div>
                  </div>
            </main>
      )
}
