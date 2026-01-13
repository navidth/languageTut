"use client";
import "@/styles/globals.css";
import useWindows from "@/hooks/useWindows";
import AppSidebar from "@/components/dashboard/navbar/AppSidebar";
import { itemsStudent } from "@/lib/constants";
import NavbarMobile from "@/components/dashboard/navbar/NavbarMobile";

export default function RootLayout({ children }: Readonly<{
      children: React.ReactNode;
}>) {
      return (
            <>
                  <ClientLayout>
                        <main>
                              {children}
                        </main>
                  </ClientLayout>
            </>
      );
}

function ClientLayout({ children }: { children: React.ReactNode }) {
      const size = useWindows()
      return (
            <>
                  {size && size.width > 641 ? (
                        <AppSidebar items={itemsStudent} />
                  ) : <NavbarMobile items={itemsStudent} />}
                  {/* (
                        <AppSidebar />
                  ) */}
                  {children}
            </>
      )
}
