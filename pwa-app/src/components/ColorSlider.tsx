"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { LUXURY_DEFAULT_HEX } from "@/content/swatches";

export type ColorSliderProps = {
  hex: string;
  onChange: (hex: string) => void;
  className?: string;
  /** Show a tiny hex readout under the track (default true). */
  showHex?: boolean;
  /** Visible "Glow color" label. When false, label stays sr-only for a11y (default true). */
  showLabel?: boolean;
};

/** Wide premium estate spectrum — tasteful jewels + warm anchors (not harsh neon-ring). */
export const PREMIUM_GLOW_STOPS = [
  "#FFF8F0", // warm porcelain
  "#F6EBD1", // warm white
  "#EAD7B2", // champagne
  "#E0C49A", // soft gold
  "#D4B896", // amber
  "#E8A87C", // warm apricot
  "#E8B4A0", // soft rose
  "#D4899C", // dusty rose
  "#C9A0D4", // soft orchid (muted)
  "#A89BE0", // soft periwinkle
  "#7FA8D4", // soft sapphire
  "#6BBFBF", // soft aqua (tasteful, not neon)
  "#7DCEA0", // soft emerald
  "#B8C97A", // soft olive gold
  "#EAD7B2", // return to champagne
] as const;

const PREMIUM_GRADIENT = `linear-gradient(90deg, ${PREMIUM_GLOW_STOPS.map(
  (hex, i, arr) => `${hex} ${(i / (arr.length - 1)) * 100}%`,
).join(", ")})`;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizeHex(input: string): string {
  let h = input.trim().replace(/^#/, "").toUpperCase();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9A-F]{6}$/.test(h)) return LUXURY_DEFAULT_HEX.toUpperCase();
  return `#${h}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = normalizeHex(hex).slice(1);
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) =>
    Math.round(clamp(v, 0, 255))
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${to(r)}${to(g)}${to(b)}`;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Map t∈[0,1] across premium stops with RGB interpolation. */
export function premiumTToHex(t: number): string {
  const stops = PREMIUM_GLOW_STOPS;
  const x = clamp(t, 0, 1) * (stops.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  if (i >= stops.length - 1) return normalizeHex(stops[stops.length - 1]);
  const a = hexToRgb(stops[i]);
  const b = hexToRgb(stops[i + 1]);
  return rgbToHex(lerp(a.r, b.r, f), lerp(a.g, b.g, f), lerp(a.b, b.b, f));
}

function colorDist(a: string, b: string): number {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return (A.r - B.r) ** 2 + (A.g - B.g) ** 2 + (A.b - B.b) ** 2;
}

/** Nearest slider position for an incoming hex (swatch / controlled value). */
export function hexToPremiumT(hex: string): number {
  const target = normalizeHex(hex);
  let bestT = 0;
  let bestD = Infinity;
  const steps = 240;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const d = colorDist(premiumTToHex(t), target);
    if (d < bestD) {
      bestD = d;
      bestT = t;
    }
  }
  return bestT;
}

export function ColorSlider({
  hex,
  onChange,
  className,
  showHex = true,
  showLabel = true,
}: ColorSliderProps) {
  const reactId = useId();
  const labelId = `${reactId}-label`;
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const displayHex = useMemo(() => normalizeHex(hex), [hex]);
  const [t, setT] = useState(() => hexToPremiumT(hex));

  useEffect(() => {
    setT(hexToPremiumT(displayHex));
  }, [displayHex]);

  const emitT = useCallback(
    (nextT: number) => {
      const clamped = clamp(nextT, 0, 1);
      setT(clamped);
      onChange(premiumTToHex(clamped));
    },
    [onChange],
  );

  const pickFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const next = clamp((clientX - rect.left) / Math.max(rect.width, 1), 0, 1);
      emitT(next);
    },
    [emitT],
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault();
      draggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      pickFromClientX(e.clientX);
    },
    [pickFromClientX],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      pickFromClientX(e.clientX);
    },
    [pickFromClientX],
  );

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 0.06 : 0.015;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        emitT(t - step);
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        emitT(t + step);
      } else if (e.key === "Home") {
        e.preventDefault();
        emitT(0);
      } else if (e.key === "End") {
        e.preventDefault();
        emitT(1);
      }
    },
    [emitT, t],
  );

  const pct = t * 100;
  const thumbColor = premiumTToHex(t);
  const classes = [
    "color-slider",
    !showLabel && !showHex ? "color-slider--minimal" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {showLabel ? (
        <p id={labelId} className="color-slider__label">
          Glow color
        </p>
      ) : (
        <span id={labelId} className="sr-only">
          Glow color
        </span>
      )}
      <div
        ref={trackRef}
        className="color-slider__hit"
        role="slider"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-valuetext={`${displayHex}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div
          className="color-slider__track"
          style={{ background: PREMIUM_GRADIENT }}
          aria-hidden
        />
        <div
          className="color-slider__thumb"
          style={{
            left: `${pct}%`,
            background: thumbColor,
            boxShadow: `0 0 0 2px rgba(255,252,248,0.95), 0 0 14px ${thumbColor}aa`,
          }}
          aria-hidden
        />
      </div>
      {showHex ? (
        <p className="color-slider__hex" aria-live="polite">
          {displayHex}
        </p>
      ) : null}
    </div>
  );
}

export default ColorSlider;
