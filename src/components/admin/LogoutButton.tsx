"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Le bouton apparaît sur le bandeau marine en grand écran et sur le fond crème
// en mobile : les deux tons évitent un bouton invisible sur l'un des deux.
export default function LogoutButton({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const className =
    tone === "dark"
      ? "border-white/25 text-[var(--cd-on-navy)] hover:bg-white/10"
      : "border-[var(--cd-rule)] text-[var(--cd-navy-800)] hover:border-[var(--cd-navy-800)]";

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`cd-eyebrow text-[0.6rem] border px-4 py-2.5 transition-colors disabled:opacity-50 ${className}`}
    >
      {loading ? "…" : "Se déconnecter"}
    </button>
  );
}
