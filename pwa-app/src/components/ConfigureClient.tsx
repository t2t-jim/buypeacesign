"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PeaceSignPreview } from "@/components/PeaceSignPreview";
import {
  SizePicker,
  type SizeSelection,
} from "@/components/SizePicker";
import { ColorConfigurator } from "@/components/ColorConfigurator";
import { DEFAULT_HEX } from "@/content/swatches";
import {
  formatSizeLabel,
  normalizeHex,
  parseCustomSizeInches,
} from "@/lib/waitlist";

type Step = "size" | "color";

function parseInitialSelection(
  sizeParam: string | null,
  inchesParam: string | null,
): SizeSelection | undefined {
  if (sizeParam === "36" || sizeParam === "48") {
    return { sizeInterest: sizeParam };
  }
  if (sizeParam === "custom") {
    const inches = parseCustomSizeInches(inchesParam);
    if (inches !== undefined) {
      return { sizeInterest: "custom", customSizeInches: inches };
    }
    return undefined;
  }
  // Allow /configure?size=42 as a custom diameter shortcut.
  const asInches = parseCustomSizeInches(sizeParam);
  if (asInches !== undefined && sizeParam !== "36" && sizeParam !== "48") {
    return { sizeInterest: "custom", customSizeInches: asInches };
  }
  return undefined;
}

function selectionToQuery(selection: SizeSelection): Record<string, string> {
  if (selection.sizeInterest === "custom") {
    return {
      size: "custom",
      inches: String(selection.customSizeInches),
    };
  }
  return { size: selection.sizeInterest };
}

export function ConfigureClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("size");
  const [selection, setSelection] = useState<SizeSelection | undefined>(() =>
    parseInitialSelection(
      searchParams.get("size"),
      searchParams.get("inches"),
    ),
  );
  const [hex, setHex] = useState(DEFAULT_HEX);

  // Keep size step in sync if query changes (e.g. trust-chip deep link).
  useEffect(() => {
    const next = parseInitialSelection(
      searchParams.get("size"),
      searchParams.get("inches"),
    );
    if (next) setSelection(next);
  }, [searchParams]);

  const previewHex = useMemo(() => normalizeHex(hex) ?? DEFAULT_HEX, [hex]);
  const sizeLabel = formatSizeLabel(
    selection?.sizeInterest,
    selection?.sizeInterest === "custom"
      ? selection.customSizeInches
      : undefined,
  );

  function goToReview() {
    if (!selection) return;
    const safe = normalizeHex(hex) ?? DEFAULT_HEX;
    const params = new URLSearchParams({
      ...selectionToQuery(selection),
      hex: safe,
    });
    router.push(`/configure/review?${params.toString()}`);
  }

  return (
    <div className="configure">
      <PeaceSignPreview hex={previewHex} sizeLabel={sizeLabel} sticky />
      {step === "size" ? (
        <SizePicker
          value={selection}
          onChange={setSelection}
          onContinue={() => {
            if (selection) setStep("color");
          }}
        />
      ) : (
        <ColorConfigurator
          hex={hex}
          onChange={setHex}
          onBack={() => setStep("size")}
          onContinue={goToReview}
        />
      )}
    </div>
  );
}

export default ConfigureClient;
