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

/** Default preview / landing hero glow */
export const DEFAULT_HEX = "#FFFFFF";

export function findSwatchByHex(hex: string): Swatch | undefined {
  const normalized = hex.trim().toUpperCase();
  return DEFAULT_SWATCHES.find((s) => s.hex.toUpperCase() === normalized);
}

export default DEFAULT_SWATCHES;
