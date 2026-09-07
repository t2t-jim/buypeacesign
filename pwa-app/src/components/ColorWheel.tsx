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

export type ColorWheelProps = {
  hex: string;
  onChange: (hex: string) => void;
  className?: string;
};

type HSV = { h: number; s: number; v: number };

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
  if (!/^[0-9A-F]{6}$/.test(h)) return "#F6EBD1";
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

function rgbToHsv(r: number, g: number, b: number): HSV {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const hh = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = v - c;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hh < 60) {
    rp = c;
    gp = x;
  } else if (hh < 120) {
    rp = x;
    gp = c;
  } else if (hh < 180) {
    gp = c;
    bp = x;
  } else if (hh < 240) {
    gp = x;
    bp = c;
  } else if (hh < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  return {
    r: (rp + m) * 255,
    g: (gp + m) * 255,
    b: (bp + m) * 255,
  };
}

function hexToHsv(hex: string): HSV {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsv(r, g, b);
}

function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

/** Angle in degrees from positive X, CSS y-down coords → hue (0° = red at top). */
function angleToHue(degFromTopCw: number): number {
  return ((degFromTopCw % 360) + 360) % 360;
}

function hueToAngle(h: number): number {
  return ((h % 360) + 360) % 360;
}

export function ColorWheel({ hex, onChange, className }: ColorWheelProps) {
  const reactId = useId();
  const wheelRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<"hue" | "sat" | null>(null);
  const hsvRef = useRef<HSV>(hexToHsv(hex));

  const displayHex = useMemo(() => normalizeHex(hex), [hex]);
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(hex));

  useEffect(() => {
    const next = hexToHsv(displayHex);
    hsvRef.current = next;
    setHsv(next);
  }, [displayHex]);

  const emit = useCallback(
    (next: HSV) => {
      hsvRef.current = next;
      setHsv(next);
      onChange(hsvToHex(next.h, next.s, next.v));
    },
    [onChange],
  );

  const pickFromPointer = useCallback(
    (clientX: number, clientY: number, mode: "hue" | "sat") => {
      const el = wheelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = rect.width / 2;
      const ringOuter = radius;
      const ringInner = radius * 0.72;
      const discRadius = radius * 0.62;

      // Angle: 0 at top, clockwise (matches CSS conic-gradient from top)
      let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
      if (deg < 0) deg += 360;
      const hue = angleToHue(deg);
      const cur = hsvRef.current;

      if (mode === "hue") {
        emit({ ...cur, h: hue });
        return;
      }

      // Saturation disc: radius maps to sat; hue from angle
      const sat = clamp(dist / discRadius, 0, 1);
      emit({ h: hue, s: sat, v: cur.v });
      void ringOuter;
      void ringInner;
    },
    [emit],
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const el = wheelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = rect.width / 2;
      const midRing = radius * 0.86;
      const mode: "hue" | "sat" = dist >= midRing * 0.78 ? "hue" : "sat";
      draggingRef.current = mode;
      el.setPointerCapture(e.pointerId);
      pickFromPointer(e.clientX, e.clientY, mode);
      e.preventDefault();
    },
    [pickFromPointer],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      pickFromPointer(e.clientX, e.clientY, draggingRef.current);
    },
    [pickFromPointer],
  );

  const endDrag = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  const onValueChange = useCallback(
    (raw: number) => {
      const v = clamp(raw, 0.08, 1);
      emit({ ...hsvRef.current, v });
    },
    [emit],
  );

  const onNativeChange = useCallback(
    (value: string) => {
      const next = hexToHsv(value);
      emit(next);
    },
    [emit],
  );

  const onThumbKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, target: "hue" | "sat") => {
      const step = e.shiftKey ? 8 : 2;
      const cur = hsvRef.current;
      let next = { ...cur };
      if (target === "hue") {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          next.h = (cur.h + step) % 360;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          next.h = (cur.h - step + 360) % 360;
        } else return;
      } else {
        if (e.key === "ArrowRight") next.s = clamp(cur.s + step / 100, 0, 1);
        else if (e.key === "ArrowLeft") next.s = clamp(cur.s - step / 100, 0, 1);
        else if (e.key === "ArrowUp") next.v = clamp(cur.v + step / 100, 0.08, 1);
        else if (e.key === "ArrowDown") next.v = clamp(cur.v - step / 100, 0.08, 1);
        else return;
      }
      e.preventDefault();
      emit(next);
    },
    [emit],
  );

  const hueAngle = hueToAngle(hsv.h);
  const rad = (hueAngle * Math.PI) / 180;
  // Percents of disc width: center=50. Hue ring midline ~43% from center.
  // Inner sat disc radius ~31% from center (matches inset 16% / radius 34%).
  const hueX = 50 + Math.sin(rad) * 43;
  const hueY = 50 - Math.cos(rad) * 43;
  const satOffset = hsv.s * 31;
  const satX = 50 + Math.sin(rad) * satOffset;
  const satY = 50 - Math.cos(rad) * satOffset;

  const fullHueHex = hsvToHex(hsv.h, 1, 1);
  const valueGradient = `linear-gradient(90deg, #000 0%, ${hsvToHex(hsv.h, hsv.s, 1)} 100%)`;

  const rootClass = ["color-wheel", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <div
        ref={wheelRef}
        className="color-wheel__disc"
        role="slider"
        aria-label="Glow color hue and saturation"
        aria-valuetext={displayHex}
        tabIndex={-1}
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="color-wheel__ring" aria-hidden />
        <div
          className="color-wheel__inner"
          style={{
            background: `
              radial-gradient(circle closest-side, #fff 0%, transparent 70%),
              conic-gradient(
                from 0deg,
                hsl(0 100% 50%),
                hsl(60 100% 50%),
                hsl(120 100% 50%),
                hsl(180 100% 50%),
                hsl(240 100% 50%),
                hsl(300 100% 50%),
                hsl(360 100% 50%)
              )
            `,
            opacity: 0.95,
            filter: `brightness(${0.35 + hsv.v * 0.65})`,
          }}
          aria-hidden
        />
        <div className="color-wheel__inner-veil" aria-hidden />

        <button
          type="button"
          className="color-wheel__thumb color-wheel__thumb--hue"
          style={{ left: `${hueX}%`, top: `${hueY}%` }}
          aria-label="Hue"
          onKeyDown={(e) => onThumbKeyDown(e, "hue")}
        >
          <span
            className="color-wheel__thumb-dot"
            style={{ background: fullHueHex, boxShadow: `0 0 10px ${fullHueHex}` }}
          />
        </button>

        <button
          type="button"
          className="color-wheel__thumb color-wheel__thumb--sat"
          style={{ left: `${satX}%`, top: `${satY}%` }}
          aria-label="Saturation"
          onKeyDown={(e) => onThumbKeyDown(e, "sat")}
        >
          <span
            className="color-wheel__thumb-dot"
            style={{
              background: displayHex,
              boxShadow: `0 0 12px ${displayHex}aa`,
            }}
          />
        </button>
      </div>

      <label className="color-wheel__value" htmlFor={`${reactId}-value`}>
        <span className="color-wheel__value-label">Brightness</span>
        <input
          id={`${reactId}-value`}
          type="range"
          min={8}
          max={100}
          step={1}
          value={Math.round(hsv.v * 100)}
          onChange={(e) => onValueChange(Number(e.target.value) / 100)}
          className="color-wheel__slider"
          style={{ background: valueGradient }}
          aria-valuemin={8}
          aria-valuemax={100}
          aria-valuenow={Math.round(hsv.v * 100)}
        />
      </label>

      <div className="color-wheel__meta">
        <span className="color-wheel__hex" aria-live="polite">
          {displayHex}
        </span>
        <label className="color-wheel__native-wrap">
          <span className="sr-only">Pick any color</span>
          <input
            type="color"
            className="color-wheel__native"
            value={displayHex}
            onChange={(e) => onNativeChange(e.target.value)}
            aria-label="Native color picker fallback"
          />
        </label>
      </div>
    </div>
  );
}

export default ColorWheel;
