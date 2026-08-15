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
    <ul className="space-y-2 overflow-x-hidden font-medium">

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
              <Link href={item.link} className={`relative flex w-full flex-row items-center rounded-xl p-2
                  ${isActive ? "bg-sidebar-primary font-bold text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
                aria-current={isActive ? "page" : undefined}
              >

                {typeof item.icon === "function" && (
                  <item.icon
                    size={24}
                  />
                )}
                <span className="block w-full px-3">{item.label}</span>
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
    <aside
      className="fixed start-0 top-0 z-50 h-screen w-52 border-e border-sidebar-border bg-sidebar px-3 text-sidebar-foreground shadow-xl transition-all duration-300 ease-in-out">
      <BrandMark inverse className="mt-5 px-1" />
      <div className="mx-1 mt-5 h-px bg-white/10" />
      <nav className="mt-5 flex-1 overflow-y-auto" aria-label="منوی پنل">
        {renderMenuItems(items)}
      </nav>
    </aside>
  );
};

export default AppSidebar;
