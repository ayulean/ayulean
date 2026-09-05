export const SITE = {
  name: "Angad Ayurveda",
  tagline: "The power of Ayurveda, made for modern life",
  logo: "/img/angad-logo.jpeg",
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

/**
 * Regulatory details a payment gateway's risk team looks for before it will
 * approve an Ayurvedic / nutraceutical seller, and that Legal Metrology rules
 * require on the listing of a packaged food supplement.
 *
 * Every field is optional: whatever is left blank is simply not rendered, so
 * nothing here can ever display a licence number the business does not hold.
 * Fill them in via the environment (see `.env.example`) once the licences are
 * in hand — see README §"Payment gateway onboarding".
 */
export const COMPLIANCE = {
  /** Registered legal entity, e.g. "Angad Ayurveda Pvt. Ltd." or the proprietor's name. */
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? "",
  /** 14-digit FSSAI licence number of the seller/marketer. */
  fssai: process.env.NEXT_PUBLIC_FSSAI ?? "",
  /** AYUSH / State Drug Controller Ayurvedic manufacturing licence number. */
  ayushLicence: process.env.NEXT_PUBLIC_AYUSH_LICENCE ?? "",
  /** Manufacturer name and full address, as printed on the label. */
  manufacturer: process.env.NEXT_PUBLIC_MANUFACTURER ?? "",
  manufacturerAddress: process.env.NEXT_PUBLIC_MANUFACTURER_ADDRESS ?? "",
  /** Manufacturer's own FSSAI number, when the product is made on contract. */
  manufacturerFssai: process.env.NEXT_PUBLIC_MANUFACTURER_FSSAI ?? "",
  countryOfOrigin: process.env.NEXT_PUBLIC_COUNTRY_OF_ORIGIN ?? "India",
} as const;

/** Label/value pairs for the filled-in compliance fields only. */
export function complianceRows(): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Sold & marketed by", value: COMPLIANCE.legalName || SITE.name },
    { label: "Registered address", value: SITE.address },
    { label: "FSSAI licence no.", value: COMPLIANCE.fssai },
    { label: "AYUSH licence no.", value: COMPLIANCE.ayushLicence },
    { label: "GSTIN", value: SITE.gstin },
    { label: "Manufactured by", value: COMPLIANCE.manufacturer },
    { label: "Manufacturer address", value: COMPLIANCE.manufacturerAddress },
    { label: "Manufacturer FSSAI no.", value: COMPLIANCE.manufacturerFssai },
    { label: "Country of origin", value: COMPLIANCE.countryOfOrigin },
  ];
  return rows.filter((r) => r.value.trim().length > 0);
}
