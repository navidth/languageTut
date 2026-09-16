import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CourseGrid from "./CourseGrid";
import { normalizeMediaAssets } from "@/components/media/MediaGallery";
import type { Course } from "@/lib/courses";

const course: Course = {
  id: 16,
  title: "دوره جامع آیلتس",
  level: 4,
  level_detail: { id: 4, code: "B2", title: "CEFR B2", order: 4 },
  course_type: "ielts",
  description: "آمادگی هر چهار مهارت آیلتس",
  price: 90000,
  is_free: false,
  has_access: false,
  media: [{
    id: 8,
    media_type: "audio",
    file: "/media/courses/intro.mp3",
    title: "معرفی صوتی دوره",
    mime_type: "audio/mpeg",
  }],
  is_recommended: true,
  recommendation_order: 2,
  is_active: true,
  deleted_at: null,
  lessons_count: 12,
  resources_count: 3,
  created_at: "2026-08-10T18:44:09Z",
  updated_at: "2026-08-15T19:49:43Z",
};

describe("CourseGrid", () => {
  it("recognizes authenticated course stream URLs from the current API", () => {
    expect(normalizeMediaAssets([{
      id: 1,
      course: 15,
      media_type: "video",
      title: "file 1",
      file_name: "lesson.mp4",
      stream_url: "http://2.144.27.2:8000/api/course-media/1/stream/",
      order: 1,
    }])).toEqual([
      expect.objectContaining({
        id: "1",
        kind: "video",
        title: "file 1",
        url: "http://2.144.27.2:8000/api/course-media/1/stream/",
      }),
    ]);
  });

  it("shows course metadata, pricing and access without embedding media players", () => {
    const { container } = render(<CourseGrid initialCourses={[course]} />);

    expect(screen.getByRole("heading", { name: course.title })).toBeInTheDocument();
    expect(screen.getByText("آیلتس")).toBeInTheDocument();
    expect(screen.getByText("پیشنهادی")).toBeInTheDocument();
    expect(screen.getByText("۱۲")).toBeInTheDocument();
    expect(screen.getByText("۳")).toBeInTheDocument();
    expect(screen.getByText("۹۰٬۰۰۰ تومان")).toBeInTheDocument();
    expect(screen.getByText("نیاز به تهیه دوره")).toBeInTheDocument();
    expect(screen.queryByLabelText("معرفی صوتی دوره")).not.toBeInTheDocument();
    expect(container.querySelector("audio, video")).not.toBeInTheDocument();
  });
});
