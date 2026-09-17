import type { MetadataRoute } from "next";
import { SHOP } from "@/lib/shop";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SHOP.siteName} — ${SHOP.storeName}`,
    short_name: SHOP.siteName,
    description: "Boutique de Crocs à Dakar, Sénégal. Paiement à la livraison.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f1",
    theme_color: "#16303d",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
