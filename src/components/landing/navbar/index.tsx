"use client";

import AuthModalButton from "@/components/auth/AuthModalButton";
import useWindows from "@/hooks/useWindows";
import { DarkThemeToggle, Navbar } from "flowbite-react";
import { useState } from "react";
import { HiOutlineMenu } from "react-icons/hi";
import { usePathname } from "next/navigation";
import Brand from "./Brand";
import MenuDesktop from "./MenuDesktop";
import MobileMenu from "./MobileMenu";

export default function NavbarIndex() {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();
  const size = useWindows();

  return (
    <>
      <Navbar
        dir="ltr"
        fluid
        className={`z-50 !important backdrop-blur-2xl shadow-md dark:bg-[var(--background)] !important ${
          size && size.width > 640
            ? "sticky top-0 w-full px-3 py-4"
            : "fixed top-[30px] left-1/2 w-[calc(100%-60px)] max-w-[1000px] -translate-x-1/2 rounded-full"
        }`}
      >
        <Brand />
        <MenuDesktop pathName={pathName} />

        <div className="mx-3 flex items-center gap-2">
          <DarkThemeToggle className="cursor-pointer duration-300 focus:outline-0 focus:ring-0" />

          <AuthModalButton className="hidden cursor-pointer md:flex">
            شروع یادگیری
          </AuthModalButton>

          <button
            onClick={() => setOpen(true)}
            className="p-2 text-zinc-800 md:hidden"
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
