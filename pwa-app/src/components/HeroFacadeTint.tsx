"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

/**
 * Facade Logo A — luminous neon tubing only.
 * Tight same-hex bloom on the tubes (no radial wall-wash aura / glowing orb).
 * Circle clip (no gray square). Inset geometry (no tails). Image-space center.
 */

export type HeroFacadeTintProps = {
  hex: string;
  className?: string;
};

const SRC_W = 1536;
const SRC_H = 1024;

const ANCHOR_X = 0.5;
const ANCHOR_Y = 0.212;

const TUBE_FRAC = 0.12;
/** Small pad so tight tube bloom isn’t clipped hard by circle(50%). */
const BLOOM_PAD = 1.28;

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

function tubeCoreHex(brand: string, towardWhite = 0.5): string {
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
  const core = tubeCoreHex(brand, 0.68);
  const hot = tubeCoreHex(brand, 0.88);
  const uid = useId().replace(/:/g, "");
  const tubeWashId = `facade-tube-wash-${uid}`;
  const tubeBloomId = `facade-tube-bloom-${uid}`;
  const softTubeId = `facade-soft-tube-${uid}`;
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
        size: tubePx * BLOOM_PAD,
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

  const markScale = 1 / BLOOM_PAD;

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
        {/* Subtle wash that follows the tube paths — not a filled orb */}
        <filter
          id={tubeWashId}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="6.2" result="wash" />
        </filter>
        {/* Tight bloom ON the tube paths only — not a wall disc */}
        <filter
          id={tubeBloomId}
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="4.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
          </feMerge>
        </filter>
        <filter
          id={softTubeId}
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.45" result="soft" />
          <feMerge>
            <feMergeNode in="soft" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={clipId}>
          <circle cx={CX} cy={CY} r={R + 4} />
        </clipPath>
      </defs>

      <g
        transform={`translate(${CX}, ${CY}) scale(${markScale}) translate(${-CX}, ${-CY})`}
      >
        {/* Tight warm wash along the tubes only — not a circular orb */}
        <g
          filter={`url(#${tubeWashId})`}
          opacity={0.55}
          style={{ mixBlendMode: "soft-light" }}
        >
          <g clipPath={`url(#${clipId})`}>
            <PeaceMark stroke={brand} strokeWidth={26} opacity={0.85} />
          </g>
        </g>

        {/* Placement-shot luminosity: bloom follows the tubes, not a wall disc */}
        <g
          filter={`url(#${tubeBloomId})`}
          opacity={1}
          style={{ mixBlendMode: "screen" }}
        >
          <g clipPath={`url(#${clipId})`}>
            <PeaceMark stroke={brand} strokeWidth={20} opacity={0.95} />
            <PeaceMark stroke={core} strokeWidth={13} opacity={0.7} />
          </g>
        </g>

        {/* Luminous glass tubing — hot core like garage/pool shots */}
        <g clipPath={`url(#${clipId})`} filter={`url(#${softTubeId})`}>
          <PeaceMark stroke={brand} strokeWidth={13} opacity={1} />
          <PeaceMark stroke={core} strokeWidth={8} opacity={1} />
          <PeaceMark stroke={hot} strokeWidth={3.6} opacity={0.95} />
        </g>
      </g>
    </svg>
  );
}

export default HeroFacadeTint;
