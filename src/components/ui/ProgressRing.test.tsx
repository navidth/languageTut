import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProgressRing from "./ProgressRing";

function arc(container: HTMLElement) {
  return container.querySelectorAll("circle")[1] ?? null;
}

describe("ProgressRing", () => {
  it("is an image named by its label, with the value in the middle", () => {
    render(
      <ProgressRing value={75} label="درصد: ۷۵٪" caption="درصد">
        ۷۵٪
      </ProgressRing>,
    );

    expect(screen.getByRole("img", { name: "درصد: ۷۵٪" })).toBeInTheDocument();
    expect(screen.getByText("۷۵٪")).toBeInTheDocument();
    expect(screen.getByText("درصد")).toBeInTheDocument();
  });

  it("draws the arc in proportion to the value and clamps it to 0–100", () => {
    const { container, rerender } = render(<ProgressRing value={50} label="نیمه" />);
    const half = arc(container)!;
    const circumference = Number(half.getAttribute("stroke-dasharray"));
    expect(Number(half.getAttribute("stroke-dashoffset"))).toBeCloseTo(circumference / 2);

    rerender(<ProgressRing value={140} label="پر" />);
    expect(Number(arc(container)!.getAttribute("stroke-dashoffset"))).toBeCloseTo(0);
  });

  it("draws only the track for an unknown or zero value", () => {
    const { container, rerender } = render(<ProgressRing value={null} label="نامشخص" />);
    expect(arc(container)).toBeNull();

    rerender(<ProgressRing value={0} label="صفر" />);
    expect(arc(container)).toBeNull();
  });
});
