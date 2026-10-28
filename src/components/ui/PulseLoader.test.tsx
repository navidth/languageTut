import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PulseLoader, { LoadingContent } from "./PulseLoader";

describe("PulseLoader", () => {
  it("draws three dots and tells screen readers what is happening", () => {
    const { container } = render(<PulseLoader label="در حال بررسی" />);

    expect(screen.getByRole("status")).toHaveTextContent("در حال بررسی");
    expect(container.querySelectorAll(".pulse-dot")).toHaveLength(3);
    for (const dot of container.querySelectorAll(".pulse-dot")) {
      expect(dot).toHaveAttribute("aria-hidden", "true");
    }
  });
});

describe("LoadingContent", () => {
  it("shows the content while idle", () => {
    render(
      <button type="button">
        <LoadingContent loading={false} label="در حال بررسی">
          شروع یادگیری
        </LoadingContent>
      </button>,
    );

    expect(screen.getByRole("button", { name: "شروع یادگیری" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps the content in place but hidden, and names the button after the wait", () => {
    render(
      <button type="button">
        <LoadingContent loading label="در حال بررسی">
          شروع یادگیری
        </LoadingContent>
      </button>,
    );

    const hidden = screen.getByText("شروع یادگیری");
    expect(hidden).toHaveClass("invisible");
    expect(screen.getByRole("status")).toHaveTextContent("در حال بررسی");
  });
});
