import { describe, expect, it } from "vitest";
import { studentNavigation } from "@/constants/navigation";
import { isPanelEntryActive, isPanelGroup, isPanelLinkActive } from "@/lib/utils/navigation";

describe("panel navigation", () => {
  it("marks a page and the pages under it", () => {
    const tests = { link: "/student/tests" };

    expect(isPanelLinkActive(tests, "/student/tests")).toBe(true);
    expect(isPanelLinkActive(tests, "/student/tests/51/result")).toBe(true);
    expect(isPanelLinkActive(tests, "/student/tests-archive")).toBe(false);
  });

  it("marks the dashboard only on its own path", () => {
    const dashboard = { link: "/student", exact: true };

    expect(isPanelLinkActive(dashboard, "/student")).toBe(true);
    expect(isPanelLinkActive(dashboard, "/student/tests")).toBe(false);
  });

  it("marks the group that holds the current page", () => {
    const active = studentNavigation.filter((entry) => isPanelEntryActive(entry, "/student/all-courses/18"));

    expect(active.map((entry) => entry.id)).toEqual(["courses"]);
  });

  it("keeps every student page reachable from the menu exactly once", () => {
    const links = studentNavigation.flatMap((entry) => (isPanelGroup(entry) ? entry.links : [entry]));
    const paths = links.map((link) => link.link);

    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual(expect.arrayContaining([
      "/student", "/student/courses", "/student/all-courses", "/student/lessons", "/student/tests",
      "/student/questions", "/student/skills", "/student/homework", "/student/placement-test", "/student/levels",
    ]));
  });
});
