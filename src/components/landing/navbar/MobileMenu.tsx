import { menuItems } from "@/constants/navigation";
import Link from "next/link";
import { activeMenuItemClass, idleMenuItemClass } from "@/constants/ui";
import { useActiveMenuLink } from "@/hooks/useActiveMenuLink";

// Floating bottom bar below md, in the same pill style as the desktop menu.
// Items are icons only; the current one opens into a pill with its label.
// Below 360px the items and label shrink a step, so the longest label fits.
export default function MobileMenu({ pathName }: { pathName: string }) {
      const { activeLink, select } = useActiveMenuLink(pathName);

      return (
            <nav
                  dir="rtl"
                  aria-label="منوی اصلی"
                  className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-sm items-center justify-between rounded-full border border-border bg-muted/95 p-1.5 shadow-[var(--shadow-brand-md)] backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-[var(--glass)]"
            >
                  {menuItems.map((item) => {
                        const active = item.link === activeLink;

                        return (
                              <Link
                                    key={item.id}
                                    href={item.link}
                                    onClick={() => select(item.link)}
                                    aria-current={active ? (item.link.includes("#") ? "location" : "page") : undefined}
                                    className={`flex h-12 min-w-10 items-center justify-center rounded-full px-2.5 min-[360px]:min-w-12 min-[360px]:px-3 ${active ? activeMenuItemClass : `${idleMenuItemClass} hover:bg-card/60`}`}
                              >
                                    {item.icon && typeof item.icon === "function" && (
                                          <item.icon
                                                size={22}
                                                className={`shrink-0 ${active ? "animate-[nav-icon-pop_450ms_ease-out] text-brand-accent" : ""}`}
                                          />
                                    )}
                                    {/* The column grows from 0fr to 1fr, so the label opens to its own width. */}
                                    <span
                                          className={`grid transition-[grid-template-columns] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${active ? "grid-cols-[1fr]" : "grid-cols-[0fr]"}`}
                                    >
                                          <span className="min-w-0 overflow-hidden">
                                                <span
                                                      className={`block whitespace-nowrap ps-2 text-xs font-medium transition-[opacity,translate,filter] min-[360px]:text-sm duration-300 ${active ? "translate-x-0 opacity-100 blur-none delay-100" : "translate-x-3 opacity-0 blur-[2px]"}`}
                                                >
                                                      {item.label}
                                                </span>
                                          </span>
                                    </span>
                              </Link>
                        );
                  })}
            </nav>
      );
}
