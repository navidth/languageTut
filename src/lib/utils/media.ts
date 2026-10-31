

function firstText(...values: unknown[]) {
  return values.find((value): value is string =>
    typeof value === "string" && value.trim().length > 0
  )?.trim();
}

function absoluteMediaUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;

  try {
    const url = new URL(value.trim(), `${BACKEND_BASE_URL.replace(/\/+$/, "")}/`);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function mediaKind(media: MediaAssetObject, url: string): PlayableMediaKind | undefined {
  if (firstText(media.audio_url, media.audio)) return "audio";
  if (firstText(media.video_url, media.video)) return "video";

  const hint = firstText(
    media.media_type,
    media.type,
    media.kind,
    media.media_kind,
    media.mime_type,
    media.content_type,
  )?.toLowerCase();

  if (hint && /(audio|voice|sound)/.test(hint)) return "audio";
  if (hint && /(video|movie|film)/.test(hint)) return "video";

  let pathname = url.toLowerCase();
  try {
    pathname = new URL(url).pathname.toLowerCase();
  } catch {
    // The URL was already validated; the full string is still a useful hint.
  }

  if (/\.(mp3|wav|m4a|aac|oga|ogg|opus|flac)$/.test(pathname)) return "audio";
  if (/\.(mp4|m4v|mov|webm|mkv|avi)$/.test(pathname)) return "video";
  return undefined;
}

function playableMimeType(...values: unknown[]) {
  const mimeType = firstText(...values)?.toLowerCase();
  return mimeType && /^(audio|video)\/[a-z0-9.+-]+$/.test(mimeType)
    ? mimeType
    : undefined;
}

export function normalizeMediaAssets(
  mediaItems: MediaAsset[] | null | undefined,
  labels: { audio: string; video: string } = {
    audio: "فایل صوتی",
    video: "ویدئو",
  },
): PlayableMedia[] {
  if (!Array.isArray(mediaItems)) return [];

  return mediaItems.flatMap((media, index) => {
    if (typeof media === "string") {
      const url = absoluteMediaUrl(media);
      if (!url) return [];
      const kind = mediaKind({}, url);
      if (!kind) return [];
      return [{ id: `${url}-${index}`, kind, url, title: labels[kind] }];
    }

    const source = firstText(
      media.stream_url,
      media.video_url,
      media.audio_url,
      media.video,
      media.audio,
      media.file_url,
      media.media_url,
      media.media_file,
      media.url,
      media.file,
      media.src,
    );
    const url = absoluteMediaUrl(source);
    if (!url) return [];

    const kind = mediaKind(media, url);
    if (!kind) return [];

    const title = firstText(media.title, media.caption, media.name) ?? labels[kind];
    const poster = absoluteMediaUrl(firstText(
      media.poster_url,
      media.poster,
      media.thumbnail_url,
      media.thumbnail,
    ));

    return [{
      id: String(media.id ?? `${url}-${index}`),
      kind,
      url,
      title,
      description: firstText(media.description),
      mimeType: playableMimeType(media.mime_type, media.content_type),
      poster,
    }];
  });
}
import { BACKEND_BASE_URL } from "@/constants/api";
import type { MediaAssetObject, PlayableMediaKind, MediaAsset, PlayableMedia } from "@/types/media";
