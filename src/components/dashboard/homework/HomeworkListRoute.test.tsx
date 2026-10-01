import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildHomework, buildPage } from "@/test/fixtures";
import { renderWithStore } from "@/test/renderWithStore";
import HomeworkListRoute from "./HomeworkListRoute";

const homeworkMocks = vi.hoisted(() => ({ list: vi.fn() }));
const navigation = vi.hoisted(() => ({ query: "" }));

vi.mock("@/lib/homeworkApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/homeworkApi")>()),
  homeworkApi: homeworkMocks,
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.query),
}));

describe("HomeworkListRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    homeworkMocks.list.mockResolvedValue(buildPage([buildHomework()]));
  });

  it("seeds the list filters from the URL query", async () => {
    navigation.query = "course=15&scope=lesson&page=2";
    renderWithStore(<HomeworkListRoute />);

    await screen.findByRole("heading", { name: "Final assignment" });
    expect(homeworkMocks.list).toHaveBeenCalledWith({
      page: 2,
      course: 15,
      scope: "lesson",
    });
    expect(screen.getByLabelText("نوع تکلیف")).toHaveValue("lesson");
    expect(screen.getByLabelText("دوره")).toHaveValue("15");
  });

  it("starts unfiltered when the query is missing or invalid", async () => {
    navigation.query = "course=abc&scope=everything&page=-4";
    renderWithStore(<HomeworkListRoute />);

    await waitFor(() =>
      expect(homeworkMocks.list).toHaveBeenCalledWith({
        page: 1,
        course: undefined,
        scope: undefined,
      }),
    );
    expect(screen.getByLabelText("نوع تکلیف")).toHaveValue("");
  });
});
