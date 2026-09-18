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

export const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/catalogue", label: "Boutique" },
  { href: "/a-propos", label: "À propos" },
  { href: "/#contact", label: "Contact" },
];

/** Arguments de réassurance, repris du bandeau haut et du bas de page. */
export const REASSURANCE = [
  { title: "Produits", detail: "100 % originaux", icon: "crown" as const },
  { title: "Livraison", detail: "partout au Sénégal", icon: "truck" as const },
  { title: "Paiement", detail: "à la livraison", icon: "card" as const },
  { title: "Service client", detail: "réactif", icon: "support" as const },
];

function groupDigits(amount: number): string {
  // Espace insécable fine entre les milliers, pour éviter une coupure de ligne
  // au milieu d'un prix.
  return amount.toLocaleString("fr-FR").replace(/ |\s|,/g, " ");
}

export function formatFCFA(amount: number): string {
  return `${groupDigits(amount)} FCFA`;
}

/** Format court utilisé sur les cartes et les fiches produit. */
export function formatPriceShort(amount: number | null): string {
  return amount === null ? PRICE_TBD_LABEL : `${groupDigits(amount)} F`;
}

export function formatPrice(amount: number | null): string {
  return amount === null ? PRICE_TBD_LABEL : formatFCFA(amount);
}

export function whatsappLink(message: string, phone: string = SHOP.whatsappNumber): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
