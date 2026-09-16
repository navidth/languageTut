import MediaGallery, { normalizeMediaAssets } from "@/components/media/MediaGallery";
import type { PracticeTestMedia as PracticeTestMediaValue } from "@/lib/studentApi";

export function normalizePracticeTestMedia(
  mediaItems: PracticeTestMediaValue[] | undefined,
) {
  return normalizeMediaAssets(mediaItems, {
    audio: "فایل صوتی آزمون",
    video: "ویدئوی آزمون",
  });
}

export default function PracticeTestMedia({
  media,
  title = "رسانه‌های آزمون",
  description = "پیش از پاسخ‌دادن، فایل‌های صوتی یا ویدئویی را پخش کنید.",
  className = "mb-5",
}: {
  media: PracticeTestMediaValue[] | undefined;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <MediaGallery
      media={media}
      title={title}
      description={description}
      audioLabel="فایل صوتی آزمون"
      videoLabel="ویدئوی آزمون"
      className={className}
    />
  );
}
