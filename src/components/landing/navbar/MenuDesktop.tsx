import { menuItems } from "@/lib/constants";
import Link from "next/link";

const MenuDesktop = ({ pathName }: { pathName: string }) => {
      const isActive = (link: string) => {
            if (link === "/") return pathName === "/";
            return !link.includes("#") && pathName.startsWith(link);
      };

      return (
            <nav dir="rtl" aria-label="منوی اصلی" className="hidden flex-row items-center gap-6 text-base md:flex">
                  {menuItems.map((item) => (
                        <Link
                              key={item.id}
                              href={item.link}
                              aria-current={isActive(item.link) ? "page" : undefined}
                              className={`flex items-center gap-1 border-b-2 py-2 font-semibold ${isActive(item.link) ? "border-brand-accent text-brand-secondary dark:text-brand-accent" : "border-transparent text-foreground"} hover:border-brand-accent hover:text-brand-secondary dark:hover:text-brand-accent`}
                        >
                              {item.icon && typeof item.icon === "function" && (
                                    <item.icon />
                              )}
                              {item.label}
                        </Link>
                  ))}
            </nav>
      );
};

export default MenuDesktop;
