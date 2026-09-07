/**
 * Default product color swatches for the configurator.
 * Hex values locked for market-test prep kit.
 */

export type Swatch = {
  id: string;
  name: string;
  hex: string;
};

export const DEFAULT_SWATCHES: readonly Swatch[] = [
  { id: "soft-white", name: "Soft White", hex: "#FFFFFF" },
  { id: "warm-sand", name: "Warm Sand", hex: "#F5E6C8" },
  { id: "sky", name: "Sky", hex: "#7CB7FF" },
  { id: "leaf", name: "Leaf", hex: "#7DDEA2" },
  { id: "sunset", name: "Sunset", hex: "#FF8B6A" },
  { id: "dusk", name: "Dusk", hex: "#C4A1FF" },
] as const;

/** Luxury estate landing Live Color swatches (Concept 1 — Estate Glow). */
export const LUXURY_SWATCHES: readonly Swatch[] = [
  { id: "warm-white", name: "Warm White", hex: "#F6EBD1" },
  { id: "champagne", name: "Champagne", hex: "#EAD7B2" },
  { id: "sapphire", name: "Sapphire", hex: "#4AA3FF" },
  { id: "dusk-violet", name: "Dusk Violet", hex: "#B47CFF" },
] as const;

/** Default preview / landing hero glow */
export const DEFAULT_HEX = "#FFFFFF";

/** Default Live Color selection on estate landing */
export const LUXURY_DEFAULT_HEX = LUXURY_SWATCHES[0].hex;

export function findSwatchByHex(hex: string): Swatch | undefined {
  const normalized = hex.trim().toUpperCase();
  return (
    LUXURY_SWATCHES.find((s) => s.hex.toUpperCase() === normalized) ??
    DEFAULT_SWATCHES.find((s) => s.hex.toUpperCase() === normalized)
  );
}

export default DEFAULT_SWATCHES;
