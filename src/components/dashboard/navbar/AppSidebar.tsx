"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdKeyboardArrowDown } from "react-icons/md";
import { MenuItems } from "@/types";
import BrandMark from "@/components/ui/BrandMark";
type Props = {
  items: MenuItems
}

const AppSidebar: React.FC<Props> = ({ items }) => {

  const pathname = usePathname();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const toggleSubmenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const renderMenuItems = (items: MenuItems) => (
    <ul className="space-y-1 overflow-x-hidden font-medium lg:space-y-2">

      {items?.map((item) => {
        if (!item.link) return null;

        const hasSubmenu = !!item.subitems;
        const isActive = item.link === pathname;

        return (
          <li key={item.id} className="flex flex-col">
            {hasSubmenu ? (
              <button
                onClick={() => toggleSubmenu(item.id)}
                className={`relative flex w-full flex-row items-center justify-between rounded-xl p-2 text-sidebar-foreground
                  ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"}`} >
                <div className="flex">
                  <span className="block w-full order-2 px-3">{item.label}</span>
                  {typeof item.icon === "function" && (
                    <item.icon
                      size={24}
                      className="order-1"
                    />
                  )}
                </div>
                <MdKeyboardArrowDown
                  className={`order-3 text-white/65 duration-300 ${openMenuId === item.id ? "rotate-180" : ""}`}
                  size={32}
                />
              </button>
            ) : (
              <Link href={item.link} className={`relative flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-[11px] leading-4 lg:flex-row lg:gap-0 lg:p-2 lg:text-start lg:text-base
                  ${isActive ? "bg-sidebar-primary font-bold text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
                aria-current={isActive ? "page" : undefined}
              >

                {typeof item.icon === "function" && (
                  <item.icon
                    size={24}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span className="block w-full lg:px-3">{item.label}</span>
              </Link>
            )}

            {hasSubmenu && openMenuId === item.id && item.subitems && (
              <ul className="mt-1 flex flex-col rounded-xl bg-white/5 pr-6 text-sm text-white/75 duration-300">
                {item.subitems.map((sub) => (
                  <li key={sub.id}>
                    <Link
                      href={sub.link}
                      className={`block rounded-lg px-4 py-2 transition-colors duration-200 hover:bg-sidebar-accent hover:text-white
                        ${pathname === sub.link ? "text-brand-accent" : ""}`}
                    >
                      {sub.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    // An icon rail on tablets, the full sidebar from lg; phones use NavbarMobile.
    <aside
      className="fixed start-0 top-0 z-50 hidden h-dvh w-24 flex-col border-e border-sidebar-border bg-sidebar px-3 text-sidebar-foreground shadow-xl sm:flex lg:w-52">
      <BrandMark compact inverse prefetch={false} className="mt-5 shrink-0 justify-center lg:hidden" />
      <BrandMark inverse prefetch={false} className="mt-5 hidden shrink-0 px-1 lg:inline-flex" />
      <div className="mx-1 mt-5 h-px shrink-0 bg-white/10" />
      {/* Scrolls on its own when the window is too short for every item. */}
      <nav className="-mx-1 mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-4 lg:mt-5" aria-label="منوی پنل">
        {renderMenuItems(items)}
      </nav>
    </aside>
  );
};

export default AppSidebar;
