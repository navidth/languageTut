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
}: {
  media: PracticeTestMediaValue[] | undefined;
}) {
  return (
    <MediaGallery
      media={media}
      title="رسانه‌های آزمون"
      description="پیش از پاسخ‌دادن، فایل‌های صوتی یا ویدئویی را پخش کنید."
      audioLabel="فایل صوتی آزمون"
      videoLabel="ویدئوی آزمون"
      className="mb-5"
    />
  );
}
