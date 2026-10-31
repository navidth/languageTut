import { menuItems } from "@/constants/navigation";
import Link from "next/link";
import { activeMenuItemClass, idleMenuItemClass } from "@/constants/ui";
import { isMenuLinkActive } from "@/lib/utils/navigation";

const MenuDesktop = ({ pathName }: { pathName: string }) => {
      return (
            <nav dir="rtl" aria-label="منوی اصلی" className="hidden flex-row items-center gap-1 text-base md:flex">
                  {menuItems.map((item) => {
                        const active = isMenuLinkActive(item.link, pathName);

                        return (
                              <Link
                                    key={item.id}
                                    href={item.link}
                                    aria-current={active ? "page" : undefined}
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium lg:px-4 ${active ? activeMenuItemClass : `${idleMenuItemClass} hover:bg-muted`}`}
                              >
                                    {/* Hidden below lg, so five items and the header actions fit on one line on tablets. */}
                                    {item.icon && typeof item.icon === "function" && (
                                          <item.icon className={`hidden lg:block ${active ? "text-brand-accent" : ""}`} />
                                    )}
                                    {item.label}
                              </Link>
                        );
                  })}
            </nav>
      );
};

export default MenuDesktop;
