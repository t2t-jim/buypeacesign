"use client";

/**
 * Live peace-sign light preview. Soft neon bloom using `hex`.
 * `monument` — landing hero: larger stage + dual teal/violet bloom.
 */

export type PeaceSignPreviewProps = {
  hex?: string;
  sizeLabel?: string;
  className?: string;
  sticky?: boolean;
  /** Larger size + teal-left / violet-right layered glow (landing hero). */
  monument?: boolean;
};

export function PeaceSignPreview({
  hex = "#FFFFFF",
  sizeLabel,
  className,
  sticky = false,
  monument = false,
}: PeaceSignPreviewProps) {
  const glow = hex || "#FFFFFF";
  const classes = [
    "peace-preview",
    sticky ? "peace-preview--sticky" : "",
    monument ? "peace-preview--monument" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const svgFilter = monument
    ? undefined
    : `drop-shadow(0 0 12px ${glow}) drop-shadow(0 0 28px ${glow})`;

  return (
    <div
      className={classes}
      data-preview-hex={glow}
      role="img"
      aria-label="Peace sign light preview"
    >
      {monument ? (
        <>
          <span className="peace-preview__bloom peace-preview__bloom--teal" aria-hidden />
          <span className="peace-preview__bloom peace-preview__bloom--violet" aria-hidden />
        </>
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
