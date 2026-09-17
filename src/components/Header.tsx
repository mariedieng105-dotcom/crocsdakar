"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { SHOP } from "@/lib/shop";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/catalogue?sort=newest", label: "Nouveautés" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/catalogue?q=${encodeURIComponent(q)}` : "/catalogue");
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-cream)]/95 backdrop-blur border-b border-[var(--color-gold)]/30">
      <div className="container-shop flex items-center gap-4 py-3">
        <button
          className="lg:hidden p-2 -ml-2 text-[var(--color-navy)]"
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={`${SHOP.siteName} - Accueil`}>
          <Image
            src="/images/logo.jpg"
            alt={`Logo ${SHOP.siteName} - ${SHOP.storeName}`}
            width={160}
            height={87}
            priority
            className="h-12 w-auto object-contain"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-6 ml-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium hover:text-[var(--color-gold-dark)] transition-colors ${
                pathname === link.href ? "text-[var(--color-gold-dark)]" : "text-[var(--color-navy)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="hidden md:flex items-center flex-1 max-w-sm ml-auto">
          <label htmlFor="header-search" className="sr-only">
            Rechercher un produit
          </label>
          <div className="flex items-center w-full rounded-full border border-[var(--color-navy)]/20 bg-white px-3 py-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-navy)]/60 shrink-0">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m21 21-4.3-4.3" />
            </svg>
            <input
              id="header-search"
              type="search"
              placeholder="Rechercher un modèle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-sm px-2 text-[var(--color-navy)] placeholder:text-[var(--color-navy)]/40"
            />
          </div>
        </form>

        <Link
          href="/panier"
          className="relative ml-auto md:ml-2 p-2 text-[var(--color-navy)]"
          aria-label="Voir le panier"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 8h12l-1 12.5a1.5 1.5 0 01-1.5 1.5h-7a1.5 1.5 0 01-1.5-1.5L6 8z" />
            <path strokeLinecap="round" d="M9 8V6a3 3 0 016 0v2" />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-[var(--color-gold)] text-white text-[11px] font-bold">
              {itemCount}
            </span>
          )}
        </Link>
      </div>

      <form onSubmit={submitSearch} className="md:hidden px-4 pb-3">
        <div className="flex items-center w-full rounded-full border border-[var(--color-navy)]/20 bg-white px-3 py-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-navy)]/60 shrink-0">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Rechercher un modèle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm px-2 text-[var(--color-navy)] placeholder:text-[var(--color-navy)]/40"
            aria-label="Rechercher un produit"
          />
        </div>
      </form>

      {menuOpen && (
        <nav className="lg:hidden border-t border-[var(--color-gold)]/30 bg-[var(--color-cream)] px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-base font-medium text-[var(--color-navy)] border-b border-[var(--color-navy)]/5 last:border-b-0"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
