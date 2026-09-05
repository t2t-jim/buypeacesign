"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PeaceSignPreview } from "@/components/PeaceSignPreview";
import { SizePicker, type ProductSize } from "@/components/SizePicker";
import { ColorConfigurator } from "@/components/ColorConfigurator";
import { DEFAULT_HEX } from "@/content/swatches";
import { normalizeHex } from "@/lib/waitlist";

type Step = "size" | "color";

export function ConfigureClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("size");
  const [size, setSize] = useState<ProductSize | undefined>();
  const [hex, setHex] = useState(DEFAULT_HEX);

  const previewHex = useMemo(() => normalizeHex(hex) ?? DEFAULT_HEX, [hex]);
  const sizeLabel = size ? `${size}"` : undefined;

  function goToReview() {
    if (!size) return;
    const safe = normalizeHex(hex) ?? DEFAULT_HEX;
    const params = new URLSearchParams({ size, hex: safe });
    router.push(`/configure/review?${params.toString()}`);
  }

  return (
    <div className="configure">
      <PeaceSignPreview hex={previewHex} sizeLabel={sizeLabel} sticky />
      {step === "size" ? (
        <SizePicker
          value={size}
          onChange={setSize}
          onContinue={() => setStep("color")}
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
