"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

/**
 * Clean circular Logo A on the facade — exact brand hex.
 * Image-space anchor (building centerline + stone-panel mid).
 * Hard-clipped to the ring — no stroke/glow tails past the circle.
 * Luminous neon tubes (hot core + same-hex bloom); no wall spill plate.
 */

export type HeroFacadeTintProps = {
  hex: string;
  className?: string;
};

const SRC_W = 1536;
const SRC_H = 1024;

/** Measured on hero-entrance.png: stone start 10.94% → glass lintel 35.94%. */
const ANCHOR_X = 0.5;
const ANCHOR_Y = (0.1094 + 0.3594) / 2; // 0.2344 — do not overshoot

const SIZE_FRAC = 0.115;

/** Circle geometry in viewBox 0..200 */
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

/** Internals only — endpoints inset so stroke stays inside the ring. */
function PeaceInternals({
  stroke,
  strokeWidth,
  opacity = 1,
}: {
  stroke: string;
  strokeWidth: number;
  opacity?: number;
}) {
  // Inset path ends by half stroke so caps don’t poke past the ring
  const inset = Math.min(R - 2, strokeWidth * 0.55);
  const y0 = CY - R + inset;
  const y1 = CY + R - inset;
  // Diagonals: from center toward bottom of ring, shortened
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
  const core = tubeCoreHex(brand, 0.58);
  const uid = useId().replace(/:/g, "");
  const clipId = `facade-hard-clip-${uid}`;
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [anchor, setAnchor] = useState<AnchorPos>({
    left: 0,
    top: 0,
    size: 120,
    ready: false,
  });

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const photo = wrap.closest(".estate-hero__photo") as HTMLElement | null;
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
      setAnchor({
        left: x,
        top: y,
        size: SRC_W * SIZE_FRAC * scale,
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

  // Tube luminosity — bloom stays inside circular overflow clip (no ray tails)
  const tubeGlow = [
    `drop-shadow(0 0 1px ${core})`,
    `drop-shadow(0 0 2px ${brand})`,
    `drop-shadow(0 0 5px ${brand})`,
    `drop-shadow(0 0 11px ${brand}dd)`,
    `drop-shadow(0 0 18px ${brand}88)`,
  ].join(" ");

  // Circular clip box slightly larger than the mark so soft glow remains, rays die
  const clipPad = 1.12;
  const wrapStyle: CSSProperties = {
    position: "absolute",
    left: anchor.left,
    top: anchor.top,
    width: anchor.size * clipPad,
    height: anchor.size * clipPad,
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    overflow: "hidden",
    opacity: anchor.ready ? 1 : 0,
    pointerEvents: "none",
    zIndex: 1,
  };

  const svgStyle: CSSProperties = {
    filter: tubeGlow,
    position: "absolute",
    left: "50%",
    top: "50%",
    width: `${100 / clipPad}%`,
    height: `${100 / clipPad}%`,
    transform: "translate(-50%, -50%)",
    overflow: "hidden",
  };

  return (
    <span
      ref={wrapRef}
      className="estate-hero__facade-sign-wrap"
      style={wrapStyle}
      data-facade-anchor={`${ANCHOR_X},${ANCHOR_Y.toFixed(4)}`}
      aria-hidden
    >
      <svg
        className={classes}
        viewBox="0 0 200 200"
        aria-hidden
        data-facade-tint={brand}
        style={svgStyle}
      >
        <defs>
          {/* Hard clip: nothing past the ring (internals + any overpaint) */}
          <clipPath id={clipId}>
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
        </defs>

        {/* Ring (defines the circle — not clipped) */}
        <PeaceRing stroke={brand} strokeWidth={14} opacity={0.95} />
        <PeaceRing stroke={core} strokeWidth={7.5} />
        <PeaceRing stroke="#FFFFFF" strokeWidth={2.8} opacity={0.7} />

        {/* Internals hard-clipped to the circle — no tails past the ring */}
        <g clipPath={`url(#${clipId})`}>
          <PeaceInternals stroke={brand} strokeWidth={14} opacity={0.95} />
          <PeaceInternals stroke={core} strokeWidth={7.5} />
          <PeaceInternals stroke="#FFFFFF" strokeWidth={2.8} opacity={0.7} />
        </g>
      </svg>
    </span>
  );
}

export default HeroFacadeTint;
