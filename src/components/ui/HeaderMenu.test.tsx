import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import HeaderMenu from "./HeaderMenu";

function renderMenu(dismissOnClick?: boolean) {
  return render(
    <div>
      <HeaderMenu
        id="test-menu"
        ariaLabel="منوی آزمایشی"
        label="باز کردن"
        triggerClassName=""
        menuClassName=""
        dismissOnClick={dismissOnClick}
      >
        <ul role="none">
          <li role="none">
            <button type="button" role="menuitem" tabIndex={-1}>
              اول
            </button>
          </li>
          <li role="none">
            <button type="button" role="menuitem" tabIndex={-1}>
              دوم
            </button>
          </li>
          <li role="none">
            <button type="button" role="menuitem" tabIndex={-1}>
              سوم
            </button>
          </li>
        </ul>
      </HeaderMenu>
      <p>بیرون از منو</p>
    </div>,
  );
}

describe("HeaderMenu", () => {
  it("opens below its trigger and closes on Escape, returning focus", async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole("button", { name: "منوی آزمایشی" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(trigger);
    const menu = screen.getByRole("menu", { name: "منوی آزمایشی" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", menu.id);
    expect(menu).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("moves through the items with the arrow, Home and End keys", async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole("button", { name: "منوی آزمایشی" });
    trigger.focus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "اول" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "دوم" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "سوم" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "اول" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "سوم" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: "اول" })).toHaveFocus();
  });

  it("closes when an item is chosen or the pointer goes elsewhere", async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole("button", { name: "منوی آزمایشی" });

    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "دوم" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(trigger);
    await user.click(screen.getByText("بیرون از منو"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("stays open after a click on an item when asked to", async () => {
    const user = userEvent.setup();
    renderMenu(false);

    await user.click(screen.getByRole("button", { name: "منوی آزمایشی" }));
    await user.click(screen.getByRole("menuitem", { name: "اول" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
});
