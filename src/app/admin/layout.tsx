import Image from "next/image";
import { getAdminSession } from "@/lib/auth";
import { SHOP } from "@/lib/shop";
import LogoutButton from "@/components/admin/LogoutButton";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    return <div className="min-h-screen bg-[var(--cd-bg)]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--cd-bg)] flex flex-col lg:flex-row">
      <aside className="lg:w-60 bg-[var(--cd-navy-900)] text-[var(--cd-on-navy)] flex lg:flex-col shrink-0">
        <div className="px-5 py-6 border-b border-white/10 hidden lg:flex items-center gap-3">
          <Image
            src="/images/logo-badge.jpg"
            alt=""
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <span className="min-w-0">
            <span className="cd-eyebrow text-[0.58rem] text-[var(--cd-gold-500)] block">
              Administration
            </span>
            <span className="block text-sm font-semibold truncate">{SHOP.siteName}</span>
          </span>
        </div>

        <AdminNav />

        <div className="px-5 py-5 border-t border-white/10 hidden lg:flex flex-col gap-3">
          <p className="text-xs text-[var(--cd-on-navy-soft)] truncate">{session.email}</p>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1 p-4 sm:p-8 lg:p-10 min-w-0">
        <div className="lg:hidden flex justify-end mb-4">
          <LogoutButton tone="light" />
        </div>
        <div className="max-w-5xl">{children}</div>
      </div>
    </div>
  );
}
