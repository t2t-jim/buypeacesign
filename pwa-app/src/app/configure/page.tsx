import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfigureClient } from "@/components/ConfigureClient";

export const metadata: Metadata = {
  title: "Design yours",
  description:
    "Pick size (36\", 48\", or custom 12–96\") and glow color for your BuyPeaceSign light.",
};

export default function ConfigurePage() {
  return (
    <Suspense fallback={<p className="page-body">Loading design…</p>}>
      <ConfigureClient />
    </Suspense>
  );
}
