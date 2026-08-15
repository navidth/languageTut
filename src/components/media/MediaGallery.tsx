import { HiExternalLink, HiVideoCamera, HiVolumeUp } from "react-icons/hi";
import { BACKEND_BASE_URL } from "@/lib/apiClient";
import type { MediaAsset, MediaAssetObject, PlayableMedia, PlayableMediaKind } from "@/lib/media";

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
    // The URL has already been validated; the full string remains a useful hint.
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
      return [{
        id: `${url}-${index}`,
        kind,
        url,
        title: labels[kind],
      }];
    }

    const source = firstText(
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

type MediaGalleryProps = {
  media: MediaAsset[] | null | undefined;
  title?: string;
  description?: string;
  audioLabel?: string;
  videoLabel?: string;
  compact?: boolean;
  limit?: number;
  className?: string;
};

export default function MediaGallery({
  media,
  title = "رسانه‌ها",
  description,
  audioLabel = "فایل صوتی",
  videoLabel = "ویدئو",
  compact = false,
  limit,
  className = "",
}: MediaGalleryProps) {
  const allMedia = normalizeMediaAssets(media, { audio: audioLabel, video: videoLabel });
  const playableMedia = typeof limit === "number" ? allMedia.slice(0, limit) : allMedia;
  if (!playableMedia.length) return null;

  if (compact) {
    const item = playableMedia[0];
    return (
      <div className={`overflow-hidden border-b border-border bg-brand-primary ${className}`}>
        {item.kind === "video" ? (
          <video
            controls
            playsInline
            preload="none"
            poster={item.poster}
            className="aspect-video w-full bg-brand-primary object-contain"
            aria-label={item.title}
          >
            <source src={item.url} type={item.mimeType} />
            مرورگر شما پخش ویدئو را پشتیبانی نمی‌کند.
          </video>
        ) : (
          <div className="bg-gradient-to-br from-brand-primary to-brand-secondary px-5 py-6 text-white">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-bold">
                <HiVolumeUp className="size-5 text-brand-accent" aria-hidden="true" />
                {item.title}
              </span>
              {allMedia.length > 1 && (
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
                  +{(allMedia.length - 1).toLocaleString("fa-IR")} رسانه
                </span>
              )}
            </div>
            <audio controls preload="none" className="w-full" aria-label={item.title}>
              <source src={item.url} type={item.mimeType} />
              مرورگر شما پخش فایل صوتی را پشتیبانی نمی‌کند.
            </audio>
          </div>
        )}
      </div>
    );
  }

  const headingId = `media-gallery-${playableMedia.map((item) => item.id).join("-").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40)}`;

  return (
    <section className={`surface-card rounded-3xl p-5 sm:p-6 ${className}`} aria-labelledby={headingId}>
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-brand-accent">
          <HiVolumeUp className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h2 id={headingId} className="text-lg font-black">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>

      <div className="grid gap-4">
        {playableMedia.map((item, index) => {
          const displayTitle = playableMedia.length > 1
            ? `${item.title} ${(index + 1).toLocaleString("fa-IR")}`
            : item.title;

          return (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-border bg-secondary-soft/30">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  {item.kind === "video"
                    ? <HiVideoCamera className="size-5 shrink-0 text-brand-accent" aria-hidden="true" />
                    : <HiVolumeUp className="size-5 shrink-0 text-brand-accent" aria-hidden="true" />}
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold">{displayTitle}</h3>
                    {item.description && <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>}
                  </div>
                </div>
                <a href={item.url} target="_blank" rel="noreferrer" className="brand-link inline-flex shrink-0 items-center gap-1 text-xs" aria-label={`باز کردن ${displayTitle}`}>
                  باز کردن فایل
                  <HiExternalLink className="size-4" aria-hidden="true" />
                </a>
              </div>

              {item.kind === "video" ? (
                <video controls playsInline preload="metadata" poster={item.poster} className="aspect-video w-full bg-brand-primary object-contain" aria-label={displayTitle}>
                  <source src={item.url} type={item.mimeType} />
                  مرورگر شما پخش ویدئو را پشتیبانی نمی‌کند.
                </video>
              ) : (
                <div className="border-t border-border bg-card px-4 py-4">
                  <audio controls preload="metadata" className="w-full" aria-label={displayTitle}>
                    <source src={item.url} type={item.mimeType} />
                    مرورگر شما پخش فایل صوتی را پشتیبانی نمی‌کند.
                  </audio>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
