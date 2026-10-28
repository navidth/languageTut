import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import OtpInput from "./OtpInput";

function Harness({ onComplete, invalid = false }: { onComplete?: (code: string) => void; invalid?: boolean }) {
  const [code, setCode] = useState("");
  return (
    <>
      <label htmlFor="otp">کد بازیابی</label>
      <OtpInput id="otp" length={6} value={code} onValueChange={setCode} onComplete={onComplete} invalid={invalid} />
      <output>{code}</output>
    </>
  );
}

function slots(container: HTMLElement) {
  return [...container.querySelectorAll("[data-input-otp-container] > div:not(:last-child)")];
}

describe("OtpInput", () => {
  it("draws one box per digit, left to right, behind a single labelled input", () => {
    const { container } = render(<Harness />);

    const input = screen.getByLabelText("کد بازیابی");
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input.closest("[dir]")).toHaveAttribute("dir", "ltr");
    expect(slots(container)).toHaveLength(6);
  });

  it("fills the boxes in order and takes Persian digits", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);

    await user.type(screen.getByLabelText("کد بازیابی"), "۱۲3");

    expect(screen.getByRole("status")).toHaveTextContent("123");
    expect(slots(container).map((slot) => slot.textContent)).toEqual(["1", "2", "3", "", "", ""]);
  });

  it("ignores letters", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText("کد بازیابی"), "1a2");

    expect(screen.getByRole("status")).toHaveTextContent("12");
  });

  it("keeps every digit of a pasted code with spaces or dashes, and reports it complete", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);

    await user.click(screen.getByLabelText("کد بازیابی"));
    await user.paste("۱۲۳-۴۵۶");

    expect(screen.getByRole("status")).toHaveTextContent("123456");
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("marks the input invalid for assistive technology", () => {
    render(<Harness invalid />);

    expect(screen.getByLabelText("کد بازیابی")).toHaveAttribute("aria-invalid", "true");
  });
});
