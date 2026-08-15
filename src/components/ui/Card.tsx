import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`surface-card rounded-2xl p-6 ${className}`}
      {...props}
    />
  );
}
