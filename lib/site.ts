export const SITE = {
  name: "AyuLean",
  tagline: "The power of Ayurveda, made for modern life",
  logo: "/img/logo.jpeg",
  phone: "+91 7082042004",
  phoneRaw: "917082042004",
  email: "ayuleanveda@gmail.com",
  address: "Sector 13, Karnal, Haryana 132001, India",
  addressShort: "Sector 13, Karnal, Haryana",
  replacementDays: 7,
  freeShippingAbove: 499,
  shippingFee: 49,
  codFee: 0,
  currency: "₹",
  // Fill these in before issuing invoices to customers.
  gstin: process.env.NEXT_PUBLIC_GSTIN ?? "",
  gstRate: 18,
} as const;
