"use client";

import { DarkThemeToggle, Navbar } from "flowbite-react";
import { usePathname } from "next/navigation";
import Brand from "./Brand";
import LandingAccountAction from "./LandingAccountAction";
import MenuDesktop from "./MenuDesktop";
import MobileMenu from "./MobileMenu";

export default function NavbarIndex() {
  const pathName = usePathname();

  return (
    <>
      <Navbar
        dir="rtl"
        fluid
        className="fixed left-1/2 z-50 w-full -translate-x-1/2  border border-border bg-(--glass)!  backdrop-blur-xl "
      >
        <Brand />
        <MenuDesktop pathName={pathName} />

        <div className="mx-1 flex items-center gap-2 sm:mx-3">
          <DarkThemeToggle className="cursor-pointer text-brand-secondary! hover:bg-accent-soft! hover:text-brand-primary! dark:text-brand-accent!" />

          <LandingAccountAction />
        </div>
      </Navbar>

      <MobileMenu pathName={pathName} />
    </>
  );
}
