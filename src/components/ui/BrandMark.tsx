import Image from "next/image";
import Link from "next/link";

type BrandVariant = "primary" | "wordmark" | "icon";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
  inverse?: boolean;
  variant?: BrandVariant;
};

const brandAssets: Record<BrandVariant, { src: string; width: number; height: number; className: string }> = {
  primary: { src: "/brand-logo.png", width: 536, height: 306, className: "h-14 sm:h-16" },
  wordmark: { src: "/brand-wordmark.png", width: 344, height: 66, className: "h-7 sm:h-8" },
  icon: { src: "/brand-icon.png", width: 92, height: 222, className: "h-10" },
};

export default function BrandMark({
  className = "",
  compact = false,
  inverse = false,
  variant = "primary",
}: BrandMarkProps) {
  const resolvedVariant = compact ? "icon" : variant;
  const asset = brandAssets[resolvedVariant];

  return (
    <Link
      href="/"
      aria-label="ExamificatioN — صفحه اصلی"
      className={`inline-flex items-center ${inverse ? "on-dark" : ""} ${className}`}
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
