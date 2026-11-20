import { useRef } from 'react';
import { Droplets, AlertTriangle, SlidersHorizontal, BellRing, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FeatureMeta {
  accent: 'lime' | 'alert' | 'cyan';
  Icon: typeof Droplets;
  spanClass: string;
}

const FEATURE_META: FeatureMeta[] = [
  { accent: 'lime', Icon: Droplets, spanClass: 'lg:col-span-2' },
  { accent: 'alert', Icon: AlertTriangle, spanClass: 'lg:col-span-2' },
  { accent: 'cyan', Icon: SlidersHorizontal, spanClass: 'lg:col-span-2' },
  { accent: 'cyan', Icon: BellRing, spanClass: 'lg:col-span-3' },
  { accent: 'cyan', Icon: LayoutGrid, spanClass: 'lg:col-span-3' },
];

function TiltCard({
  title,
  description,
  meta,
}: {
  title: string;
  description: string;
  meta: FeatureMeta;
}) {
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
    meta.accent === 'lime'
      ? 'bg-lime-500/12 border-lime-600/30 dark:border-[#A3E635]/35 text-lime-700 dark:text-[#A3E635]'
      : meta.accent === 'alert'
      ? 'bg-orange-500/12 border-orange-500/35 text-orange-600 dark:text-[#F97316]'
      : 'bg-cyan-500/12 border-cyan-600/30 dark:border-[#22D3EE]/30 text-cyan-700 dark:text-[#22D3EE]';

  const Icon = meta.Icon;

  return (
    <article
      ref={cardRef}
      data-interactive="true"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`stagger-item glass-panel rounded-3xl p-8 relative overflow-hidden transition-transform duration-200 ease-out will-change-transform ${meta.spanClass}`}
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
      <h3
        className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3"
        style={{ transform: 'translateZ(14px)' }}
      >
        {title}
      </h3>
      <p
        className="text-[0.96rem] text-slate-600 dark:text-slate-300 leading-relaxed"
        style={{ transform: 'translateZ(10px)' }}
      >
        {description}
      </p>
    </article>
  );
}

export function TiltFeatureCards() {
  const { t } = useTranslation();
  const translated = t('features.items', { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;

  return (
    <div className="stagger-group grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
      {FEATURE_META.map((meta, idx) => (
        <TiltCard
          key={meta.accent + idx}
          meta={meta}
          title={translated[idx]?.title || ''}
          description={translated[idx]?.description || ''}
        />
      ))}
    </div>
  );
}
