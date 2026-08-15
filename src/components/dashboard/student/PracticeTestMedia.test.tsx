import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PracticeTestMedia, { normalizePracticeTestMedia } from "./PracticeTestMedia";

describe("PracticeTestMedia", () => {
  it("renders playable audio and video from API media objects", () => {
    const { container } = render(
      <PracticeTestMedia
        media={[
          {
            id: 1,
            media_type: "audio",
            file: "/media/tests/listening.mp3",
            title: "فایل شنیداری",
            mime_type: "audio/mpeg",
          },
          {
            id: 2,
            type: "video",
            file_url: "https://cdn.example.com/tests/instructions.mp4",
            title: "راهنمای ویدئویی",
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "رسانه‌های آزمون" })).toBeInTheDocument();
    expect(screen.getByLabelText("فایل شنیداری ۱")).toBeInTheDocument();
    expect(screen.getByLabelText("راهنمای ویدئویی ۲")).toBeInTheDocument();

    const sources = container.querySelectorAll("source");
    expect(sources[0]).toHaveAttribute(
      "src",
      "http://2.144.27.2:8000/media/tests/listening.mp3",
    );
    expect(sources[0]).toHaveAttribute("type", "audio/mpeg");
    expect(sources[1]).toHaveAttribute(
      "src",
      "https://cdn.example.com/tests/instructions.mp4",
    );
  });

  it("detects direct media URLs and ignores unsupported attachments", () => {
    const normalized = normalizePracticeTestMedia([
      "https://cdn.example.com/audio/question.ogg",
      { file: "/media/handout.pdf", media_type: "document" },
      { video_url: "/media/video/prompt.webm", content_type: "video" },
    ]);

    expect(normalized).toEqual([
      expect.objectContaining({ kind: "audio", title: "فایل صوتی آزمون" }),
      expect.objectContaining({ kind: "video", title: "ویدئوی آزمون", mimeType: undefined }),
    ]);
  });

  it("renders nothing when the API has no playable media", () => {
    const { container } = render(<PracticeTestMedia media={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
