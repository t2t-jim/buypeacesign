"use client";

import { useId } from "react";

/**
 * Clean circular Logo A on the facade — exact brand hex.
 * Soft luminous glow ON the tubes only (no wall spill / halo plate).
 * Geometry clipped to the circle — no tails past the ring.
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
  const glowId = `facade-tube-glow-${uid}`;
  const clipId = `facade-peace-clip-${uid}`;
  const classes = ["estate-hero__facade-sign", className ?? ""]
    .filter(Boolean)
    .join(" ");

  // Logo A proportions (circle r=78): vertical + diagonals meet the ring, clipped so no tails
  return (
    <svg
      className={classes}
      viewBox="0 0 200 200"
      aria-hidden
      data-facade-tint={brand}
    >
      <defs>
        <filter
          id={glowId}
          x="-35%"
          y="-35%"
          width="170%"
          height="170%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
          <feFlood floodColor={brand} floodOpacity="0.55" result="glowColor" />
          <feComposite in="glowColor" in2="blur" operator="in" result="softGlow" />
          <feMerge>
            <feMergeNode in="softGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={clipId}>
          <circle cx="100" cy="100" r="78" />
        </clipPath>
      </defs>

      <g filter={`url(#${glowId})`}>
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
      </g>
    </svg>
  );
}

export default HeroFacadeTint;
