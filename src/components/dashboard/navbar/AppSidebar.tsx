"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {MdKeyboardArrowDown } from "react-icons/md";
import { MenuItems } from "@/types";
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
    <ul className="space-y-2 font-medium overflow-x-hidden">

      {items?.map((item) => {
        if (!item.link) return null;

        const hasSubmenu = !!item.subitems;
        const isActive = item.link === pathname;

        return (
          <li key={item.id} className="flex flex-col">
            {hasSubmenu ? (
              <button
                onClick={() => toggleSubmenu(item.id)}
                className={`relative flex flex-row justify-between items-center p-2 text-foreground w-full
                  ${isActive ? "bg-blue-600" : "hover:bg-gray-800"}`} >
                <div className="flex">
                  <span className="block w-full order-2 px-3">{item.label}</span>
                  {typeof item.icon === "function" && (
                    <item.icon
                      size={24}
                      className={`${isActive ? "text-white" : "text-gray-500"} order-1`}
                    />
                  )}
                </div>
                <MdKeyboardArrowDown
                  className={`duration-300 order-3 ${openMenuId === item.id ? "rotate-180" : ""} text-gray-400`}
                  size={32}
                />
              </button>
            ) : (
              <Link href={item.link} className={`relative flex flex-row items-center p-2  w-full rounded-xl
                  ${isActive ? "bg-primary text-background" : "hover:bg-primary hover:text-primary-foreground"}`}
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
              <ul className="flex flex-col pr-6 bg-[#101a2b] text-gray-200 text-sm duration-300">
                {item.subitems.map((sub) => (
                  <li key={sub.id}>
                    <Link
                      href={sub.link}
                      className={`block px-4 py-2 hover:bg-[#132033] hover:text-[#00d1ff] transition-colors duration-200 
                        ${pathname === sub.link ? "text-[#00d1ff]" : ""}`}
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
      className={` min-w-52 fixed lg:mt-0 top-0 px-2 right-0  z-50  !important bg-secondary !important backdrop-blur-2xl shadow-md h-screen transition-all duration-300 ease-in-out  border-r border-gray-800`}>

      {/* <Link href="/" className="lg:flex items-center justify-center hidden">
        <Image
          width={100} height={100}
          src="/images/logoWhite.png"
          alt="Logo"
        />

      </Link> */}

      <nav className="flex-1 overflow-y-auto mt-10 ">
        {renderMenuItems(items)}
      </nav>
    </aside>
  );
};

export default AppSidebar;
