import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CourseLessonList from "@/components/courses/CourseLessonList";
import { renderWithStore } from "@/test/renderWithStore";
import type { Lesson } from "@/types/course";

const mocks = vi.hoisted(() => ({ lessons: vi.fn() }));

vi.mock("@/lib/services/coursesApi", () => ({
  coursesApi: { lessons: mocks.lessons },
}));

function lesson(id: number, title: string): Lesson {
  return {
    id,
    course: 16,
    skill: 1,
    skill_detail: { id: 1, name: "listening", order: 1 },
    title,
    content: "",
    audio_url: null,
    video_url: null,
    attachment_url: null,
    order: id,
    is_published: true,
  };
}

const firstPage = {
  count: 2,
  next: "http://api.test/api/courses/16/lessons/?page=2",
  previous: null,
  results: [lesson(1, "درس اول")],
};

describe("CourseLessonList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom has no layout, so scrolling to the heading is a no-op.
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("shows the server's first page without a request", () => {
    renderWithStore(<CourseLessonList courseId={16} initialLessons={firstPage} />);

    expect(screen.getByRole("heading", { name: "درس اول" })).toBeInTheDocument();
    expect(mocks.lessons).not.toHaveBeenCalled();
  });

  it("loads later pages through the store", async () => {
    mocks.lessons.mockResolvedValue({
      count: 2,
      next: null,
      previous: "http://api.test/api/courses/16/lessons/",
      results: [lesson(2, "درس دوم")],
    });
    renderWithStore(<CourseLessonList courseId={16} initialLessons={firstPage} />);

    await userEvent.click(screen.getByRole("button", { name: "صفحه ۲" }));

    expect(await screen.findByRole("heading", { name: "درس دوم" })).toBeInTheDocument();
    expect(mocks.lessons).toHaveBeenCalledWith(16, 2);
  });

  it("explains locked lessons", () => {
    renderWithStore(<CourseLessonList courseId={16} initialLessons={null} />);

    expect(screen.getByText("فهرست درس‌ها برای این حساب در دسترس نیست.")).toBeInTheDocument();
  });
});
