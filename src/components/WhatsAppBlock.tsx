import { SHOP, whatsappLink } from "@/lib/shop";
import { WhatsAppGlyph, ArrowRightIcon } from "@/components/Icons";

/** Dernier appel à l'action de l'accueil, juste avant le pied de page. */
export default function WhatsAppBlock() {
  return (
    <section className="cd-container py-14 sm:py-20">
      <a
        href={whatsappLink(
          `Bonjour ${SHOP.storeName}, je souhaite commander une paire de Crocs.`
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="group bg-[var(--cd-navy-800)] text-white p-6 sm:p-8 flex items-center gap-5"
      >
        <span className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-[var(--cd-whatsapp)]">
          <WhatsAppGlyph className="w-7 h-7 text-white" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="cd-display block text-[1.05rem] sm:text-[1.3rem]">
            Commandez sur WhatsApp
          </span>
          <span className="cd-num block text-[0.9rem] text-[var(--cd-on-navy-soft)] mt-1.5">
            {SHOP.phoneDisplay}
          </span>
        </span>
        <ArrowRightIcon className="w-6 h-6 shrink-0 transition-transform group-hover:translate-x-1" />
      </a>
    </section>
  );
}
