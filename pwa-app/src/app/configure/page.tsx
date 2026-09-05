import type { Metadata } from "next";
import { ConfigureClient } from "@/components/ConfigureClient";

export const metadata: Metadata = {
  title: "Design yours",
  description: "Pick size and glow color for your BuyPeaceSign light.",
};

export default function ConfigurePage() {
  return <ConfigureClient />;
}
