import { describe, expect, it } from "vitest";
import type { User } from "./auth";
import {
  resolveAuthFlow,
  resolvePostAuthenticationFlow,
} from "./authFlow";

const studentWithLevel: User = {
  id: 18,
  email: "new-student@example.com",
  full_name: "زبان‌آموز جدید",
  role: "student",
  current_level: "A1",
  date_joined: "2026-08-14T00:00:00Z",
};

describe("post-authentication flow", () => {
  it("sends an existing student with a level to the dashboard after login", () => {
    expect(resolveAuthFlow(studentWithLevel, "learning")).toEqual({
      type: "navigate",
      href: "/student",
    });
  });

  it("always sends a newly registered user to the placement section", () => {
    expect(
      resolvePostAuthenticationFlow(studentWithLevel, "learning", "signup"),
    ).toEqual({ type: "placement-section" });
  });

  it("lets a newly registered user choose to start the placement test", () => {
    expect(
      resolvePostAuthenticationFlow(studentWithLevel, "placement", "signup"),
    ).toEqual({ type: "placement-section" });
  });
});
