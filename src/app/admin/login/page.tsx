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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/logo-badge.jpg"
            alt=""
            width={72}
            height={72}
            className="w-18 h-18 rounded-full object-cover"
          />
          <p className="cd-eyebrow text-[var(--cd-gold-700)] mt-5">Administration</p>
          <h1 className="cd-display cd-display-m mt-2">{SHOP.siteName}</h1>
          <p className="text-xs text-[var(--cd-ink-faint)] mt-1">{SHOP.storeName}</p>
        </div>

        <form onSubmit={handleSubmit} className="cd-ad-card flex flex-col gap-5 mt-8">
          <div>
            <label htmlFor="email" className="cd-ad-label">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cd-ad-field"
            />
          </div>
          <div>
            <label htmlFor="password" className="cd-ad-label">Mot de passe</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cd-ad-field"
            />
          </div>

          {error && <p className="cd-ad-note cd-ad-note--danger" role="alert">{error}</p>}

          <button type="submit" disabled={loading} className="cd-ad-btn cd-ad-btn--solid">
            {loading ? "Connexion…" : "Se connecter"}
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
