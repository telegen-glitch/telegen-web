"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Arrow, buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { useTopicPicker } from "./TopicPicker";

/**
 * Primary assessment CTA. A real link to /evaluare (works without JS);
 * with JS it opens the topic picker first, like the reference flow.
 */
export function StartButton({
  children = "Începe evaluarea",
  variant = "primary",
  size = "lg",
  className = "",
  arrow = true,
}: {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  arrow?: boolean;
}) {
  const picker = useTopicPicker();
  return (
    <Link
      href="/evaluare"
      className={buttonClasses(variant, size, className)}
      onClick={(e) => {
        track("cta_clicked");
        if (!picker) return;
        e.preventDefault();
        picker.open();
      }}
    >
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}
