"use client"
import { menuItems } from "@/lib/constants";
import { Button, DarkThemeToggle, Navbar } from "flowbite-react";
import Brand from "./Brand";
import { useState } from "react";
import { HiOutlineMenu } from "react-icons/hi";
import MobileMenu from "./MobileMenu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuDesktop from "./MenuDesktop";
import useWindows from "@/hooks/useWindows";

export default function NavbarIndex() {
  const [open, setOpen] = useState(false);
  const pathName = usePathname()
  const size = useWindows()
  
  return (
    <>
      <Navbar
        dir="ltr"
        fluid
        className={`z-50 bg-[var(--glass)] !important dark:bg-[var(--background)] !important backdrop-blur-2xl shadow-md ${size && size.width > 640 ? "w-full px-3 py-4 sticky top-0 " : "w-[calc(100%-60px)] max-w-[1000px] rounded-full fixed top-[30px] left-1/2 -translate-x-1/2 "}
        `}>
        <Brand />
        <MenuDesktop pathName={pathName} />

        {/* Actions */}
        <div className="flex items-center gap-2 mx-3">
          <DarkThemeToggle className="cursor-pointer focus:outline-0 focus:ring-0  duration-300 " />

          <Button pill className="hidden md:flex cursor-pointer ">
            شروع یادگیری
          </Button>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 text-zinc-800   "
          >
            <HiOutlineMenu size={24} />
          </button>
        </div>

      </Navbar >

      {/* Mobile Fullscreen Menu */}
      < MobileMenu pathName={pathName} open={open} onClose={() => setOpen(false)
      } />
    </>
  );
}

