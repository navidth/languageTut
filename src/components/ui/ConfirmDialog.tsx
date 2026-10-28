"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Modal, useModalContext } from "flowbite-react";
import { HiExclamation, HiQuestionMarkCircle } from "react-icons/hi";

type ConfirmTone = "danger" | "primary";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Shown on the confirm button while `loading`. */
  loadingLabel?: string;
  /** `danger` paints the confirm button red, for actions that cannot be undone. */
  tone?: ConfirmTone;
  /** Disables both buttons and keeps the dialog open while the action runs. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Flowbite's Modal with the site's surface, radius and backdrop. The dark
// variants are restated because Flowbite's own (gray) ones would otherwise
// survive the merge, and `h-auto` centres the dialog on phones too.
const confirmModalTheme = {
  root: {
    show: { on: "flex bg-brand-primary/60 backdrop-blur-[3px] dark:bg-black/70" },
  },
  content: {
    base: "relative h-auto w-full p-4",
    inner:
      "relative flex max-h-[90dvh] flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-[0_28px_80px_rgb(19_9_18/0.35)] dark:bg-card dark:shadow-[0_28px_80px_rgb(0_0_0/0.6)]",
  },
};

const toneStyles: Record<ConfirmTone, { icon: typeof HiExclamation; badge: string; button: string }> = {
  danger: {
    icon: HiExclamation,
    badge: "bg-destructive-soft text-destructive",
    button: "danger-button",
  },
  primary: {
    icon: HiQuestionMarkCircle,
    badge: "bg-accent-soft text-brand-secondary dark:text-brand-accent",
    button: "brand-button",
  },
};

/**
 * A yes/no question in a dialog, in place of `window.confirm`: it is styled,
 * right-to-left, keyboard friendly, and can show progress while the action
 * runs. Focus starts on the cancel button, so Enter never confirms by accident.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  loadingLabel = "در حال انجام...",
  tone = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const { icon: Icon, badge, button } = toneStyles[tone];

  return (
    <Modal
      show={open}
      size="md"
      dir="rtl"
      dismissible={!loading}
      initialFocus={cancelRef}
      theme={confirmModalTheme}
      onClose={() => {
        if (!loading) onCancel();
      }}
    >
      <DialogLabel titleId={titleId} />
      <div
        className="p-6 text-center sm:p-7"
        aria-describedby={description ? descriptionId : undefined}
      >
        <span className={`mx-auto grid size-14 place-items-center rounded-2xl ${badge}`}>
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <h2 id={titleId} className="mt-5 text-xl font-black text-foreground">
          {title}
        </h2>
        {description && (
          <div id={descriptionId} className="mt-2 text-sm leading-7 text-muted-foreground">
            {description}
          </div>
        )}
        {/* Confirm sits on the start side, which RTL readers reach first;
            it is on top when the buttons stack on phones. */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            disabled={loading}
            aria-busy={loading}
            onClick={onConfirm}
            className={`${button} inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-sm sm:min-w-32`}
          >
            {/* Drawn in the button's own colour; Flowbite's spinner is blue. */}
            {loading && (
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-current border-e-transparent"
              />
            )}
            {loading ? loadingLabel : confirmLabel}
          </button>
          <button
            ref={cancelRef}
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="ghost-button inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl px-6 text-sm sm:min-w-32"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/** Names the dialog after its title, as Flowbite's ModalHeader would. */
function DialogLabel({ titleId }: { titleId: string }) {
  const { setHeaderId } = useModalContext();
  useEffect(() => {
    setHeaderId(titleId);
    return () => setHeaderId(undefined);
  }, [setHeaderId, titleId]);
  return null;
}
