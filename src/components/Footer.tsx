import Link from "next/link";
import Image from "next/image";
import { SHOP, whatsappLink } from "@/lib/shop";

export default function Footer() {
  return (
    <footer id="contact" className="mt-16 bg-[var(--color-navy)] text-[var(--color-cream)]">
      <div className="container-shop py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/images/logo-placeholder.svg"
              alt={`Logo ${SHOP.siteName} - ${SHOP.storeName}`}
              width={48}
              height={48}
              className="rounded-full bg-white/5"
            />
            <div>
              <p className="font-display font-bold tracking-wide">{SHOP.siteName.toUpperCase()}</p>
              <p className="text-xs tracking-[0.15em] text-[var(--color-gold)]">{SHOP.storeName.toUpperCase()}</p>
            </div>
          </div>
          <p className="text-sm text-white/70 italic">&ldquo;{SHOP.tagline}&rdquo;</p>
          <p className="text-sm text-white/60 mt-3">
            Boutique de Crocs à {SHOP.city}, {SHOP.country}. Choisissez votre modèle et votre pointure,
            commandez en ligne, paiement à la livraison.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-[var(--color-gold)]">Navigation</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/" className="hover:text-white">Accueil</Link></li>
            <li><Link href="/catalogue" className="hover:text-white">Catalogue</Link></li>
            <li><Link href="/panier" className="hover:text-white">Mon panier</Link></li>
            <li><Link href="/admin/login" className="hover:text-white">Espace administrateur</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-[var(--color-gold)]">Contact</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>{SHOP.city}, {SHOP.country}</li>
            <li>
              <a href={`tel:+${SHOP.whatsappNumber}`} className="hover:text-white">{SHOP.phoneDisplay}</a>
            </li>
            <li>
              <a href={`mailto:${SHOP.email}`} className="hover:text-white break-all">{SHOP.email}</a>
            </li>
            <li>
              <a href={whatsappLink("Bonjour Diaby Store, j'ai une question.")} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                Discuter sur WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-[var(--color-gold)]">Suivez-nous</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <a href={SHOP.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a>
            </li>
            <li>
              <a href={SHOP.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-white">TikTok</a>
            </li>
            <li>
              <a href={SHOP.snapchat} target="_blank" rel="noopener noreferrer" className="hover:text-white">Snapchat</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-shop py-5 text-xs text-white/50 flex flex-col sm:flex-row gap-2 justify-between">
          <p>© {new Date().getFullYear()} {SHOP.storeName} — {SHOP.siteName}. Tous droits réservés.</p>
          <p>Dakar, Sénégal — Paiement à la livraison</p>
        </div>
      </div>
    </footer>
  );
}
