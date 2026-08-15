"use client";

import useWindows from "@/hooks/useWindows";
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
  const size = useWindows();

  return (
    <>
      <Navbar
        dir="rtl"
        fluid
        className={`z-50 border-b border-border !bg-[var(--glass)] shadow-[var(--shadow-brand-sm)] backdrop-blur-xl ${
          size && size.width > 640
            ? "sticky top-0 w-full px-3 py-4"
            : "fixed top-4 left-1/2 w-[calc(100%-32px)] max-w-[1000px] -translate-x-1/2 rounded-2xl border"
        }`}
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
