import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { SHOP } from "@/lib/shop";
import LogoutButton from "@/components/admin/LogoutButton";

export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    return <div className="min-h-screen bg-[var(--color-cream)]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream-dark)] flex flex-col lg:flex-row">
      <aside className="lg:w-64 bg-[var(--color-navy)] text-white flex lg:flex-col shrink-0">
        <div className="p-5 border-b border-white/10 hidden lg:block">
          <p className="font-display font-bold">{SHOP.siteName}</p>
          <p className="text-xs text-[var(--color-gold)]">Administration</p>
        </div>
        <nav className="flex lg:flex-col flex-1 overflow-x-auto lg:overflow-visible">
          <Link href="/admin" className="px-5 py-3 text-sm font-medium hover:bg-white/10 whitespace-nowrap">
            Tableau de bord
          </Link>
          <Link href="/admin/produits" className="px-5 py-3 text-sm font-medium hover:bg-white/10 whitespace-nowrap">
            Produits
          </Link>
          <Link href="/admin/commandes" className="px-5 py-3 text-sm font-medium hover:bg-white/10 whitespace-nowrap">
            Commandes
          </Link>
        </nav>
        <div className="p-5 border-t border-white/10 hidden lg:flex flex-col gap-2">
          <p className="text-xs text-white/50 truncate">{session.email}</p>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-8">
        <div className="lg:hidden flex justify-end mb-4">
          <LogoutButton />
        </div>
        {children}
      </main>
    </div>
  );
}
