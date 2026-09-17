"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-sm font-medium bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 disabled:opacity-50"
    >
      {loading ? "..." : "Se déconnecter"}
    </button>
  );
}
