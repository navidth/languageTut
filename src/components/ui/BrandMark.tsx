import Image from "next/image";
import Link from "next/link";

type BrandVariant = "primary" | "wordmark" | "icon";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
  inverse?: boolean;
  variant?: BrandVariant;
  /**
   * Set to false where the home page is rarely visited next, such as the
   * dashboard, so its route and scripts are not fetched in the background.
   */
  prefetch?: boolean;
};

// `width` and `height` are the largest size each variant is drawn at, so the
// image optimizer serves files of about that size instead of the full source
// images (536×306, 344×66 and 92×222).
const brandAssets: Record<
  BrandVariant,
  { src: string; width: number; height: number; className: string }
> = {
  primary: {
    src: "/brand-logo.png",
    width: 112,
    height: 64,
    className: "h-14 sm:h-16",
  },
  wordmark: {
    src: "/brand-wordmark.png",
    width: 167,
    height: 32,
    className: "h-7 sm:h-8",
  },
  icon: { src: "/brand-icon.png", width: 20, height: 48, className: "h-12" },
};

export default function BrandMark({
  className = "",
  compact = false,
  inverse = false,
  variant = "primary",
  prefetch,
}: BrandMarkProps) {
  const resolvedVariant = compact ? "icon" : variant;
  const asset = brandAssets[resolvedVariant];
  // A caller that hides the logo (e.g. "hidden lg:inline-flex") sets the
  // display itself; adding inline-flex as well would override its "hidden".
  const display = /(^|\s)(hidden|flex|inline-flex)(\s|$)/.test(className)
    ? ""
    : "inline-flex";

  return (
    <Link
      href="/"
      prefetch={prefetch}
      aria-label="ExamificatioN — صفحه اصلی"
      className={`${display} shrink-0 items-center ${inverse ? "on-dark" : ""} ${className}`}
    >
      <Image
        src={asset.src}
        width={asset.width}
        height={asset.height}
        alt=""
        aria-hidden="true"
        className={`w-auto object-contain ${asset.className} ${inverse ? "brightness-0 invert" : ""}`}
      />
    </Link>
  );
}
