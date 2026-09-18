/**
 * Jeu d'icônes au trait, dessinées sur une grille de 24 px pour rester nettes
 * aux petites tailles. Elles héritent de la couleur du texte environnant.
 */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function TruckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 7h10v9H3z" />
      <path d="M13 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.7" />
      <circle cx="17" cy="18" r="1.7" />
    </svg>
  );
}

export function CrownIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 17h16" />
      <path d="M4 17 3 8l4.5 3.5L12 5l4.5 6.5L21 8l-1 9" />
    </svg>
  );
}

export function CardIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <path d="M2.5 10h19" />
      <path d="M6 14.5h3" />
    </svg>
  );
}

export function SupportIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 14h2.5v4H5a1 1 0 0 1-1-1z" />
      <path d="M20 14h-2.5v4H19a1 1 0 0 0 1-1z" />
      <path d="M17.5 18v.5a2.5 2.5 0 0 1-2.5 2.5h-2" />
    </svg>
  );
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.3-4.3" />
    </svg>
  );
}

export function HeartIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base} fill={filled ? "currentColor" : "none"} className={className}>
      <path d="M12 20s-7.2-4.5-7.2-9.3A4.2 4.2 0 0 1 12 8.2a4.2 4.2 0 0 1 7.2 2.5C19.2 15.5 12 20 12 20z" />
    </svg>
  );
}

export function BagIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5.5 7.5h13l-1 12.2a1.6 1.6 0 0 1-1.6 1.5H8.1a1.6 1.6 0 0 1-1.6-1.5z" />
      <path d="M9 7.5v-1.3a3 3 0 0 1 6 0v1.3" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function WhatsAppGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.696 4.61 1.9 6.48L4 29l7.72-1.87A11.93 11.93 0 0016.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3zm0 21.75a9.7 9.7 0 01-4.947-1.36l-.355-.21-4.583 1.11 1.128-4.47-.232-.366A9.7 9.7 0 016.25 15c0-5.38 4.373-9.75 9.751-9.75S25.75 9.62 25.75 15s-4.372 9.75-9.749 9.75zm5.34-7.302c-.293-.147-1.735-.856-2.004-.955-.269-.098-.465-.147-.66.147-.196.293-.758.955-.929 1.152-.171.196-.343.22-.636.073-.293-.147-1.235-.455-2.353-1.451-.87-.776-1.457-1.734-1.628-2.028-.171-.293-.018-.451.129-.598.132-.132.293-.343.44-.514.147-.171.196-.293.293-.489.098-.196.049-.367-.024-.514-.073-.147-.66-1.59-.904-2.178-.238-.573-.48-.495-.66-.505-.171-.008-.367-.01-.563-.01-.196 0-.514.073-.783.367-.269.293-1.026 1.003-1.026 2.446 0 1.443 1.05 2.837 1.196 3.033.147.196 2.067 3.157 5.008 4.428.7.302 1.246.483 1.672.618.702.223 1.34.191 1.845.116.563-.084 1.735-.71 1.98-1.394.244-.685.244-1.272.171-1.394-.073-.122-.269-.196-.562-.343z" />
    </svg>
  );
}

export const REASSURANCE_ICONS = {
  crown: CrownIcon,
  truck: TruckIcon,
  card: CardIcon,
  support: SupportIcon,
};
