"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { FAMILIES, isFamilyKey } from "@/lib/families";
import { PUBLIC_CATEGORIES, categoryLabel, categorySlug } from "@/lib/categories";
import { CloseIcon, SearchIcon } from "@/components/Icons";
import type { SerializedProduct } from "@/lib/serialize";

const SIZE_OPTIONS = [
  "34-35",
  "36-37",
  "37-38",
  "38-39",
  "39-40",
  "41-42",
  "42-43",
  "43-44",
  "45-46",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Nouveautés" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
];

type Filters = {
  q: string;
  famille: string;
  categorie: string;
  size: string;
  sort: string;
};

function buildQuery(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.famille) params.set("famille", filters.famille);
  if (filters.categorie) params.set("categorie", filters.categorie);
  if (filters.size) params.set("size", filters.size);
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  return params.toString();
}

export default function CatalogueClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>({
    q: searchParams.get("q") || "",
    famille: isFamilyKey(searchParams.get("famille")) ? searchParams.get("famille")! : "",
    categorie: searchParams.get("categorie") || "",
    size: searchParams.get("size") || "",
    sort: searchParams.get("sort") || "newest",
  });

  const [products, setProducts] = useState<SerializedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const set = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const query = useMemo(() => buildQuery(filters), [filters]);

  useEffect(() => {
    // Un court délai évite de lancer une requête à chaque frappe dans la
    // recherche, tout en gardant les filtres instantanés.
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?${query}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
      router.replace(query ? `/catalogue?${query}` : "/catalogue", { scroll: false });
    }, 220);

    return () => clearTimeout(handle);
  }, [query, router]);

  const activeCount =
    (filters.q ? 1 : 0) +
    (filters.famille ? 1 : 0) +
    (filters.categorie ? 1 : 0) +
    (filters.size ? 1 : 0);

  const reset = () =>
    setFilters({ q: "", famille: "", categorie: "", size: "", sort: "newest" });

  return (
    <div className="cd-container py-10 sm:py-14">
      <header className="mb-8">
        <p className="cd-eyebrow text-[var(--cd-gold-700)]">Boutique</p>
        <h1 className="cd-display cd-display-l mt-3">Tous les modèles</h1>
        <p className="cd-lead mt-3">
          Cherchez un modèle, filtrez par famille ou par pointure, et commandez en quelques clics.
        </p>
      </header>

      <div className="flex flex-col gap-5 pb-6 border-b border-[var(--cd-rule)]">
        <div className="flex items-center gap-3 border-b border-[var(--cd-rule)] pb-3 max-w-xl">
          <SearchIcon className="w-5 h-5 shrink-0 text-[var(--cd-ink-faint)]" />
          <label htmlFor="catalogue-search" className="sr-only">
            Rechercher un modèle
          </label>
          <input
            id="catalogue-search"
            type="search"
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Rechercher un modèle, une couleur…"
            className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-[var(--cd-ink-faint)]"
          />
        </div>

        <FilterRow label="Famille">
          <Chip active={!filters.famille} onClick={() => set("famille", "")}>
            Toutes
          </Chip>
          {FAMILIES.map((family) => (
            <Chip
              key={family.key}
              active={filters.famille === family.key}
              onClick={() => set("famille", filters.famille === family.key ? "" : family.key)}
            >
              {family.label}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Catégorie">
          <Chip active={!filters.categorie} onClick={() => set("categorie", "")}>
            Toutes
          </Chip>
          {PUBLIC_CATEGORIES.map((category) => {
            const slug = categorySlug(category);
            return (
              <Chip
                key={category}
                active={filters.categorie === slug}
                onClick={() => set("categorie", filters.categorie === slug ? "" : slug)}
              >
                {categoryLabel(category)}
              </Chip>
            );
          })}
        </FilterRow>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2.5">
            <label htmlFor="catalogue-size" className="cd-eyebrow text-[0.62rem] text-[var(--cd-ink-faint)]">
              Pointure
            </label>
            <select
              id="catalogue-size"
              value={filters.size}
              onChange={(e) => set("size", e.target.value)}
              className="border border-[var(--cd-rule)] bg-transparent px-3 py-2 text-sm"
            >
              <option value="">Toutes</option>
              {SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2.5">
            <label htmlFor="catalogue-sort" className="cd-eyebrow text-[0.62rem] text-[var(--cd-ink-faint)]">
              Trier
            </label>
            <select
              id="catalogue-sort"
              value={filters.sort}
              onChange={(e) => set("sort", e.target.value)}
              className="border border-[var(--cd-rule)] bg-transparent px-3 py-2 text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={reset}
              className="cd-eyebrow text-[0.62rem] text-[var(--cd-gold-700)] flex items-center gap-1.5 ml-auto"
            >
              <CloseIcon className="w-3.5 h-3.5" />
              Tout effacer
            </button>
          )}
        </div>
      </div>

      <p className="cd-eyebrow text-[0.62rem] text-[var(--cd-ink-faint)] py-5" role="status">
        {loading
          ? "Recherche en cours…"
          : products.length === 0
          ? "Aucun résultat"
          : `${products.length} modèle${products.length > 1 ? "s" : ""}`}
      </p>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-9 sm:gap-x-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="border border-dashed border-[var(--cd-rule)] p-12 text-center">
            <p className="cd-display cd-display-m">Rien ne correspond</p>
            <p className="text-[var(--cd-ink-soft)] mt-3 mb-6">
              Essayez une autre recherche ou retirez un filtre.
            </p>
            <button type="button" onClick={reset} className="cd-btn cd-btn--ghost">
              Effacer les filtres
            </button>
          </div>
        )
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="cd-eyebrow text-[0.62rem] text-[var(--cd-ink-faint)] pt-2.5 w-[4.5rem] shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cd-eyebrow text-[0.62rem] px-3.5 py-2 border transition-colors ${
        active
          ? "bg-[var(--cd-navy-800)] text-white border-[var(--cd-navy-800)]"
          : "border-[var(--cd-rule)] text-[var(--cd-ink)] hover:border-[var(--cd-navy-800)]"
      }`}
    >
      {children}
    </button>
  );
}
