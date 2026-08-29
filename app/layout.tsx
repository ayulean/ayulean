import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import { CartProvider } from "@/components/CartProvider";
import { SITE_URL } from "@/lib/env";
import { SITE } from "@/lib/site";

const sans = Plus_Jakarta_Sans({ variable: "--font-sans-custom", subsets: ["latin"] });
const display = Fraunces({ variable: "--font-display-custom", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — Ayurvedic Supplement`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "AyuLean Ayurvedic Supplement — 100% herbal formula for metabolism, digestion and daily energy. Cash on Delivery, online payment aur 7-day easy replacement.",
  icons: { icon: SITE.logo },
  openGraph: {
    title: `${SITE.name} — Ayurvedic Supplement`,
    description: "100% herbal formula for metabolism, digestion and daily energy.",
    type: "website",
    siteName: SITE.name,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white">
        <CartProvider>{children}</CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
