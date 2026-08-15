"use client";

import { Button } from "flowbite-react";
import type { AuthIntent } from "@/lib/authFlow";
import { useAuthFlow } from "./AuthFlowProvider";

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
      className={`${color === "light" ? "brand-button-inverse" : "brand-button"} ${className ?? ""}`}
      fullSized={fullWidth}
      disabled={busy}
      aria-busy={busy}
      onClick={() => {
        onOpened?.();
        void startAuthFlow(intent);
      }}
    >
      {busy ? "در حال بررسی..." : children}
    </Button>
  );
}
