import Link from "next/link";
import { SHOP, NAV_LINKS, whatsappLink } from "@/lib/shop";
import { PinIcon, WhatsAppGlyph } from "@/components/Icons";

const SOCIAL = [
  { href: SHOP.instagram, label: "Instagram" },
  { href: SHOP.tiktok, label: "TikTok" },
  { href: SHOP.snapchat, label: "Snapchat" },
];

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 4h3.5l1.6 4-2.1 1.5a12 12 0 0 0 5.5 5.5L15 12.9l4 1.6V18a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 3 6.2 2 2 0 0 1 5 4z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.8 7 8.2 6 8.2-6" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer id="contact" className="bg-[var(--cd-navy-800)] text-[var(--cd-on-navy)]">
      <div className="cd-container pt-14 pb-10 sm:pt-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:gap-12">
          <div>
            <p className="cd-display cd-display-m text-white">{SHOP.siteName}</p>
            <p className="cd-eyebrow text-[var(--cd-gold-500)] mt-2">{SHOP.storeName}</p>
            <p className="mt-5 text-sm text-[var(--cd-on-navy-soft)] max-w-[34ch] leading-relaxed">
              Des Crocs originaux pour tous les styles, toutes les occasions. Choisissez votre
              modèle et votre pointure, commandez en ligne, payez à la livraison.
            </p>
          </div>

          <nav aria-label="Liens rapides">
            <h2 className="cd-eyebrow text-[var(--cd-gold-500)] mb-4">Liens rapides</h2>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[var(--cd-on-navy-soft)] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="cd-eyebrow text-[var(--cd-gold-500)] mb-4">Informations</h2>
            <ul className="space-y-2.5 text-sm text-[var(--cd-on-navy-soft)]">
              <li>Livraison partout au Sénégal</li>
              <li>Paiement à la livraison</li>
              <li>Produits 100 % originaux</li>
              <li>
                <Link
                  href="/admin/login"
                  className="hover:text-white transition-colors"
                >
                  Espace administrateur
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="cd-eyebrow text-[var(--cd-gold-500)] mb-4">Contact</h2>
            <ul className="space-y-3 text-sm text-[var(--cd-on-navy-soft)]">
              <li className="flex items-center gap-2.5">
                <PinIcon className="w-4 h-4 shrink-0 text-[var(--cd-gold-500)]" />
                {SHOP.city}, {SHOP.country}
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneIcon className="w-4 h-4 shrink-0 text-[var(--cd-gold-500)]" />
                <a href={`tel:+${SHOP.whatsappNumber}`} className="hover:text-white transition-colors">
                  {SHOP.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MailIcon className="w-4 h-4 shrink-0 text-[var(--cd-gold-500)]" />
                <a
                  href={`mailto:${SHOP.email}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {SHOP.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <WhatsAppGlyph className="w-4 h-4 shrink-0 text-[var(--cd-gold-500)]" />
                <a
                  href={whatsappLink(`Bonjour ${SHOP.storeName}, j'ai une question.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Discuter sur WhatsApp
                </a>
              </li>
            </ul>

            <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-6">
              {SOCIAL.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cd-eyebrow text-[0.68rem] text-[var(--cd-on-navy-soft)] hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="cd-script text-[var(--cd-gold-300)] text-[1.7rem] mt-12 lg:text-right">
          Plus qu&rsquo;une paire, un style de vie
        </p>
      </div>

      <div className="border-t border-white/10">
        <div className="cd-container py-5 flex flex-col sm:flex-row gap-2 sm:justify-between text-[12.5px] text-[var(--cd-on-navy-soft)]">
          <p>
            © {new Date().getFullYear()} {SHOP.siteName} — {SHOP.storeName}. Tous droits réservés.
          </p>
          <p>
            {SHOP.city}, {SHOP.country} — Paiement à la livraison
          </p>
        </div>
      </div>
    </footer>
  );
}
