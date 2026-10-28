"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BiLogOut } from "react-icons/bi";
import { BsPersonCircle } from "react-icons/bs";
import { HiChevronDown } from "react-icons/hi";
import { hasStoredSession } from "@/lib/apiClient";
import { loadMe, signOut } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import HeaderMenu, {
  headerMenuItemClassName,
  headerMenuPanelClassName,
  headerMenuTitleClassName,
} from "./HeaderMenu";

const triggerClassName =
  "relative flex h-10 w-fit items-center justify-center rounded-xl border border-border !bg-popover px-5 text-center text-sm font-medium !text-popover-foreground shadow-[var(--shadow-brand-md)] hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700";

function UserDropdown() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (hasStoredSession() && status !== "authenticated" && status !== "loading") {
      void dispatch(loadMe());
    }
  }, [dispatch, status]);

  const handleLogout = () => {
    void dispatch(signOut());
    router.push("/");
  };

  const profilePath = user?.role === "teacher" ? "/teacher" : "/student/profile";
  const displayName = user?.full_name ?? "کاربر مهمان";

  return (
    <HeaderMenu
      id="dashboard-user-menu"
      ariaLabel="منوی کاربر"
      triggerClassName={triggerClassName}
      // The menu opens from the header's left edge, so it may use the full width.
      menuClassName={`${headerMenuPanelClassName} max-w-[calc(100vw-2rem)]`}
      label={
        <>
          <span className="flex items-center gap-2 rounded-xl text-foreground">
            <BsPersonCircle className="h-5 w-5 text-brand-secondary dark:text-brand-accent" aria-hidden="true" />
            {/* Phones show only the avatar; the menu header names the user. */}
            <span className="hidden max-w-40 truncate sm:inline">{displayName}</span>
          </span>
          <HiChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
        </>
      }
    >
      <div className="py-1">
        {user && (
          <div className={headerMenuTitleClassName}>
            <span className="block text-sm">{user.full_name}</span>
            <span className="block truncate text-sm font-medium">{user.email}</span>
          </div>
        )}
        <ul role="none">
          {user && (
            <li role="none">
              <Link
                role="menuitem"
                tabIndex={-1}
                href={profilePath}
                className={`${headerMenuItemClassName} flex items-center justify-start gap-2 text-gray-700 hover:!bg-accent-soft hover:!text-brand-primary`}
              >
                <BsPersonCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                جزئیات پروفایل
              </Link>
            </li>
          )}
          <li role="none">
            {user ? (
              <button
                role="menuitem"
                tabIndex={-1}
                type="button"
                onClick={handleLogout}
                className={`${headerMenuItemClassName} flex items-center justify-start gap-2 text-destructive hover:!bg-destructive-soft`}
              >
                <BiLogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                خروج
              </button>
            ) : (
              <Link
                role="menuitem"
                tabIndex={-1}
                href="/"
                className={`${headerMenuItemClassName} flex items-center justify-start gap-2 text-gray-700 hover:!bg-accent-soft`}
              >
                ورود
              </Link>
            )}
          </li>
        </ul>
      </div>
    </HeaderMenu>
  );
}

export default UserDropdown;
