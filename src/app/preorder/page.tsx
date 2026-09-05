import type { Metadata } from "next";
import { PreorderForm } from "@/components/PreorderForm";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: "Pre-order",
  description: "Join the BuyPeaceSign early-access list. No charge today.",
};

export default function PreorderPage() {
  return (
    <div>
      <h1 className="page-title">{copy.landing.preorderCard.title}</h1>
      <p className="page-body">{copy.landing.preorderCard.helper}</p>
      <div className="preorder-card" style={{ marginTop: "1rem" }}>
        <PreorderForm source="landing" />
      </div>
    </div>
  );
}
