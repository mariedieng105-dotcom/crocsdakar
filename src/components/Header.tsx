"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { SHOP, NAV_LINKS, whatsappLink } from "@/lib/shop";
import {
  SearchIcon,
  BagIcon,
  MenuIcon,
  CloseIcon,
  WhatsAppGlyph,
  ArrowRightIcon,
} from "@/components/Icons";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const path = href.split("?")[0].split("#")[0];
  return path !== "/" && pathname.startsWith(path);
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const closePanels = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  };

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/catalogue?q=${encodeURIComponent(q)}` : "/catalogue");
    setSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--cd-bg)]/95 backdrop-blur-sm border-b border-[var(--cd-rule)]">
      <div className="cd-container flex items-center gap-3 sm:gap-5 h-[68px] sm:h-[84px]">
        <button
          type="button"
          className="lg:hidden -ml-2 p-2 text-[var(--cd-navy-800)]"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          onClick={() => {
            setMenuOpen((v) => !v);
            setSearchOpen(false);
          }}
        >
          {menuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>

        <Link
          href="/"
          className="shrink-0"
          aria-label={`${SHOP.siteName} — Accueil`}
        >
          <Image
            src="/images/logo-badge.jpg"
            alt={`Logo ${SHOP.siteName} — ${SHOP.storeName}`}
            width={560}
            height={560}
            priority
            className="w-12 h-12 sm:w-[60px] sm:h-[60px] rounded-full object-cover"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-8 ml-4">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`cd-eyebrow text-[0.72rem] pb-1 border-b transition-colors ${
                  active
                    ? "text-[var(--cd-gold-700)] border-[var(--cd-gold-600)]"
                    : "text-[var(--cd-navy-800)] border-transparent hover:border-[var(--cd-gold-300)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          <button
            type="button"
            onClick={() => {
              setSearchOpen((v) => !v);
              setMenuOpen(false);
            }}
            aria-label="Rechercher un modèle"
            aria-expanded={searchOpen}
            className="p-2 text-[var(--cd-navy-800)] hover:text-[var(--cd-gold-700)] transition-colors"
          >
            <SearchIcon className="w-[22px] h-[22px]" />
          </button>

          <Link
            href="/panier"
            aria-label={
              itemCount > 0 ? `Voir le panier, ${itemCount} article(s)` : "Voir le panier"
            }
            className="relative p-2 text-[var(--cd-navy-800)] hover:text-[var(--cd-gold-700)] transition-colors"
          >
            <BagIcon className="w-[22px] h-[22px]" />
            {itemCount > 0 && (
              <span className="cd-num absolute top-0 right-0 flex items-center justify-center h-[18px] min-w-[18px] px-1 rounded-full bg-[var(--cd-navy-800)] text-white text-[10px] font-semibold">
                {itemCount}
              </span>
            )}
          </Link>

        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-[var(--cd-rule)] bg-[var(--cd-bg)]">
          <form onSubmit={submitSearch} className="cd-container py-4 flex items-center gap-3">
            <SearchIcon className="w-5 h-5 text-[var(--cd-ink-faint)] shrink-0" />
            <label htmlFor="header-search" className="sr-only">
              Rechercher un modèle
            </label>
            <input
              id="header-search"
              ref={searchInputRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un modèle, une couleur…"
              className="flex-1 min-w-0 bg-transparent outline-none text-base placeholder:text-[var(--cd-ink-faint)]"
            />
            <button
              type="submit"
              className="cd-eyebrow text-[0.7rem] text-[var(--cd-gold-700)] shrink-0 flex items-center gap-1.5"
            >
              Voir <ArrowRightIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Fermer la recherche"
              className="p-1 text-[var(--cd-ink-faint)] hover:text-[var(--cd-navy-800)] shrink-0"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <nav className="lg:hidden border-t border-[var(--cd-rule)] bg-[var(--cd-bg)]">
          <div className="cd-container py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closePanels}
                className="flex items-center justify-between py-3.5 border-b border-[var(--cd-rule)] last:border-b-0 cd-eyebrow text-[0.78rem] text-[var(--cd-navy-800)]"
              >
                {link.label}
                <ArrowRightIcon className="w-4 h-4 text-[var(--cd-gold-600)]" />
              </Link>
            ))}
            <a
              href={whatsappLink(
                `Bonjour ${SHOP.storeName}, je souhaite des renseignements sur vos Crocs.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closePanels}
              className="cd-btn cd-btn--whatsapp w-full my-4"
            >
              <WhatsAppGlyph className="w-4 h-4" />
              Commander sur WhatsApp
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
