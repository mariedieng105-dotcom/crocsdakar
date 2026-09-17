"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { SHOP } from "@/lib/shop";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Connexion impossible.");
        setLoading(false);
        return;
      }

      const next = searchParams.get("next") || "/admin";
      router.push(next);
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl card-shadow p-8">
        <div className="flex flex-col items-center mb-6">
          <Image src="/images/logo-placeholder.svg" alt={SHOP.siteName} width={56} height={56} className="rounded-full mb-2" />
          <h1 className="font-display font-bold text-lg text-[var(--color-navy)]">Administration</h1>
          <p className="text-xs text-[var(--color-navy)]/50">{SHOP.siteName} · {SHOP.storeName}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[var(--color-navy)] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-gold)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[var(--color-navy)] mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-navy)]/20 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
