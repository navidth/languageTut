import { menuItems } from "@/lib/constants";
import Link from "next/link";
import { HiX } from "react-icons/hi";
import BrandMark from "@/components/ui/BrandMark";
import LandingAccountAction from "./LandingAccountAction";

export default function MobileMenu({
      open,
      onClose,
      pathName,
}: {
      open: boolean;
      onClose: () => void;
      pathName: string;
}) {
      return (
            <div
                  aria-hidden={!open}
                  inert={!open}
                  className={`
                        fixed inset-0 z-[999] bg-background/95 backdrop-blur-xl transition-transform duration-300
                        ${open ? "translate-x-0" : "pointer-events-none translate-x-full"}
                        md:hidden
                  `}
            >
                  <div className="flex items-center justify-between p-6">
                        <BrandMark variant="wordmark" className="cursor-pointer" />
                        <button type="button" onClick={onClose} aria-label="بستن منوی اصلی" className="rounded-xl p-2 text-foreground hover:bg-accent-soft">
                              <HiX size={26} />
                        </button>
                  </div>

                  <nav className="mt-10 flex flex-col gap-6 px-8 text-lg">
                        {menuItems.map((item) => (
                              <Link
                                    key={item.id}
                                    href={item.link}
                                    onClick={onClose}
                                    className={`flex items-center gap-4 rounded-2xl p-4 text-lg ${
                                          typeof item.link === "object" ||
                                          (typeof item.link === "string" &&
                                                pathName &&
                                                (pathName === item.link || (pathName.startsWith(item.link) && item.link !== "/")))
                                                ? "bg-accent text-accent-foreground shadow-sm"
                                                : "text-foreground"
                                    } hover:bg-accent-soft hover:text-brand-primary`}
                              >
                                    {item.icon && typeof item.icon === "function" && <item.icon size={24} />}
                                    {item.label}
                              </Link>
                        ))}

                        <LandingAccountAction mobile onNavigate={onClose} />
                  </nav>
            </div>
      );
}
