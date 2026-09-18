import { SHOP, REASSURANCE, whatsappLink } from "@/lib/shop";
import { REASSURANCE_ICONS, WhatsAppGlyph, ArrowRightIcon } from "@/components/Icons";

/** Bandeau de réassurance et appel à la commande WhatsApp, avant le pied de page. */
export default function TrustBar() {
  return (
    <section className="cd-container pb-14 sm:pb-20">
      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <ul className="bg-[var(--cd-bg-alt)] grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-7 p-6 sm:p-8">
          {REASSURANCE.map((item) => {
            const Icon = REASSURANCE_ICONS[item.icon];
            return (
              <li key={item.title} className="flex flex-col gap-2.5">
                <Icon className="w-7 h-7 text-[var(--cd-navy-700)]" />
                <span className="text-[0.84rem] leading-tight">
                  <span className="block font-semibold">{item.title}</span>
                  <span className="text-[var(--cd-ink-soft)]">{item.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>

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
            <span className="cd-eyebrow block text-[var(--cd-gold-500)] text-[0.62rem]">
              Une question ?
            </span>
            <span className="cd-display block text-[1.05rem] sm:text-[1.2rem] mt-1.5">
              Commandez sur WhatsApp
            </span>
            <span className="cd-num block text-[0.9rem] text-[var(--cd-on-navy-soft)] mt-1">
              {SHOP.phoneDisplay}
            </span>
          </span>
          <ArrowRightIcon className="w-6 h-6 shrink-0 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}
