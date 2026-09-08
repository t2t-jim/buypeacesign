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
 * Positioned in *image space* via object-fit math against the hero <img>
 * (building centerline + mid of stone panel above the glass lintel).
 * Luminous neon tube look (bright core + same-hex bloom) — no wall spill plate,
 * no SVG feFlood (WebKit-safe), no tails past the ring.
 */

export type HeroFacadeTintProps = {
  hex: string;
  className?: string;
};

/** Intrinsic hero photo size (public/estate/hero-entrance.png). */
const SRC_W = 1536;
const SRC_H = 1024;

/**
 * Anchor in source-image normalized coords (measured on the clean estate photo):
 * - X: building vertical centerline through glass mullion / stairs
 * - Y: geometric mid of main stone face (roof/stone ~10.9% → glass lintel ~35.9%)
 */
const ANCHOR_X = 0.5;
const ANCHOR_Y = (0.1094 + 0.3594) / 2; // ≈ 0.2344 — true stone-panel mid

/** Logo diameter as a fraction of source image width. */
const SIZE_FRAC = 0.115;

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

/** Mix brand toward white for a hot neon tube core (placement-shot look). */
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

/** Map a point in the source bitmap into the object-fit:cover element box. */
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
  clipId,
  opacity = 1,
}: {
  stroke: string;
  strokeWidth: number;
  clipId: string;
  opacity?: number;
}) {
  return (
    <g opacity={opacity}>
      <circle
        cx="100"
        cy="100"
        r="78"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
      />
      <g clipPath={`url(#${clipId})`}>
        <line
          x1="100"
          y1="22"
          x2="100"
          y2="178"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />
        <line
          x1="100"
          y1="100"
          x2="48"
          y2="168"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />
        <line
          x1="100"
          y1="100"
          x2="152"
          y2="168"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />
      </g>
    </g>
  );
}

export function HeroFacadeTint({ hex, className }: HeroFacadeTintProps) {
  const brand = normalizeHex(hex || "#F6EBD1");
  const core = tubeCoreHex(brand, 0.58);
  const uid = useId().replace(/:/g, "");
  const clipId = `facade-peace-clip-${uid}`;
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

  // Placement-shot luminosity: hot core + tight same-hex bloom (no cyan/purple plate)
  const tubeGlow = [
    `drop-shadow(0 0 1px ${core})`,
    `drop-shadow(0 0 2px ${brand})`,
    `drop-shadow(0 0 5px ${brand})`,
    `drop-shadow(0 0 12px ${brand}ee)`,
    `drop-shadow(0 0 22px ${brand}99)`,
    `drop-shadow(0 0 36px ${brand}55)`,
  ].join(" ");

  const style: CSSProperties = {
    filter: tubeGlow,
    position: "absolute",
    left: anchor.left,
    top: anchor.top,
    width: anchor.size,
    height: anchor.size,
    transform: "translate(-50%, -50%)",
    opacity: anchor.ready ? 1 : 0,
    pointerEvents: "none",
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
        <clipPath id={clipId}>
          <circle cx="100" cy="100" r="78" />
        </clipPath>
      </defs>

      {/* Soft outer tube body (brand) */}
      <PeaceMark stroke={brand} strokeWidth={15} clipId={clipId} opacity={0.92} />
      {/* Hot neon core — matches garage/pool luminous tubes */}
      <PeaceMark stroke={core} strokeWidth={8} clipId={clipId} />
      <PeaceMark stroke="#FFFFFF" strokeWidth={3.2} clipId={clipId} opacity={0.75} />
    </svg>
  );
}

export default HeroFacadeTint;
