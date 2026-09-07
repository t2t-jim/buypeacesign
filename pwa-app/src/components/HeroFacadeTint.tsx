"use client";

/**
 * Exact brand-hex recolor of the on-wall Logo A tubes only.
 * Tube-shaped mask + mix-blend color — no backlight, bloom, soft-light, or chroma boost.
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

/** Faithful brand match — liveHex as typed/slider, no mildTint shift. */
export function HeroFacadeTint({ hex, className }: HeroFacadeTintProps) {
  const brand = normalizeHex(hex || "#F6EBD1");
  const classes = ["estate-hero__facade-tint", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <span
      className={classes}
      style={{ background: brand }}
      aria-hidden
      data-facade-tint={brand}
    />
  );
}

export default HeroFacadeTint;
