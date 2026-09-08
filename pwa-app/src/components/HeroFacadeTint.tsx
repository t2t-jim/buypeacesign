"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

/**
 * Photoreal neon-on-stone Logo A (garage / pool / gate reference).
 *
 * Stack (back → front), all inside circle clip (no gray square, no tails):
 *  1) Soft circular wall wash — soft-light into the photo (photographed feel)
 *  2) Blurred same-hex tube bloom (SVG blur only — no feFlood / no CSS filter box)
 *  3) Soft glass tube body
 *  4) Hot core (warm, not crisp white sticker lines)
 *
 * Image-space anchor; optical raise for bottom-heavy mark.
 */

export type HeroFacadeTintProps = {
  hex: string;
  className?: string;
};

const SRC_W = 1536;
const SRC_H = 1024;

const ANCHOR_X = 0.5;
/**
 * Stone panel ~10.94%→35.94% (geo mid 0.2344).
 * Raised further so the mark reads dead-center optically (Jim: still low at 0.227).
 */
const ANCHOR_Y = 0.212;

const TUBE_FRAC = 0.12;
const WASH_PAD = 1.55;

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

function tubeCoreHex(brand: string, towardWhite = 0.48): string {
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

/** Inset Logo A — no tails past the ring. */
function PeaceMark({
  stroke,
  strokeWidth,
  opacity = 1,
}: {
  stroke: string;
  strokeWidth: number;
  opacity?: number;
}) {
  const inset = Math.min(R - 2, strokeWidth * 0.52);
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
  const core = tubeCoreHex(brand, 0.5);
  const hot = tubeCoreHex(brand, 0.72);
  const uid = useId().replace(/:/g, "");
  const washId = `facade-wash-${uid}`;
  const bloomFilterId = `facade-bloom-blur-${uid}`;
  const softFilterId = `facade-soft-tube-${uid}`;
  const clipId = `facade-clip-${uid}`;
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

  // No CSS filter on the root SVG (that painted the gray square).
  // Softness comes from SVG feGaussianBlur on bloom/tube only + soft-light wash.
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
    filter: "none",
    clipPath: "circle(50%)",
    WebkitClipPath: "circle(50%)",
    overflow: "hidden",
    contain: "paint",
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
        {/* Photographed-style wall wash — warm falloff onto stone */}
        <radialGradient id={washId} cx="50%" cy="48%" r="52%">
          <stop offset="0%" stopColor={brand} stopOpacity="0.5" />
          <stop offset="22%" stopColor={brand} stopOpacity="0.28" />
          <stop offset="48%" stopColor={brand} stopOpacity="0.12" />
          <stop offset="72%" stopColor={brand} stopOpacity="0.04" />
          <stop offset="100%" stopColor={brand} stopOpacity="0" />
        </radialGradient>

        {/* Bloom haze — blur only (no feFlood; WebKit-safe) */}
        <filter
          id={bloomFilterId}
          x="-60%"
          y="-60%"
          width="220%"
          height="220%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
          </feMerge>
        </filter>

        {/* Slight tube softness — refraction-like edge */}
        <filter
          id={softFilterId}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.55" result="soft" />
          <feMerge>
            <feMergeNode in="soft" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <clipPath id={clipId}>
          <circle cx={CX} cy={CY} r={R + 6} />
        </clipPath>
      </defs>

      {/* 1) Wall wash — soft-light blends into stone (not a flat sticker plate) */}
      <circle
        cx={CX}
        cy={CY}
        r={100}
        fill={`url(#${washId})`}
        style={{ mixBlendMode: "soft-light" }}
      />
      <circle
        cx={CX}
        cy={CY}
        r={88}
        fill={`url(#${washId})`}
        opacity={0.55}
        style={{ mixBlendMode: "screen" }}
      />

      <g
        transform={`translate(${CX}, ${CY}) scale(${markScale}) translate(${-CX}, ${-CY})`}
      >
        {/* 2) Soft bloom / haze behind tubes */}
        <g filter={`url(#${bloomFilterId})`} opacity={0.85}>
          <PeaceMark stroke={brand} strokeWidth={16} opacity={0.7} />
        </g>
        <g filter={`url(#${bloomFilterId})`} opacity={0.4}>
          <PeaceMark stroke={core} strokeWidth={22} opacity={0.55} />
        </g>

        {/* 3–4) Glass tube + hot core (slight softness, no hard white sticker) */}
        <g clipPath={`url(#${clipId})`} filter={`url(#${softFilterId})`}>
          <PeaceMark stroke={brand} strokeWidth={11} opacity={0.88} />
          <PeaceMark stroke={core} strokeWidth={6.5} opacity={0.95} />
          <PeaceMark stroke={hot} strokeWidth={2.8} opacity={0.85} />
        </g>
      </g>
    </svg>
  );
}

export default HeroFacadeTint;
