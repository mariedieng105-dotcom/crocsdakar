"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/import-catalogue", label: "Import catalogue" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex lg:flex-col flex-1 overflow-x-auto lg:overflow-visible">
      {LINKS.map((link) => {
        // « /admin » ne doit pas rester actif sur toutes les sous-pages.
        const active =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`cd-ad-nav__link ${active ? "cd-ad-nav__link--active" : ""}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
