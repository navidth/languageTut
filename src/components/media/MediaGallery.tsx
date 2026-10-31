import { useId, useMemo } from "react";
import { HiExternalLink, HiVideoCamera, HiVolumeUp } from "react-icons/hi";
import { normalizeMediaAssets } from "@/lib/utils/media";
import { type MediaAsset } from "@/types/media";

export { normalizeMediaAssets } from "@/lib/utils/media";

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
  const allMedia = useMemo(
    () => normalizeMediaAssets(media, { audio: audioLabel, video: videoLabel }),
    [audioLabel, media, videoLabel],
  );
  const playableMedia = typeof limit === "number" ? allMedia.slice(0, limit) : allMedia;
  const headingId = useId();
  if (!playableMedia.length) return null;

  if (compact) {
    const item = playableMedia[0];
    return (
      <div className={`overflow-hidden border-b border-border bg-brand-primary ${className}`}>
        {item.kind === "video" ? (
          <video
            controls
            playsInline
            preload="metadata"
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
            <audio controls preload="metadata" className="w-full" aria-label={item.title}>
              <source src={item.url} type={item.mimeType} />
              مرورگر شما پخش فایل صوتی را پشتیبانی نمی‌کند.
            </audio>
          </div>
        )}
      </div>
    );
  }

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
