"use client";

import { useId, useRef, useState } from "react";
import { HiDownload, HiPaperClip } from "react-icons/hi";
import {
  hasActiveSession,
  useSessionState,
} from "@/components/auth/useSessionState";
import { normalizeApiError } from "@/lib/apiErrors";
import { formatFileSize, saveBlob } from "@/lib/files";
import { homeworkApi, type HomeworkAttachment } from "@/lib/homeworkApi";

/** Files the teacher handed out with the assignment. */
export default function HomeworkAttachments({
  attachments,
}: {
  attachments: HomeworkAttachment[];
}) {
  const headingId = useId();
  const session = useSessionState();
  const signedIn = hasActiveSession(session);
  const inFlight = useRef(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  if (!attachments.length) return null;

  async function download(attachment: HomeworkAttachment) {
    // One download at a time, so double clicks do not fetch the file twice.
    if (inFlight.current) return;
    inFlight.current = true;
    setDownloadingId(attachment.id);
    setError("");
    try {
      const { blob, fileName } = await homeworkApi.downloadAttachment(attachment.id);
      saveBlob(blob, fileName || attachment.file_name || `attachment-${attachment.id}`);
    } catch (reason) {
      setError(
        normalizeApiError(reason, "دانلود فایل ناموفق بود. دوباره تلاش کنید.").message,
      );
    } finally {
      inFlight.current = false;
      setDownloadingId(null);
    }
  }

  return (
    <section className="surface-card mt-6 rounded-3xl p-6" aria-labelledby={headingId}>
      <h2 id={headingId} className="text-xl font-black">
        فایل‌های پیوست
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {signedIn
          ? "فایل‌هایی که مدرس برای این تکلیف قرار داده است."
          : "برای دانلود فایل‌های پیوست، وارد حساب کاربری خود شوید."}
      </p>

      {error && (
        <p className="feedback-error mt-4 rounded-2xl p-4 text-sm" role="alert">
          {error}
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {attachments.map((attachment) => {
          const title = attachment.title?.trim() || attachment.file_name || "فایل پیوست";
          const downloading = downloadingId === attachment.id;
          return (
            <li
              key={attachment.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-secondary-soft/40 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-brand-accent">
                  <HiPaperClip className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold" dir="auto">{title}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground" dir="auto">
                    {[
                      attachment.file_name !== title ? attachment.file_name : null,
                      formatFileSize(attachment.file_size),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
              {signedIn && (
                <button
                  type="button"
                  disabled={downloadingId !== null}
                  aria-busy={downloading}
                  aria-label={`دانلود ${title}`}
                  onClick={() => void download(attachment)}
                  className="ghost-button inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
                >
                  <HiDownload className="size-4" aria-hidden="true" />
                  {downloading ? "در حال دانلود..." : "دانلود"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
