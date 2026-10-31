"use client";

import AppSidebar from "@/components/dashboard/navbar/AppSidebar";
import NavbarMobile from "@/components/dashboard/navbar/NavbarMobile";
import { studentNavigation, studentProfileLink } from "@/constants/navigation";

/**
 * The student menu: a sidebar from the tablet width up (an icon rail below
 * lg), a floating dock on phones. Its icons are components, which a server
 * layout cannot pass to client components, so the menu is attached here.
 */
export default function StudentNavigation() {
  return (
    <>
      <AppSidebar entries={studentNavigation} footerLink={studentProfileLink} />
      <NavbarMobile entries={studentNavigation} />
    </>
  );
}
