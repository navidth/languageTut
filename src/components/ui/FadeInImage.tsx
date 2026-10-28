"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * `next/image` that fades in once its file has loaded, for images mounted
 * after hydration such as those inside dialogs. Server-rendered images should
 * use a blur placeholder instead, so they never depend on script to show.
 */
export default function FadeInImage({ alt, className = "", onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      alt={alt}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      className={`${className} transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        loaded ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    />
  );
}
