import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import SegmentedControl from "./SegmentedControl";

const options = [
  { value: "day", label: "روز" },
  { value: "week", label: "هفته" },
  { value: "month", label: "ماه" },
] as const;

function Harness({ dir = "rtl" }: { dir?: "rtl" | "ltr" }) {
  const [value, setValue] = useState<"day" | "week" | "month">("day");
  return (
    <div dir={dir}>
      <SegmentedControl label="بازه زمانی" options={options} value={value} onChange={setValue} />
      <output>{value}</output>
    </div>
  );
}

describe("SegmentedControl", () => {
  it("is a radio group with the chosen segment checked and alone in the tab order", () => {
    render(<Harness />);

    expect(screen.getByRole("radiogroup", { name: "بازه زمانی" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "روز" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "روز" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "هفته" })).toHaveAttribute("tabindex", "-1");
  });

  it("selects with a click", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("radio", { name: "ماه" }));

    expect(screen.getByRole("radio", { name: "ماه" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("status")).toHaveTextContent("month");
  });

  it("moves with arrow keys mirrored for right-to-left, and wraps around", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("radio", { name: "روز" }));
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "هفته" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "هفته" })).toHaveAttribute("aria-checked", "true");

    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(screen.getByRole("radio", { name: "ماه" })).toHaveAttribute("aria-checked", "true");

    await user.keyboard("{Home}");
    expect(screen.getByRole("radio", { name: "روز" })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{End}");
    expect(screen.getByRole("radio", { name: "ماه" })).toHaveFocus();
  });

  it("keeps the usual arrow direction left to right", async () => {
    const user = userEvent.setup();
    render(<Harness dir="ltr" />);

    await user.click(screen.getByRole("radio", { name: "روز" }));
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("radio", { name: "هفته" })).toHaveAttribute("aria-checked", "true");
  });
});
