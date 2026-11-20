import { useRef } from 'react';
import { Droplets, AlertTriangle, SlidersHorizontal, BellRing, LayoutGrid } from 'lucide-react';

interface FeatureItem {
  title: string;
  description: string;
  accent: 'lime' | 'alert' | 'cyan';
  Icon: typeof Droplets;
  spanClass: string;
}

const FEATURES: FeatureItem[] = [
  {
    title: 'Prédiction des besoins en irrigation',
    description:
      'Anticipation à 7 jours du stress hydrique par zone selon le sol, la culture et la météo réelle.',
    accent: 'lime',
    Icon: Droplets,
    spanClass: 'lg:col-span-2',
  },
  {
    title: "Détection d'anomalies et de fuites",
    description:
      'Identification des surconsommations nocturnes, ruptures progressives et dérives de vannes invisibles.',
    accent: 'alert',
    Icon: AlertTriangle,
    spanClass: 'lg:col-span-2',
  },
  {
    title: "Optimisation de l'irrigation",
    description:
      "Calendriers dynamiques recalibrés automatiquement selon les heures creuses et l'évapotranspiration.",
    accent: 'cyan',
    Icon: SlidersHorizontal,
    spanClass: 'lg:col-span-2',
  },
  {
    title: 'Alertes en temps réel',
    description:
      'Notifications multicanales instantanées (SMS, application, webhook industriel) avec localisation exacte du tronçon.',
    accent: 'cyan',
    Icon: BellRing,
    spanClass: 'lg:col-span-3',
  },
  {
    title: 'Tableau de bord unifié',
    description:
      'Cockpit multi-sites pour piloter parcelles, hôtels et lignes industrielles avec rapports RSE et empreinte hydrique.',
    accent: 'cyan',
    Icon: LayoutGrid,
    spanClass: 'lg:col-span-3',
  },
];

function TiltCard({ item }: { item: FeatureItem }) {
  const cardRef = useRef<HTMLElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || isReducedMotion || isTouch) return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotY = (px - 0.5) * 12;
    const rotX = (0.5 - py) * 12;

    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
    if (glare) {
      glare.style.opacity = '1';
      glare.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(34, 211, 238, 0.16), transparent 60%)`;
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (card) {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    }
    if (glare) {
      glare.style.opacity = '0';
    }
  };

  const iconWrapClass =
    item.accent === 'lime'
      ? 'bg-[#A3E635]/12 border-[#A3E635]/32 text-[#A3E635]'
      : item.accent === 'alert'
      ? 'bg-[#FB7185]/12 border-[#FB7185]/32 text-[#FB7185]'
      : 'bg-[#22D3EE]/12 border-[#22D3EE]/28 text-[#22D3EE]';

  const Icon = item.Icon;

  return (
    <article
      ref={cardRef}
      data-interactive="true"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`stagger-item glass-panel rounded-3xl p-8 relative overflow-hidden transition-transform duration-200 ease-out will-change-transform ${item.spanClass}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        ref={glareRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-200"
      />
      <div
        className={`w-13 h-13 rounded-2xl border grid place-items-center mb-6 ${iconWrapClass}`}
        style={{ transform: 'translateZ(18px)' }}
        aria-hidden="true"
      >
        <Icon size={23} strokeWidth={2} />
      </div>
      <h3 className="text-xl font-semibold text-slate-100 mb-3" style={{ transform: 'translateZ(14px)' }}>
        {item.title}
      </h3>
      <p className="text-[0.96rem] text-slate-300 leading-relaxed" style={{ transform: 'translateZ(10px)' }}>
        {item.description}
      </p>
    </article>
  );
}

export function TiltFeatureCards() {
  return (
    <div className="stagger-group grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
      {FEATURES.map((item) => (
        <TiltCard key={item.title} item={item} />
      ))}
    </div>
  );
}
