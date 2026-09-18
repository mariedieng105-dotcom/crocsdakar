import { SHOP, REASSURANCE } from "@/lib/shop";
import { REASSURANCE_ICONS, PinIcon } from "@/components/Icons";

/**
 * Bandeau haut. Sur mobile il ne garde que l'argument le plus décisif pour un
 * acheteur à Dakar (le paiement à la livraison) ; les autres apparaissent dès
 * qu'il y a la place, et la ville s'affiche en bout de ligne sur grand écran.
 */
export default function AnnouncementBar() {
  return (
    <div className="bg-[var(--cd-navy-900)] text-[var(--cd-on-navy)]">
      <div className="cd-container flex items-center justify-between gap-6 py-2.5">
        <ul className="flex items-center gap-7 min-w-0">
          {REASSURANCE.slice(0, 3).map((item, index) => {
            const Icon = REASSURANCE_ICONS[item.icon];
            return (
              <li
                key={item.title}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  index === 0 ? "" : index === 1 ? "hidden sm:flex" : "hidden lg:flex"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 text-[var(--cd-gold-500)]" />
                <span className="text-[12.5px] tracking-wide">
                  {item.title} <span className="text-[var(--cd-on-navy-soft)]">{item.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>

        <p className="hidden md:flex items-center gap-2 text-[12.5px] text-[var(--cd-on-navy-soft)] whitespace-nowrap">
          <PinIcon className="w-4 h-4 text-[var(--cd-gold-500)]" />
          {SHOP.city}, {SHOP.country}
        </p>
      </div>
    </div>
  );
}
