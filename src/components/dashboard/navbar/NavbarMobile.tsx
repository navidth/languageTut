import { MenuItems } from "@/types"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

type Props = {
      items: MenuItems
}
const NavbarMobile: React.FC<Props> = ({ items }) => {
      const pathname = usePathname();

      return (
            <nav className="fixed inset-x-3 bottom-3 z-50 flex min-h-16 items-center justify-around rounded-2xl border border-white/10 bg-brand-primary px-2 text-white shadow-2xl" aria-label="منوی پنل" >
                  {items && items.map((item) => {
                        if (!item.link) return null;
                        const isActive = item.link === pathname;
                        return (
                              <Link key={item.id} href={item.link} aria-current={isActive ? "page" : undefined} aria-label={item.label} className={`relative flex flex-col items-center justify-center rounded-xl p-3 ${isActive ? "bg-brand-accent text-brand-primary shadow-sm" : "text-white/75 hover:bg-brand-secondary hover:text-white"}`}>
                                    {typeof item.icon === "function" && (
                                          <item.icon
                                                size={24}
                                          />
                                    )}
                                    {/* <span className="block w-full px-3">{item.label}</span> */}
                              </Link>
                        )
                  })}
            </nav>
      )
}

export default NavbarMobile
