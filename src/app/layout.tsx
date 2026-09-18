import type { Metadata } from "next";
import { Archivo, Karla, Caveat } from "next/font/google";
import "./globals.css";
import { SHOP } from "@/lib/shop";
import { CartProvider } from "@/components/CartProvider";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

// Archivo pour les titres en capitales, Karla pour le texte courant,
// Caveat pour les signatures manuscrites de la direction artistique.
const displayFont = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const bodyFont = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const scriptFont = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SHOP.siteUrl),
  title: {
    default: `${SHOP.siteName} — Crocs originaux à Dakar | ${SHOP.storeName}`,
    template: `%s | ${SHOP.siteName}`,
  },
  description:
    "CrocsDakar (Diaby Store) : la boutique de référence pour acheter des Crocs à Dakar, Sénégal. Large choix de modèles et pointures, commande facile, paiement à la livraison, livraison rapide à Dakar.",
  keywords: [
    "Crocs Dakar",
    "Crocs Sénégal",
    "acheter Crocs Dakar",
    "Diaby Store",
    "CrocsDakar",
    "chaussures Dakar",
    "sandales Dakar",
  ],
  authors: [{ name: SHOP.storeName }],
  openGraph: {
    type: "website",
    locale: "fr_SN",
    url: SHOP.siteUrl,
    siteName: SHOP.siteName,
    title: `${SHOP.siteName} — Crocs originaux à Dakar | ${SHOP.storeName}`,
    description:
      "Découvrez les Crocs disponibles chez Diaby Store à Dakar. Choisissez votre modèle et votre pointure, commandez en ligne, paiement à la livraison.",
    images: ["/images/logo.jpg"],
  },
  twitter: {
    card: "summary",
    title: `${SHOP.siteName} — Crocs originaux à Dakar`,
    description: "La boutique Diaby Store pour acheter des Crocs à Dakar, Sénégal.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ShoeStore",
  name: SHOP.storeName,
  alternateName: SHOP.siteName,
  description:
    "Boutique de Crocs à Dakar, Sénégal. Large choix de modèles et pointures, paiement à la livraison.",
  url: SHOP.siteUrl,
  telephone: `+${SHOP.whatsappNumber}`,
  email: SHOP.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: SHOP.city,
    addressCountry: "SN",
  },
  sameAs: [SHOP.instagram, SHOP.tiktok, SHOP.snapchat],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${displayFont.variable} ${bodyFont.variable} ${scriptFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppFloatingButton />
        </CartProvider>
      </body>
    </html>
  );
}
