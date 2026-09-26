"use client";

import { DarkThemeToggle, Navbar } from "flowbite-react";
import { useState } from "react";
import { HiOutlineMenu } from "react-icons/hi";
import { usePathname } from "next/navigation";
import Brand from "./Brand";
import LandingAccountAction from "./LandingAccountAction";
import MenuDesktop from "./MenuDesktop";
import MobileMenu from "./MobileMenu";

export default function NavbarIndex() {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();

  return (
    <>
      <Navbar
        dir="rtl"
        fluid
        className="fixed left-1/2 top-4 z-50 w-[calc(100%-32px)] max-w-[1000px] -translate-x-1/2 rounded-2xl border border-border !bg-[var(--glass)] shadow-[var(--shadow-brand-sm)] backdrop-blur-xl sm:sticky sm:top-0 sm:w-full sm:max-w-none sm:translate-x-0 sm:rounded-none sm:border-x-0 sm:px-3"
      >
        <Brand />
        <MenuDesktop pathName={pathName} />

        <div className="mx-1 flex items-center gap-2 sm:mx-3">
          <DarkThemeToggle className="cursor-pointer !text-brand-secondary hover:!bg-accent-soft hover:!text-brand-primary dark:!text-brand-accent" />

          <LandingAccountAction />

          <button
            onClick={() => setOpen(true)}
            className="rounded-xl p-2 text-brand-primary hover:bg-accent-soft dark:text-white md:hidden"
            aria-label="باز کردن منوی اصلی"
            aria-expanded={open}
          >
            <HiOutlineMenu size={24} />
          </button>
        </div>
      </Navbar>

      <MobileMenu
        pathName={pathName}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
