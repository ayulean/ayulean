import type { Metadata } from "next";
import CheckoutClient from "@/components/CheckoutClient";
import { onlinePaymentEnabled } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutClient onlineEnabled={onlinePaymentEnabled} />;
}
