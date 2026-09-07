"use client";

/**
 * Soft mix-blend tint over the baked on-facade peace sign.
 * No glyph, frame, plate, or second mark — only recolors the house sign.
 */
export type HeroFacadeTintProps = {
  hex: string;
  className?: string;
};

export function HeroFacadeTint({ hex, className }: HeroFacadeTintProps) {
  const glow = hex?.trim() || "#F6EBD1";
  const classes = ["estate-hero__facade-tint", className ?? ""].filter(Boolean).join(" ");
  return (
    <span
      className={classes}
      style={{ background: glow }}
      aria-hidden
      data-facade-tint={glow}
    />
  );
}

export default HeroFacadeTint;

