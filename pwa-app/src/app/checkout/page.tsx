import { redirect } from "next/navigation";

/** No checkout in market-test — redirect to pre-order. */
export default function CheckoutRedirect() {
  redirect("/preorder");
}
