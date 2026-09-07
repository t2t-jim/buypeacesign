"use client";

import { useId } from "react";

/**
 * Clean circular Logo A on the facade — exact brand hex.
 * Soft luminous glow ON the tubes via CSS drop-shadow (Safari-safe).
 * Geometry clipped to the circle — no tails past the ring.
 * No SVG feFlood filters (can white-screen WebKit on iPhone).
 */

export type HeroFacadeTintProps = {
  hex: string;
  className?: string;
};

function normalizeHex(input: string): string {
  let h = input.trim().replace(/^#/, "").toUpperCase();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9A-F]{6}$/.test(h)) return "#F6EBD1";
  return `#${h}`;
}

export function HeroFacadeTint({ hex, className }: HeroFacadeTintProps) {
  const brand = normalizeHex(hex || "#F6EBD1");
  const uid = useId().replace(/:/g, "");
  const clipId = `facade-peace-clip-${uid}`;
  const classes = ["estate-hero__facade-sign", className ?? ""]
    .filter(Boolean)
    .join(" ");

  // Tight drop-shadows follow stroke alpha = tube glow only, not a wall plate
  const tubeGlow = [
    `drop-shadow(0 0 1.5px ${brand})`,
    `drop-shadow(0 0 4px ${brand}cc)`,
    `drop-shadow(0 0 10px ${brand}66)`,
  ].join(" ");

  return (
    <svg
      className={classes}
      viewBox="0 0 200 200"
      aria-hidden
      data-facade-tint={brand}
      style={{ filter: tubeGlow }}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="100" cy="100" r="78" />
        </clipPath>
      </defs>

      <circle
        cx="100"
        cy="100"
        r="78"
        fill="none"
        stroke={brand}
        strokeWidth="13"
        strokeLinecap="butt"
      />
      <g clipPath={`url(#${clipId})`}>
        <line
          x1="100"
          y1="22"
          x2="100"
          y2="178"
          stroke={brand}
          strokeWidth="13"
          strokeLinecap="butt"
        />
        <line
          x1="100"
          y1="100"
          x2="48"
          y2="168"
          stroke={brand}
          strokeWidth="13"
          strokeLinecap="butt"
        />
        <line
          x1="100"
          y1="100"
          x2="152"
          y2="168"
          stroke={brand}
          strokeWidth="13"
          strokeLinecap="butt"
        />
      </g>
    </svg>
  );
}

export default HeroFacadeTint;
