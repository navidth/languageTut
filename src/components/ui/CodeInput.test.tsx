import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import CodeInput from "@/components/ui/CodeInput";
import { normalizeCode } from "@/lib/utils/normalize";

function Harness({ onComplete }: { onComplete?: (code: string) => void }) {
  const [code, setCode] = useState("");
  return (
    <CodeInput
      aria-label="کد تأیید"
      value={code}
      onValueChange={setCode}
      completeLength={6}
      onComplete={onComplete}
    />
  );
}

describe("CodeInput", () => {
  it.each([
    ["۱۲۳۴۵۶", "123456"],
    ["١٢٣٤٥٦", "123456"],
    ["123 456", "123456"],
    ["12-34-56", "123456"],
    ["code: 4821", "4821"],
    ["1234567890", "12345678"],
  ])("normalizes %j to %j", (raw, expected) => {
    expect(normalizeCode(raw)).toBe(expected);
  });

  it("keeps Latin digits only as the visitor types or pastes", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText("کد تأیید");

    await user.type(input, "۱۲۳");
    expect(input).toHaveValue("123");

    await user.click(input);
    await user.paste(" ۴۵-۶");
    expect(input).toHaveValue("123456");
  });

  it("offers the code from the message and a numeric keyboard", () => {
    render(<Harness />);
    const input = screen.getByLabelText("کد تأیید");

    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("dir", "ltr");
  });

  it("reports a complete code once", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);

    await user.type(screen.getByLabelText("کد تأیید"), "1234567");

    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith("123456");
  });
});
