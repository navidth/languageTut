"use client";

import { Dropdown, DropdownHeader, DropdownItem } from "flowbite-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BiLogOut } from "react-icons/bi";
import { BsPersonCircle } from "react-icons/bs";
import { loadMe, logout } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function UserDropdown() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && status !== "authenticated" && status !== "loading") {
      void dispatch(loadMe());
    }
  }, [dispatch, status]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const profilePath = user?.role === "teacher" ? "/teacher" : "/student/profile";
  const displayName = user?.full_name ?? "کاربر مهمان";

  return (
    <Dropdown
      aria-label="منوی کاربر"
      dismissOnClick
      color="light"
      className="rounded-xl border border-border !bg-popover !text-popover-foreground shadow-[var(--shadow-brand-md)]"
      label={
        <span className="flex items-center gap-2 rounded-xl text-foreground">
          <BsPersonCircle className="h-5 w-5 text-brand-secondary dark:text-brand-accent" />
          <span>{displayName}</span>
        </span>
      }
    >
      {user && (
        <DropdownHeader className="border-b border-border bg-secondary-soft text-foreground">
          <span className="block text-sm">{user.full_name}</span>
          <span className="block truncate text-sm font-medium">{user.email}</span>
        </DropdownHeader>
      )}

      {user && (
        <DropdownItem as={Link} href={profilePath} icon={BsPersonCircle} className="flex items-center justify-start gap-2 hover:!bg-accent-soft hover:!text-brand-primary">
          جزئیات پروفایل
        </DropdownItem>
      )}

      {user ? (
        <DropdownItem icon={BiLogOut} onClick={handleLogout} className="flex items-center justify-start gap-2 text-destructive hover:!bg-destructive-soft">
          خروج
        </DropdownItem>
      ) : (
        <DropdownItem as={Link} href="/" className="flex items-center justify-start gap-2 hover:!bg-accent-soft">
          ورود
        </DropdownItem>
      )}
    </Dropdown>
  );
}

export default UserDropdown;
