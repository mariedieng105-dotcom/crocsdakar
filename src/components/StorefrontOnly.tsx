"use client";

import { usePathname } from "next/navigation";

/**
 * L'administration est une application à part : elle ne doit pas hériter de
 * l'en-tête, du pied de page ni du bouton WhatsApp de la boutique, qui
 * partagent pourtant le même layout racine.
 */
export default function StorefrontOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
