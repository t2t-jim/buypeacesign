"use client";

/**
 * Live peace-sign light preview.
 * Default illumination: warmer softer (champagne estate-night bloom).
 * `glowStyle="tight"` — short falloff, crisp rim (C alternate).
 * `monument` — landing hero: larger stage + warm champagne blooms.
 */

export type PeaceSignPreviewProps = {
  hex?: string;
  sizeLabel?: string;
  className?: string;
  sticky?: boolean;
  /** Larger size + warm champagne layered glow (landing hero). */
  monument?: boolean;
  /**
   * Glow falloff style. Default `"warmer"` = champagne estate-night bloom.
   * `"tight"` = short falloff, crisp rim (C alternate).
   */
  glowStyle?: "warmer" | "tight";
};

function buildSvgFilter(hex: string, glowStyle: "warmer" | "tight"): string {
  if (glowStyle === "tight") {
    // Short falloff, crisp rim — same-color neon layers, tight radii
    return `drop-shadow(0 0 6px ${hex}) drop-shadow(0 0 14px ${hex})`;
  }
  // Warmer softer: soft hex core + wider champagne haze + soft outer bloom
  return [
    `drop-shadow(0 0 10px ${hex})`,
    `drop-shadow(0 0 22px rgba(234, 215, 178, 0.55))`,
    `drop-shadow(0 0 42px rgba(246, 235, 209, 0.35))`,
  ].join(" ");
}

export function PeaceSignPreview({
  hex = "#FFFFFF",
  sizeLabel,
  className,
  sticky = false,
  monument = false,
  glowStyle = "warmer",
}: PeaceSignPreviewProps) {
  const glow = hex || "#FFFFFF";
  const classes = [
    "peace-preview",
    sticky ? "peace-preview--sticky" : "",
    monument ? "peace-preview--monument" : "",
    glowStyle === "tight" ? "peace-preview--glow-tight" : "peace-preview--glow-warmer",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  // Monument uses CSS filter on svg; non-monument uses inline multi-layer filter
  const svgFilter = monument ? undefined : buildSvgFilter(glow, glowStyle);

  return (
    <div
      className={classes}
      data-preview-hex={glow}
      data-glow-style={glowStyle}
      role="img"
      aria-label="Peace sign light preview"
    >
      {monument ? (
        glowStyle === "tight" ? (
          <>
            <span className="peace-preview__bloom peace-preview__bloom--soft" aria-hidden />
          </>
        ) : (
          <>
            <span className="peace-preview__bloom peace-preview__bloom--warm" aria-hidden />
            <span className="peace-preview__bloom peace-preview__bloom--champagne" aria-hidden />
          </>
        )
      ) : glowStyle === "warmer" ? (
        <span className="peace-preview__bloom peace-preview__bloom--soft" aria-hidden />
      ) : null}
      <svg
        viewBox="0 0 200 200"
        width="100%"
        aria-hidden
        style={svgFilter ? { filter: svgFilter } : undefined}
      >
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke={glow}
          strokeWidth="10"
        />
        <line
          x1="100"
          y1="22"
          x2="100"
          y2="178"
          stroke={glow}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <line
          x1="100"
          y1="100"
          x2="48"
          y2="168"
          stroke={glow}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <line
          x1="100"
          y1="100"
          x2="152"
          y2="168"
          stroke={glow}
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>
      {sizeLabel ? <p>{sizeLabel}</p> : null}
    </div>
  );
}

export default PeaceSignPreview;
