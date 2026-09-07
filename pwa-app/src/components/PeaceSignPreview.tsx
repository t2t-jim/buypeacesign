"use client";

/**
 * Live peace-sign light preview.
 * Default illumination: warmer softer (estate-night bloom tinted by hex).
 * `glowStyle="tight"` — short falloff, crisp rim (C alternate).
 * `monument` — landing hero: larger stage + hex-driven blooms (facade overlay).
 */

export type PeaceSignPreviewProps = {
  hex?: string;
  sizeLabel?: string;
  className?: string;
  sticky?: boolean;
  /** Larger size + layered glow (landing hero / facade). */
  monument?: boolean;
  /**
   * Glow falloff style. Default `"warmer"` = soft estate-night bloom.
   * `"tight"` = short falloff, crisp rim (C alternate).
   */
  glowStyle?: "warmer" | "tight";
};

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace("#", "").trim();
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return `rgba(255, 255, 255, ${alpha})`;
  }
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildSvgFilter(hex: string, glowStyle: "warmer" | "tight"): string {
  if (glowStyle === "tight") {
    // Short falloff, crisp rim — same-color neon layers, tight radii
    return `drop-shadow(0 0 6px ${hex}) drop-shadow(0 0 14px ${hex})`;
  }
  // Warmer softer: soft hex core + wider hex haze + soft outer bloom
  return [
    `drop-shadow(0 0 10px ${hex})`,
    `drop-shadow(0 0 22px ${hexToRgba(hex, 0.6)})`,
    `drop-shadow(0 0 42px ${hexToRgba(hex, 0.38)})`,
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

  // Always apply live hex filter (including monument — CSS no longer hardcodes champagne)
  const svgFilter = buildSvgFilter(glow, glowStyle);

  const bloomCore = {
    background: `radial-gradient(circle, ${hexToRgba(glow, 0.55)} 0%, transparent 70%)`,
  };
  const bloomOuter = {
    background: `radial-gradient(circle, ${hexToRgba(glow, 0.42)} 0%, transparent 70%)`,
  };

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
            <span
              className="peace-preview__bloom peace-preview__bloom--soft"
              style={bloomCore}
              aria-hidden
            />
          </>
        ) : (
          <>
            <span
              className="peace-preview__bloom peace-preview__bloom--warm"
              style={bloomCore}
              aria-hidden
            />
            <span
              className="peace-preview__bloom peace-preview__bloom--champagne"
              style={bloomOuter}
              aria-hidden
            />
          </>
        )
      ) : glowStyle === "warmer" ? (
        <span
          className="peace-preview__bloom peace-preview__bloom--soft"
          style={bloomCore}
          aria-hidden
        />
      ) : null}
      <svg
        viewBox="0 0 200 200"
        width="100%"
        aria-hidden
        style={{ filter: svgFilter }}
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
