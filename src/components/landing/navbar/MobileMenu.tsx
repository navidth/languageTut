import AuthModalButton from "@/components/auth/AuthModalButton";
import { menuItems } from "@/lib/constants";
import Link from "next/link";
import { HiX } from "react-icons/hi";

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
                  className={`
                        fixed inset-0 z-[999] bg-background backdrop-blur-xl transition-transform duration-300
                        ${open ? "translate-x-0" : "translate-x-full"}
                        md:hidden
                  `}
            >
                  <div className="flex items-center justify-between p-6">
                        <Link href="/" onClick={onClose}>
                              <span className="self-center whitespace-nowrap text-xl font-bold text-foreground">
                                    LOGO
                              </span>
                        </Link>
                        <HiX size={26} className="cursor-pointer dark:text-foreground" onClick={onClose} />
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
                                                ? "bg-primary"
                                                : "text-foreground"
                                    } hover:bg-primary`}
                              >
                                    {item.icon && typeof item.icon === "function" && <item.icon size={24} />}
                                    {item.label}
                              </Link>
                        ))}

                        <AuthModalButton color="default" className="mt-6 rounded-xl" onOpened={onClose}>
                               شروع یادگیری
                        </AuthModalButton>
                  </nav>
            </div>
      );
}
