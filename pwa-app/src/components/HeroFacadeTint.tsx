"use client";

/**
 * Clean circular Logo A on the facade — exact brand hex on tubes only.
 * No backlight, bloom, soft-light, or mix-blend disc.
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
  const classes = ["estate-hero__facade-sign", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <svg
      className={classes}
      viewBox="0 0 200 200"
      aria-hidden
      data-facade-tint={brand}
    >
      <circle
        cx="100"
        cy="100"
        r="78"
        fill="none"
        stroke={brand}
        strokeWidth="14"
        strokeLinecap="round"
      />
      <line
        x1="100"
        y1="22"
        x2="100"
        y2="178"
        stroke={brand}
        strokeWidth="14"
        strokeLinecap="round"
      />
      <line
        x1="100"
        y1="100"
        x2="48"
        y2="168"
        stroke={brand}
        strokeWidth="14"
        strokeLinecap="round"
      />
      <line
        x1="100"
        y1="100"
        x2="152"
        y2="168"
        stroke={brand}
        strokeWidth="14"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default HeroFacadeTint;
