import { render, screen } from "@testing-library/react";
import { HiCollection } from "react-icons/hi";
import { describe, expect, it } from "vitest";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("shows a heading at the requested level, the description and the action", () => {
    render(
      <EmptyState
        icon={HiCollection}
        headingLevel="h3"
        title="هنوز درسی منتشر نشده است"
        description="درس‌ها به‌زودی اضافه می‌شوند."
        action={<button type="button">بازگشت</button>}
      />,
    );

    expect(screen.getByRole("heading", { level: 3, name: "هنوز درسی منتشر نشده است" })).toBeInTheDocument();
    expect(screen.getByText("درس‌ها به‌زودی اضافه می‌شوند.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "بازگشت" })).toBeInTheDocument();
  });

  it("leaves out the parts it is not given", () => {
    const { container } = render(<EmptyState title="خالی" />);

    expect(screen.getByRole("heading", { level: 2, name: "خالی" })).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
