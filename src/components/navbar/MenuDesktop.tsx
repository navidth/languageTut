import { menuItems } from '@/lib/constants'
import Link from 'next/link'

const MenuDesktop = ({ pathName }: { pathName: string }) => {
      return (
            <div dir="rtl" className="md:flex hidden flex-row gap-6 text-base">
                  {menuItems.map((item) => (
                        <Link
                              key={item.id}
                              href={item.link}
                              className={`flex items-center gap-1 ${typeof item.link === "object" || typeof item.link === "string" && pathName && (pathName === item.link) || (pathName.startsWith(item.link) && item.link !== "/") ? " text-blue-600 border-b-2 dark:text-primary" : "text-foreground dark:text-zinc-800"}  hover:text-primary`}
                        >
                              {item.icon && typeof item.icon === "function" && (
                                    <item.icon />
                              )}
                              {item.label}
                        </Link>
                  ))}
            </div>
      )
}

export default MenuDesktop