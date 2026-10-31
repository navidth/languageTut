"use client";

import { useRef, useState, type DragEvent } from "react";
import { HiDocument, HiUpload } from "react-icons/hi";
import { formatFileSize } from "@/lib/utils/files";

export type FileDropzoneProps = {
  /** Id of the file input; label it with `aria-labelledby` or a `<label htmlFor>`. */
  id: string;
  file: File | null;
  /** Called with the chosen or dropped file. */
  onFileChange: (file: File | null) => void;
  /** Passed to the input, e.g. ".pdf,.docx" or "image/*". */
  accept?: string;
  disabled?: boolean;
  invalid?: boolean;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  /** Prompt shown while no file is chosen. */
  placeholder?: string;
  /** Second line while no file is chosen. */
  hint?: string;
  className?: string;
};

/**
 * A file picker that also accepts drag and drop (Flowbite's FileInput is a
 * plain input). The real input stays in the page for keyboard and screen
 * reader users; the drop area is its label.
 */
export default function FileDropzone({
  id,
  file,
  onFileChange,
  accept,
  disabled = false,
  invalid = false,
  placeholder = "فایل را اینجا رها کنید یا برای انتخاب کلیک کنید",
  hint,
  className = "",
  ...aria
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  // Counts nested dragenter/dragleave pairs, so moving over the icon or the
  // text inside the area does not flicker the highlight.
  const dragDepth = useRef(0);

  function hasFiles(event: DragEvent) {
    return Array.from(event.dataTransfer.types).includes("Files");
  }

  function handleDragEnter(event: DragEvent<HTMLLabelElement>) {
    if (disabled || !hasFiles(event)) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    if (disabled || !hasFiles(event)) return;
    // Required for the drop event to fire.
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave() {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (!dropped) return;
    // A later pick of the same file through the dialog must still fire change.
    if (inputRef.current) inputRef.current.value = "";
    onFileChange(dropped);
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="peer sr-only"
        disabled={disabled}
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        aria-invalid={invalid || undefined}
        {...aria}
      />
      <label
        htmlFor={id}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-dragging={dragging || undefined}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors hover:border-brand-accent peer-focus-visible:border-brand-accent peer-focus-visible:ring-4 peer-focus-visible:ring-accent-soft peer-disabled:cursor-not-allowed peer-disabled:opacity-60 data-dragging:border-brand-accent data-dragging:bg-accent-soft ${
          invalid ? "border-destructive bg-destructive-soft/40" : "border-input bg-secondary-soft/30"
        }`}
      >
        {file ? (
          <HiDocument className="size-7 text-brand-accent" aria-hidden="true" />
        ) : (
          <HiUpload
            className={`size-7 text-brand-accent transition-transform ${dragging ? "-translate-y-1 scale-110" : ""}`}
            aria-hidden="true"
          />
        )}
        <span className="max-w-full truncate text-sm font-bold" dir="auto">
          {dragging ? "فایل را رها کنید" : file ? file.name : placeholder}
        </span>
        <span className="text-xs text-muted-foreground">
          {file ? `${formatFileSize(file.size)} · برای تغییر، فایل دیگری انتخاب کنید یا بکشید` : hint}
        </span>
      </label>
    </div>
  );
}
