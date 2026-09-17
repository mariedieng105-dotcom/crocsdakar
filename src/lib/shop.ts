export const SHOP = {
  siteName: "CrocsDakar",
  storeName: "Diaby Store",
  tagline: "HERE IS YOUR SATISFACTION",
  city: "Dakar",
  country: "Sénégal",
  phoneDisplay: "+221 78 381 75 81",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "221783817581",
  email: "diabystore02@gmail.com",
  instagram: "https://www.instagram.com/diaby_store_/",
  tiktok: "https://www.tiktok.com/@crocs_dakar_221",
  snapchat: "https://www.snapchat.com/add/diaby_store",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export const PRICE_TBD_LABEL = "Prix à confirmer";

export function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR").replace(/,/g, " ")} FCFA`;
}

export function formatPrice(amount: number | null): string {
  return amount === null ? PRICE_TBD_LABEL : formatFCFA(amount);
}

export function whatsappLink(message: string, phone: string = SHOP.whatsappNumber): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
