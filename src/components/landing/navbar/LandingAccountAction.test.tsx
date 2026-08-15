import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LandingAccountAction from "./LandingAccountAction";

type MockAuthState = {
  status: "idle" | "authenticated";
  user: null | {
    id: number;
    email: string;
    full_name: string;
    role: "student" | "teacher" | "admin";
    date_joined: string;
  };
};

let authState: MockAuthState;

vi.mock("@/store/hooks", () => ({
  useAppSelector: (selector: (state: { auth: MockAuthState }) => unknown) =>
    selector({ auth: authState }),
}));

vi.mock("@/components/auth/AuthModalButton", () => ({
  default: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

describe("LandingAccountAction", () => {
  beforeEach(() => {
    authState = { status: "idle", user: null };
  });

  it("shows the learning action for a guest", () => {
    render(<LandingAccountAction />);

    expect(screen.getByRole("button", { name: "شروع یادگیری" })).toBeInTheDocument();
  });

  it("shows the user name and translated role after authentication", () => {
    authState = {
      status: "authenticated",
      user: {
        id: 7,
        email: "teacher@example.com",
        full_name: "سارا احمدی",
        role: "teacher",
        date_joined: "2026-08-15",
      },
    };

    render(<LandingAccountAction />);

    expect(screen.getByText("سارا احمدی")).toBeInTheDocument();
    expect(screen.getByText("نقش: مدرس")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/teacher");
  });
});
