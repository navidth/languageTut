import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ConfirmDialog from "./ConfirmDialog";

function renderDialog(props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) {
  const handlers = { onConfirm: vi.fn(), onCancel: vi.fn() };
  render(
    <ConfirmDialog
      open
      tone="danger"
      title="حذف مهارت"
      description="این کار برگشت‌پذیر نیست."
      confirmLabel="بله، حذف شود"
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

describe("ConfirmDialog", () => {
  it("is a dialog named by its title, with focus on the safe choice", async () => {
    renderDialog();

    expect(screen.getByRole("dialog", { name: "حذف مهارت" })).toBeInTheDocument();
    expect(screen.getByText("این کار برگشت‌پذیر نیست.")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "انصراف" })).toHaveFocus());
  });

  it("reports the choice", async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderDialog();

    await user.click(screen.getByRole("button", { name: "بله، حذف شود" }));
    expect(onConfirm).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "انصراف" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("cancels with Escape", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog();

    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("locks itself while the action runs", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog({ loading: true, loadingLabel: "در حال حذف..." });

    expect(screen.getByRole("button", { name: "در حال حذف..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "انصراف" })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("renders nothing while closed", () => {
    renderDialog({ open: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
