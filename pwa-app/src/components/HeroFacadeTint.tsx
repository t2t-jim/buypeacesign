"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

/**
 * Real neon-on-stone Logo A for the estate splash.
 *
 * Physically-inspired stack (matches garage/pool/gate placement shots):
 *  1) Soft circular same-hex wall wash (radial falloff on stone — never a square)
 *  2) Tube bloom (wide low-opacity strokes)
 *  3) Brand tube body
 *  4) Hot core + white filament
 *
 * Image-space anchor on building centerline + stone-panel mid.
 * No CSS filter / no opacity GPU layer (those caused gray square flashes).
 * Element uses clip-path:circle(50%) so compositing stays circular.
 */

export type HeroFacadeTintProps = {
  hex: string;
  className?: string;
};

const SRC_W = 1536;
const SRC_H = 1024;

/** Measured on hero-entrance.png: stone start 10.94% → glass lintel 35.94%. */
const ANCHOR_X = 0.5;
const ANCHOR_Y = (0.1094 + 0.3594) / 2; // 0.2344

/** Tube mark size as fraction of source width. */
const TUBE_FRAC = 0.115;
/** Extra canvas so wall wash can fall off onto stone around the tubes. */
const WASH_PAD = 1.52;

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

function tubeCoreHex(brand: string, towardWhite = 0.62): string {
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

function PeaceInternals({
  stroke,
  strokeWidth,
  opacity = 1,
}: {
  stroke: string;
  strokeWidth: number;
  opacity?: number;
}) {
  const inset = Math.min(R - 2, strokeWidth * 0.55);
  const y0 = CY - R + inset;
  const y1 = CY + R - inset;
  const reach = R - inset;
  const dx = reach * 0.66;
  const dy = reach * 0.88;
  return (
    <g opacity={opacity}>
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

function PeaceRing({
  stroke,
  strokeWidth,
  opacity = 1,
}: {
  stroke: string;
  strokeWidth: number;
  opacity?: number;
}) {
  return (
    <circle
      cx={CX}
      cy={CY}
      r={R}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="butt"
      opacity={opacity}
    />
  );
}

export function HeroFacadeTint({ hex, className }: HeroFacadeTintProps) {
  const brand = normalizeHex(hex || "#F6EBD1");
  const core = tubeCoreHex(brand, 0.62);
  const uid = useId().replace(/:/g, "");
  const washId = `facade-wall-wash-${uid}`;
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

  const style: CSSProperties = {
    position: "absolute",
    left: anchor.left,
    top: anchor.top,
    width: anchor.size,
    height: anchor.size,
    transform: "translate(-50%, -50%)",
    visibility: anchor.ready ? "visible" : "hidden",
    pointerEvents: "none",
    filter: "none",
    background: "transparent",
    border: "none",
    outline: "none",
    boxShadow: "none",
    clipPath: "circle(50%)",
    WebkitClipPath: "circle(50%)",
    overflow: "hidden",
    contain: "paint",
  };

  // Tube mark sits in the center ~1/WASH_PAD of the padded canvas
  const markScale = 1 / WASH_PAD;

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
        {/* Soft circular wash onto stone — same hex, natural falloff (garage-like) */}
        <radialGradient id={washId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={brand} stopOpacity="0.42" />
          <stop offset="28%" stopColor={brand} stopOpacity="0.22" />
          <stop offset="55%" stopColor={brand} stopOpacity="0.09" />
          <stop offset="78%" stopColor={brand} stopOpacity="0.03" />
          <stop offset="100%" stopColor={brand} stopOpacity="0" />
        </radialGradient>
        <clipPath id={clipId}>
          <circle cx={CX} cy={CY} r={R + 10} />
        </clipPath>
      </defs>

      {/* Layer 1 — gentle warm wash on stone (circular only) */}
      <circle cx={CX} cy={CY} r={98} fill={`url(#${washId})`} />

      {/* Layers 2–5 — neon tubes, scaled to leave room for wash */}
      <g
        transform={`translate(${CX}, ${CY}) scale(${markScale}) translate(${-CX}, ${-CY})`}
      >
        <g clipPath={`url(#${clipId})`}>
          {/* Soft tube bloom */}
          <PeaceRing stroke={brand} strokeWidth={26} opacity={0.18} />
          <PeaceInternals stroke={brand} strokeWidth={26} opacity={0.18} />
          <PeaceRing stroke={brand} strokeWidth={18} opacity={0.32} />
          <PeaceInternals stroke={brand} strokeWidth={18} opacity={0.32} />

          {/* Brand glass tube */}
          <PeaceRing stroke={brand} strokeWidth={12} opacity={0.95} />
          <PeaceInternals stroke={brand} strokeWidth={12} opacity={0.95} />

          {/* Hot neon core */}
          <PeaceRing stroke={core} strokeWidth={6.5} />
          <PeaceInternals stroke={core} strokeWidth={6.5} />

          {/* Filament highlight */}
          <PeaceRing stroke="#FFFFFF" strokeWidth={2.2} opacity={0.78} />
          <PeaceInternals stroke="#FFFFFF" strokeWidth={2.2} opacity={0.78} />
        </g>
      </g>
    </svg>
  );
}

export default HeroFacadeTint;
