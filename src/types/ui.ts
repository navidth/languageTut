export type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

/** Colour of a progress or score ring. */
export type RingTone = "accent" | "success" | "warning" | "danger";

/** Semantic colour intent shared by status badges and notices. */
export type StatusTone = "neutral" | "info" | "warning" | "danger" | "success";

/** Loading and error state of a page section that loads on its own. */
export type SectionStatus = {
  loading: boolean;
  error: string | null;
  retry: () => void;
};
