"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import type { SerializedProduct } from "@/lib/serialize";

const SIZE_OPTIONS = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];

export default function CatalogueClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [model, setModel] = useState(searchParams.get("model") || "");
  const [size, setSize] = useState(searchParams.get("size") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const [products, setProducts] = useState<SerializedProduct[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products/models")
      .then((r) => r.json())
      .then((data) => setModels(data.models || []))
      .catch(() => setModels([]));
  }, []);

  const fetchProducts = useCallback(async (params: { q: string; model: string; size: string; sort: string }) => {
    setLoading(true);
    const searchParamsObj = new URLSearchParams();
    if (params.q) searchParamsObj.set("q", params.q);
    if (params.model) searchParamsObj.set("model", params.model);
    if (params.size) searchParamsObj.set("size", params.size);
    if (params.sort) searchParamsObj.set("sort", params.sort);

    try {
      const res = await fetch(`/api/products?${searchParamsObj.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchProducts({ q, model, size, sort });
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (model) params.set("model", model);
      if (size) params.set("size", size);
      if (sort && sort !== "newest") params.set("sort", sort);
      const qs = params.toString();
      router.replace(qs ? `/catalogue?${qs}` : "/catalogue", { scroll: false });
    }, 250);
    return () => clearTimeout(handle);
  }, [q, model, size, sort, fetchProducts, router]);

  const resultLabel = useMemo(() => {
    if (loading) return "Recherche en cours...";
    if (products.length === 0) return "Aucun produit trouvé.";
    return `${products.length} produit${products.length > 1 ? "s" : ""} trouvé${products.length > 1 ? "s" : ""}`;
  }, [loading, products.length]);

  return (
    <div className="container-shop py-10">
      <h1 className="font-display font-bold text-3xl text-[var(--color-navy)] mb-2">Catalogue Crocs</h1>
      <p className="text-[var(--color-navy)]/60 mb-8">
        Trouvez votre modèle de Crocs à Dakar : recherchez, filtrez par pointure et triez par prix.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <label className="sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Rechercher</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (nom ou modèle)..."
            className="w-full rounded-full border border-[var(--color-navy)]/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--color-gold)]"
          />
        </label>

        <label>
          <span className="sr-only">Modèle</span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-full border border-[var(--color-navy)]/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--color-gold)]"
          >
            <option value="">Tous les modèles</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Pointure</span>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full rounded-full border border-[var(--color-navy)]/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--color-gold)]"
          >
            <option value="">Toutes les pointures</option>
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Trier</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full rounded-full border border-[var(--color-navy)]/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--color-gold)]"
          >
            <option value="newest">Nouveaux arrivages</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </select>
        </label>
      </div>

      <p className="text-sm text-[var(--color-navy)]/50 mb-4" role="status">{resultLabel}</p>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="rounded-2xl border border-dashed border-[var(--color-navy)]/20 p-10 text-center text-[var(--color-navy)]/60">
            Aucun produit ne correspond à votre recherche pour le moment.
          </div>
        )
      )}
    </div>
  );
}
