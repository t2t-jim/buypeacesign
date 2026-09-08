"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

/**
 * Facade Logo A — early “warmer soft” neon-on-stone (glow B / PeaceSignPreview).
 * Soft warm tube glow + gentle circular wall wash like garage/pool/gate.
 * Image-space stone-panel mid (slight optical nudge). Circle clip — no gray square.
 */

export type HeroFacadeTintProps = {
  hex: string;
  className?: string;
};

const SRC_W = 1536;
const SRC_H = 1024;

const ANCHOR_X = 0.5;
/** Geometric mid 0.2344; slight raise so bottom-heavy Logo A reads dead-center. */
const ANCHOR_Y = 0.227;

const TUBE_FRAC = 0.118;
/** Room for soft bloom / wall wash inside circular clip. */
const WASH_PAD = 1.38;

const CX = 100;
const CY = 100;
const R = 78;

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

function hexToRgba(hex: string, alpha: number): string {
  const n = normalizeHex(hex).slice(1);
  const r = Number.parseInt(n.slice(0, 2), 16);
  const g = Number.parseInt(n.slice(2, 4), 16);
  const b = Number.parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function tubeCoreHex(brand: string, towardWhite = 0.55): string {
  const n = brand.slice(1);
  const mix = (ch: string) => {
    const v = Number.parseInt(ch, 16);
    return Math.round(v + (255 - v) * towardWhite)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  };
  return `#${mix(n.slice(0, 2))}${mix(n.slice(2, 4))}${mix(n.slice(4, 6))}`;
}

/** Early warmer-soft glow B — same recipe as PeaceSignPreview default. */
function warmerTubeFilter(hex: string): string {
  return [
    `drop-shadow(0 0 10px ${hex})`,
    `drop-shadow(0 0 22px ${hexToRgba(hex, 0.6)})`,
    `drop-shadow(0 0 42px ${hexToRgba(hex, 0.38)})`,
  ].join(" ");
}

function parseObjectPosition(value: string): { x: number; y: number } {
  const parts = value.trim().split(/\s+/);
  const parse = (token: string | undefined, fallback: number) => {
    if (!token) return fallback;
    if (token.endsWith("%")) {
      const n = Number.parseFloat(token);
      return Number.isFinite(n) ? n / 100 : fallback;
    }
    if (token === "left" || token === "top") return 0;
    if (token === "center") return 0.5;
    if (token === "right" || token === "bottom") return 1;
    return fallback;
  };
  return { x: parse(parts[0], 0.5), y: parse(parts[1], 0.36) };
}

function coverPoint(
  boxW: number,
  boxH: number,
  posX: number,
  posY: number,
  srcX: number,
  srcY: number,
): { x: number; y: number; scale: number } {
  const scale = Math.max(boxW / SRC_W, boxH / SRC_H);
  const rw = SRC_W * scale;
  const rh = SRC_H * scale;
  const ox = (boxW - rw) * posX;
  const oy = (boxH - rh) * posY;
  return { x: srcX * rw + ox, y: srcY * rh + oy, scale };
}

type AnchorPos = {
  left: number;
  top: number;
  size: number;
  ready: boolean;
};

function PeaceMark({
  stroke,
  strokeWidth,
  opacity = 1,
}: {
  stroke: string;
  strokeWidth: number;
  opacity?: number;
}) {
  const inset = Math.min(R - 2, strokeWidth * 0.5);
  const y0 = CY - R + inset;
  const y1 = CY + R - inset;
  const reach = R - inset;
  const dx = reach * 0.66;
  const dy = reach * 0.88;
  return (
    <g opacity={opacity}>
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
      />
      <line
        x1={CX}
        y1={y0}
        x2={CX}
        y2={y1}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
      />
      <line
        x1={CX}
        y1={CY}
        x2={CX - dx}
        y2={CY + dy}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
      />
      <line
        x1={CX}
        y1={CY}
        x2={CX + dx}
        y2={CY + dy}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
      />
    </g>
  );
}

export function HeroFacadeTint({ hex, className }: HeroFacadeTintProps) {
  const brand = normalizeHex(hex || "#F6EBD1");
  const core = tubeCoreHex(brand, 0.55);
  const uid = useId().replace(/:/g, "");
  const bloomCoreId = `facade-bloom-core-${uid}`;
  const bloomOuterId = `facade-bloom-outer-${uid}`;
  const clipId = `facade-tube-clip-${uid}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const [anchor, setAnchor] = useState<AnchorPos>({
    left: 0,
    top: 0,
    size: 120,
    ready: false,
  });

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const photo = svg.closest(".estate-hero__photo") as HTMLElement | null;
    const img = photo?.querySelector("img") as HTMLImageElement | null;
    if (!photo || !img) return;

    const update = () => {
      const cw = img.clientWidth;
      const ch = img.clientHeight;
      if (cw < 2 || ch < 2) return;
      const { x: posX, y: posY } = parseObjectPosition(
        getComputedStyle(img).objectPosition || "50% 36%",
      );
      const { x, y, scale } = coverPoint(
        cw,
        ch,
        posX,
        posY,
        ANCHOR_X,
        ANCHOR_Y,
      );
      const tubePx = SRC_W * TUBE_FRAC * scale;
      setAnchor({
        left: x,
        top: y,
        size: tubePx * WASH_PAD,
        ready: true,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(img);
    ro.observe(photo);
    img.addEventListener("load", update);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      img.removeEventListener("load", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const classes = ["estate-hero__facade-sign", className ?? ""]
    .filter(Boolean)
    .join(" ");

  const markScale = 1 / WASH_PAD;
  // Warmer glow B filter — clipped to circle(50%) so no gray square flash
  const tubeFilter = warmerTubeFilter(brand);

  const style: CSSProperties = {
    position: "absolute",
    left: anchor.left,
    top: anchor.top,
    width: anchor.size,
    height: anchor.size,
    transform: "translate(-50%, -50%)",
    visibility: anchor.ready ? "visible" : "hidden",
    pointerEvents: "none",
    background: "transparent",
    border: "none",
    outline: "none",
    boxShadow: "none",
    clipPath: "circle(50%)",
    WebkitClipPath: "circle(50%)",
    overflow: "hidden",
    contain: "paint",
    // Early luminous neon — same warmer soft recipe as PeaceSignPreview / glow B
    filter: tubeFilter,
  };

  return (
    <svg
      ref={svgRef}
      className={classes}
      viewBox="0 0 200 200"
      aria-hidden
      data-facade-tint={brand}
      data-facade-anchor={`${ANCHOR_X},${ANCHOR_Y.toFixed(4)}`}
      style={style}
    >
      <defs>
        {/* PeaceSignPreview warmer blooms — circular wall wash on stone */}
        <radialGradient id={bloomCoreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={brand} stopOpacity="0.55" />
          <stop offset="70%" stopColor={brand} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={bloomOuterId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={brand} stopOpacity="0.42" />
          <stop offset="70%" stopColor={brand} stopOpacity="0" />
        </radialGradient>
        <clipPath id={clipId}>
          <circle cx={CX} cy={CY} r={R + 8} />
        </clipPath>
      </defs>

      {/* Outer soft wash on stone (champagne bloom) */}
      <circle cx={CX} cy={CY} r={96} fill={`url(#${bloomOuterId})`} />
      {/* Inner warm bloom */}
      <circle cx={CX} cy={CY} r={72} fill={`url(#${bloomCoreId})`} />

      <g
        transform={`translate(${CX}, ${CY}) scale(${markScale}) translate(${-CX}, ${-CY})`}
      >
        <g clipPath={`url(#${clipId})`}>
          {/* Soft tube body — PeaceSignPreview stroke weight */}
          <PeaceMark stroke={brand} strokeWidth={12} opacity={0.92} />
          <PeaceMark stroke={core} strokeWidth={7} />
          <PeaceMark stroke="#FFFFFF" strokeWidth={2.4} opacity={0.7} />
        </g>
      </g>
    </svg>
  );
}

export default HeroFacadeTint;
