"use client";

import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

type RevealTag = "div" | "article" | "li" | "section" | "span" | "blockquote" | "figure";

type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: RevealTag;
  /** Milliseconds added before the entrance, to stagger siblings. */
  delay?: number;
  children: ReactNode;
};

/**
 * Fades and lifts its content in the first time it scrolls into view. The
 * styles live in globals.css under `[data-reveal]`.
 *
 * The server renders the content visible. Only after hydration are elements
 * still below the viewport hidden and observed, so nothing flashes, nothing
 * stays hidden without JavaScript, and content already on screen at load is
 * left alone. Reduced-motion users never see the animation.
 */
export default function Reveal({
  as = "div",
  delay = 0,
  className,
  style,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    element.dataset.reveal = "pending";

    const finish = (event: TransitionEvent) => {
      if (event.target !== element) return;
      element.removeEventListener("transitionend", finish);
      // Drops the transform and opacity rules, so hover effects and
      // backdrop blurs inside are not affected afterwards.
      element.dataset.reveal = "done";
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        element.addEventListener("transitionend", finish);
        element.dataset.reveal = "visible";
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      element.removeEventListener("transitionend", finish);
    };
  }, []);

  const mergedStyle = delay
    ? ({ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties)
    : style;

  // Typed as a div only to satisfy the ref type; the real tag is `as`.
  const Tag = as as "div";

  return (
    <Tag ref={ref} className={className} style={mergedStyle} {...rest}>
      {children}
    </Tag>
  );
}
