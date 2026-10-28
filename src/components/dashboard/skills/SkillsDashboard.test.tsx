import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { skillLabels } from "@/lib/skillPresentation";
import { renderWithStore, testStudent } from "@/test/renderWithStore";
import SkillsDashboard from "./SkillsDashboard";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/lib/skills", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/skills")>();
  return { ...actual, skillsApi: { ...actual.skillsApi, list: mocks.list, remove: mocks.remove } };
});

const teacher = { ...testStudent, id: 3, role: "teacher" as const };
const listening = { id: 11, name: "listening", order: 1 };

describe("SkillsDashboard delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.list.mockResolvedValue({ count: 1, next: null, previous: null, results: [listening] });
    mocks.remove.mockResolvedValue(undefined);
    window.confirm = vi.fn(() => true);
  });

  it("asks in a dialog, not the browser's confirm box, and deletes only when confirmed", async () => {
    const user = userEvent.setup();
    renderWithStore(<SkillsDashboard />, { user: teacher });

    await user.click(await screen.findByRole("button", { name: /حذف/ }));
    const dialog = await screen.findByRole("dialog", { name: "حذف مهارت" });
    expect(window.confirm).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "انصراف" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(mocks.remove).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /حذف/ }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "بله، حذف شود" }));

    await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith(11));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("does not offer deletion to students", async () => {
    renderWithStore(<SkillsDashboard />, { user: testStudent });

    expect((await screen.findAllByText(skillLabels.listening)).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /حذف/ })).not.toBeInTheDocument();
  });
});
