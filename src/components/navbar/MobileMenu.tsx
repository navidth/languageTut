import { Button } from "flowbite-react";
import { HiX } from "react-icons/hi";
import { menuItems } from "@/lib/constants";
import Link from "next/link";


export default function MobileMenu({
      open,
      onClose,
      pathName
}: {
      open: boolean;
      onClose: () => void;
      pathName: string
}) {
      return (
            <div
                  className={`
        fixed inset-0 z-[999]
        bg-background
        backdrop-blur-xl
        transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}
        md:hidden
      `}
            >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6">
                        <Link href="/">
                              {/* <Image
                                     src="/favicon.svg"
                                     width={28}
                                     height={28}
                                     className="mr-3"
                                     alt="Logo"
                                   /> */}
                              <span
                                    className="
                                       self-center 
                                       whitespace-nowrap 
                                       text-xl 
                                       font-bold 
                                       text-foreground
                                     ">
                                    LOGO
                              </span>
                        </Link >
                        <HiX size={26} className="dark:text-foreground   " onClick={onClose} />
                  </div>

                  {/* Menu Items */}
                  <nav className="flex flex-col gap-6 px-8 mt-10 text-lg">
                        {menuItems.map((item) => (
                              <Link
                                    key={item.id}
                                    href={item.link}
                                    onClick={onClose}
                                    className={` flex p-4 rounded-2xl text-lg items-center gap-4 ${typeof item.link === "object" || typeof item.link === "string" && pathName && (pathName === item.link) || (pathName.startsWith(item.link) && item.link !== "/") ? "bg-primary" : "text-foreground"}  hover:bg-primary `}
                              >
                                    {item.icon && typeof item.icon === "function" && (
                                          <item.icon size={24} />
                                    )}
                                    {item.label}
                              </Link>
                        ))}

                        <Button color={"default"} className="mt-6 rounded-xl">
                              شروع یادگیری
                        </Button>
                  </nav>
            </div>
      );
}
