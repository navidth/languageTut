import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudentNavigation from "@/components/dashboard/navbar/StudentNavigation";

const navigation = vi.hoisted(() => ({ pathname: "/student" }));

vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

// The sidebar's menu comes first, the phone dock's second.
function menus() {
  const [sidebar, dock] = screen.getAllByRole("navigation", { name: "منوی پنل" });
  return { sidebar, dock };
}

describe("StudentNavigation", () => {
  beforeEach(() => {
    navigation.pathname = "/student";
  });

  it("opens the sidebar group that holds the current page", async () => {
    navigation.pathname = "/student/all-courses/18";
    render(<StudentNavigation />);
    const { sidebar } = menus();

    const courses = within(sidebar).getByRole("button", { name: "دوره‌ها" });
    expect(courses).toHaveAttribute("aria-expanded", "true");
    expect(within(sidebar).getByRole("link", { name: "همه دوره‌ها" })).toHaveAttribute("aria-current", "page");

    const practice = within(sidebar).getByRole("button", { name: "تمرین و آزمون" });
    expect(practice).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("panel-group-practice")).toHaveAttribute("inert");

    await userEvent.click(practice);
    expect(practice).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("panel-group-practice")).not.toHaveAttribute("inert");
  });

  it("keeps the profile apart at the foot of the sidebar", () => {
    navigation.pathname = "/student/profile";
    render(<StudentNavigation />);

    const profile = screen.getByRole("link", { name: "پروفایل من" });
    expect(profile).toHaveAttribute("aria-current", "page");
    expect(menus().sidebar).not.toContainElement(profile);
  });

  it("shows five entries in the phone dock and opens a group above it", async () => {
    render(<StudentNavigation />);
    const { dock } = menus();

    expect(within(dock).getAllByRole("link").length + within(dock).getAllByRole("button").length).toBe(5);
    expect(within(dock).getByRole("link", { name: "داشبورد" })).toHaveAttribute("aria-current", "page");

    const practice = within(dock).getByRole("button", { name: "تمرین و آزمون" });
    await userEvent.click(practice);

    const card = document.getElementById("dock-group-practice")!;
    expect(practice).toHaveAttribute("aria-expanded", "true");
    expect(card).not.toHaveAttribute("inert");
    expect(within(card).getByRole("link", { name: /تمرین‌های تستی/ })).toHaveAttribute("href", "/student/tests");

    await userEvent.keyboard("{Escape}");
    expect(practice).toHaveAttribute("aria-expanded", "false");
    expect(card).toHaveAttribute("inert");
    expect(practice).toHaveFocus();
  });

  it("closes the dock's group card on a tap outside it", async () => {
    render(<StudentNavigation />);
    const practice = within(menus().dock).getByRole("button", { name: "تمرین و آزمون" });

    await userEvent.click(practice);
    await userEvent.click(document.body);

    expect(practice).toHaveAttribute("aria-expanded", "false");
  });
});
