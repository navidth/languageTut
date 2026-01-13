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
            <div className=" min-h-10 bg-secondary fixed bottom-0 w-full left-0 flex items-center justify-around " >
                  {items && items.map((item) => {
                        if (!item.link) return null;
                        const hasSubmenu = !!item.subitems;
                        const isActive = item.link === pathname;
                        return (
                              <Link key={item.id} href={item.link} className={`relative flex flex-col justify-center items-center p-2 rounded-xl ${isActive ? "bg-primary text-background" : "hover:bg-primary hover:text-primary-foreground"}`}>
                                    {typeof item.icon === "function" && (
                                          <item.icon
                                                size={24}
                                          />
                                    )}
                                    {/* <span className="block w-full px-3">{item.label}</span> */}
                              </Link>
                        )
                  })}
            </div>
      )
}

export default NavbarMobile