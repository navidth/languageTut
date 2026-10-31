"use client";

import { Button } from "flowbite-react";
import { LoadingContent } from "@/components/ui/PulseLoader";
import type { AuthIntent } from "@/types/auth";
import { useAuthFlow } from "@/components/auth/AuthFlowProvider";

type Props = {
  children?: React.ReactNode;
  className?: string;
  color?: string;
  pill?: boolean;
  fullWidth?: boolean;
  intent?: AuthIntent;
  onOpened?: () => void;
};

export default function AuthModalButton({
  children = "ورود",
  className,
  color,
  pill = true,
  fullWidth,
  intent = "learning",
  onOpened,
}: Props) {
  const { startAuthFlow, busy } = useAuthFlow();

  return (
    <Button
      color={color}
      pill={pill}
      // `font-bold` replaces the theme's `font-medium`, which otherwise
      // outranks the weight set by `.brand-button`.
      className={`${color === "light" ? "brand-button-inverse" : "brand-button"} max-[370px]:text-xs max-[370px]:p-4 max-[370px]:whitespace-nowrap! font-semibold cursor-pointer ${className ?? ""}`}
      fullSized={fullWidth}
      disabled={busy}
      aria-busy={busy}
      onClick={() => {
        onOpened?.();
        void startAuthFlow(intent);
      }}
    >
      <LoadingContent loading={busy} label="در حال بررسی">
        {children}
      </LoadingContent>
    </Button>
  );
}
