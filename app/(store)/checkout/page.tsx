import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CheckoutClient from "@/components/CheckoutClient";
import { accountsEnabled, currentProfile, currentUser } from "@/lib/auth-customer";
import { onlinePaymentEnabled } from "@/lib/razorpay";

/**
 * A personal page: it exists only for the signed-in customer, or for one
 * specific order. There is no shared shell worth prerendering, so it blocks on
 * the server rather than streaming an empty frame first.
 */
export const instant = false;

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  // Like Flipkart and Amazon, browsing and the cart stay open to everyone and
  // the account is only required at checkout. When accounts are not configured
  // yet, guest checkout keeps the store working.
  if (accountsEnabled) {
    const user = await currentUser();
    if (!user) redirect("/account/login?next=/checkout");
  }

  const profile = accountsEnabled ? await currentProfile() : null;

  return (
    <CheckoutClient
      onlineEnabled={onlinePaymentEnabled}
      defaults={{
        name: profile?.full_name ?? "",
        phone: profile?.phone ?? "",
        address: profile?.address ?? "",
        city: profile?.city ?? "",
        state: profile?.state ?? "",
        pincode: profile?.pincode ?? "",
      }}
    />
  );
}
