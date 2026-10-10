"use client";

import { MenuItems } from "@/types"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useEffect, useRef } from "react"

type Props = {
      items: MenuItems
}
const NavbarMobile: React.FC<Props> = ({ items }) => {
      const pathname = usePathname();
      const activeRef = useRef<HTMLAnchorElement>(null);

      // The bar scrolls sideways on narrow screens; keep the current page in view.
      useEffect(() => {
            activeRef.current?.scrollIntoView?.({ block: "nearest", inline: "center" });
      }, [pathname]);

      return (
            <nav className="fixed inset-x-3 bottom-3 z-50 overflow-hidden rounded-2xl border border-white/10 bg-brand-primary text-white shadow-2xl sm:hidden" aria-label="منوی پنل" >
                  <ul className="flex snap-x snap-proximity gap-1 overflow-x-auto overscroll-x-contain px-3 py-2 mask-[linear-gradient(to_left,transparent,#000_0.75rem,#000_calc(100%-0.75rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {items && items.map((item) => {
                              if (!item.link) return null;
                              const isActive = item.link === pathname;
                              return (
                                    <li key={item.id} className="shrink-0 snap-start">
                                          <Link ref={isActive ? activeRef : undefined} href={item.link} aria-current={isActive ? "page" : undefined} className={`relative flex min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium leading-4 ${isActive ? "bg-brand-accent text-brand-primary shadow-sm" : "text-white/75 hover:bg-brand-secondary hover:text-white"}`}>
                                                {typeof item.icon === "function" && (
                                                      <item.icon
                                                            size={22}
                                                            aria-hidden="true"
                                                      />
                                                )}
                                                <span className="whitespace-nowrap">{item.label}</span>
                                          </Link>
                                    </li>
                              )
                        })}
                  </ul>
            </nav>
      )
}

export default NavbarMobile
