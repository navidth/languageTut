import Link from "next/link";
import { Dropdown, DropdownHeader, DropdownItem } from "flowbite-react";
import { BiLogOut } from "react-icons/bi";
import { BsPersonCircle } from "react-icons/bs";
import NotificationDropdown from "@/components/ui/NotificationDropdown";
import UserDropdown from "@/components/ui/UserDropdown";

const AppHeader = () => {

      return (
            <div className="sticky top-0 z-50 w-full min-h-10 bg-secondary/10 border-b border-secondary/90 flex items-center justify-end py-3 px-3">
                  <div className="flex items-center sm:flex-row-reverse flex-row sm:justify-start justify-between w-full gap-4">
                        <UserDropdown />
                        <NotificationDropdown />
                  </div>
            </div>
      );
};

export default AppHeader;
