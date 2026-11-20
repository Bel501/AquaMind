import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, AlertTriangle, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export type DashMode = 'agri' | 'hotel' | 'industry';

interface DashConfig {
  label: string;
  title: string;
  subtitle: string;
  saving: string;
  savingApplied: string;
  metricLabel: string;
  metricVal: string;
  conf: string;
  alertTitle: string;
  alertDesc: string;
  recoTitle: string;
  recoDesc: string;
  anomalyLabel: string;
  realPath: string;
  predPath: string;
  areaPath: string;
  pinX: number;
  pinY: number;
}

const DASH_MODES: Record<DashMode, DashConfig> = {
  agri: {
    label: 'Exploitation Agricole',
    title: 'Débit vs Prédiction IA — Domaine Olivier Nord',
    subtitle: 'Fenêtre 24h · Résolution 5 min · 48 sondes',
    saving: '-29,4 %',
    savingApplied: '-33,1 %',
    metricLabel: 'Humidité racinaire',
    metricVal: '34,2 %',
    conf: '96,4 %',
    alertTitle: 'Vanne secondaire B2 — Débit résiduel anormal',
    alertDesc:
      'Écart de +38 % par rapport à la série temporelle attendue depuis 03h14. Perte estimée : 1 080 L/h.',
    recoTitle: "Décaler l'irrigation de 14h à 22h30",
    recoDesc:
      "Pluie prévue (6 mm) à 17h et baisse d'évapotranspiration. Gain estimé : 4 200 L économisés.",
    anomalyLabel: 'Anomalie B2 (+18 L/min)',
    realPath:
      'M20 185 C80 180, 130 165, 190 142 C250 120, 300 138, 355 128 C395 120, 420 54, 448 56 C480 58, 520 146, 620 140',
    predPath:
      'M20 188 C80 182, 130 168, 190 145 C250 124, 300 140, 355 132 C410 126, 460 134, 520 148 C565 156, 595 145, 620 142',
    areaPath:
      'M20 185 C80 180, 130 165, 190 142 C250 120, 300 138, 355 128 C395 120, 420 54, 448 56 C480 58, 520 146, 620 140 L620 220 L20 220 Z',
    pinX: 446,
    pinY: 56,
  },
  hotel: {
    label: 'Resort Hôtelier',
    title: 'Consommation Réseau — Azur Resort & Spa (140 ch.)',
    subtitle: 'Fenêtre 24h · Résolution 5 min · 32 compteurs',
    saving: '-24,8 %',
    savingApplied: '-27,5 %',
    metricLabel: 'Pression réseau',
    metricVal: '2,8 bar',
    conf: '97,1 %',
    alertTitle: 'Circuit Piscine Est — Micro-fuite nocturne',
    alertDesc:
      'Débit constant de 14 L/min détecté entre 01h et 04h hors heures de remplissage automatique.',
    recoTitle: "Isoler la boucle Nord durant l'audit",
    recoDesc:
      "Réduction immédiate de la pression de nuit et notification transmise à l'équipe technique.",
    anomalyLabel: 'Fuite nocturne (+14 L/min)',
    realPath:
      'M20 170 C90 160, 145 148, 210 156 C275 162, 325 78, 365 76 C410 74, 455 148, 525 138 C568 132, 595 128, 620 124',
    predPath:
      'M20 172 C90 162, 145 150, 210 158 C275 164, 325 154, 365 152 C410 150, 455 148, 525 140 C568 134, 595 130, 620 126',
    areaPath:
      'M20 170 C90 160, 145 148, 210 156 C275 162, 325 78, 365 76 C410 74, 455 148, 525 138 C568 132, 595 128, 620 124 L620 220 L20 220 Z',
    pinX: 365,
    pinY: 76,
  },
  industry: {
    label: 'Site Industriel',
    title: 'Boucle Refroidissement — Groupe AgroNova Ligne 3',
    subtitle: 'Fenêtre 24h · Résolution 1 min · 64 débitmètres',
    saving: '-21,6 %',
    savingApplied: '-25,2 %',
    metricLabel: 'Température circuit',
    metricVal: '18,4 °C',
    conf: '98,2 %',
    alertTitle: 'Échangeur C4 — Dérive consommation appoint',
    alertDesc:
      'Surconsommation progressive de +11 % sur 72h isolée par analyse de séries temporelles.',
    recoTitle: 'Recalibrer la purge automatique',
    recoDesc:
      'Ajustement des cycles de déconcentration : -18 m³/jour sans impact sur le rendement thermique.',
    anomalyLabel: 'Dérive C4 (+11 %)',
    realPath:
      'M20 155 C85 152, 155 146, 225 142 C295 138, 370 128, 430 112 C480 98, 510 68, 536 72 C565 76, 592 118, 620 116',
    predPath:
      'M20 156 C85 154, 155 148, 225 144 C295 142, 370 138, 430 136 C480 134, 515 132, 540 130 C570 128, 595 126, 620 124',
    areaPath:
      'M20 155 C85 152, 155 146, 225 142 C295 138, 370 128, 430 112 C480 98, 510 68, 536 72 C565 76, 592 118, 620 116 L620 220 L20 220 Z',
    pinX: 536,
    pinY: 72,
  },
};

interface DashboardDemoProps {
  activeMode: DashMode;
  onModeChange: (mode: DashMode) => void;
}

export function DashboardDemo({ activeMode, onModeChange }: DashboardDemoProps) {
  const [appliedModes, setAppliedModes] = useState<Record<DashMode, boolean>>({
    agri: false,
    hotel: false,
    industry: false,
  });

  const shellRef = useRef<HTMLDivElement>(null);
  const realPathRef = useRef<SVGPathElement>(null);
  const predPathRef = useRef<SVGPathElement>(null);
  const areaPathRef = useRef<SVGPathElement>(null);
  const pinRef = useRef<SVGGElement>(null);

  const data = DASH_MODES[activeMode];
  const isApplied = appliedModes[activeMode];

  // Build animation on scroll
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shell = shellRef.current;
    const realPath = realPathRef.current;
    const predPath = predPathRef.current;
    const areaPath = areaPathRef.current;
    const pin = pinRef.current;

    if (!shell || !realPath || !predPath || !areaPath || !pin) return;

    if (prefersReduced) {
      areaPath.style.opacity = '1';
      pin.style.opacity = '1';
      return;
    }

    const ctx = gsap.context(() => {
      const realLen = realPath.getTotalLength();
      const predLen = predPath.getTotalLength();

      gsap.set(realPath, { strokeDasharray: realLen, strokeDashoffset: realLen });
      gsap.set(predPath, { strokeDasharray: predLen, strokeDashoffset: predLen });
      gsap.set(areaPath, { opacity: 0 });
      gsap.set(pin, { opacity: 0, scale: 0.7, transformOrigin: 'center center' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: shell,
          start: 'top 76%',
          once: true,
        },
      });

      tl.from(shell.querySelectorAll('.dash-build'), {
        y: 28,
        opacity: 0,
        duration: 0.65,
        stagger: 0.12,
        ease: 'power3.out',
      })
        .to(predPath, { strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut' }, '-=0.3')
        .to(realPath, { strokeDashoffset: 0, duration: 1.15, ease: 'power2.inOut' }, '-=0.85')
        .to(areaPath, { opacity: 1, duration: 0.6 }, '-=0.45')
        .to(pin, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.7)' }, '-=0.3');
    }, shell);

    return () => ctx.revert();
  }, []);

  // Subtle re-draw when switching tabs
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const realPath = realPathRef.current;
    const predPath = predPathRef.current;
    if (!realPath || !predPath || prefersReduced) return;

    const realLen = realPath.getTotalLength();
    const predLen = predPath.getTotalLength();
    gsap.fromTo(
      realPath,
      { strokeDasharray: realLen, strokeDashoffset: realLen },
      { strokeDashoffset: 0, duration: 0.75, ease: 'power2.out' }
    );
    gsap.fromTo(
      predPath,
      { strokeDasharray: predLen, strokeDashoffset: predLen },
      { strokeDashoffset: 0, duration: 0.65, ease: 'power2.out' }
    );
  }, [activeMode]);

  const handleApplyPlan = () => {
    setAppliedModes((prev) => ({ ...prev, [activeMode]: true }));
  };

  return (
    <div
      ref={shellRef}
      className="glass-panel rounded-[28px] p-5 sm:p-7 border-[#22D3EE]/24 shadow-[0_36px_90px_rgba(0,0,0,0.58)]"
    >
      {/* Topbar */}
      <div className="dash-build flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-white/10">
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FB7185]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#A3E635]" />
        </div>

        <div
          role="tablist"
          aria-label="Choisir un environnement de démonstration"
          className="flex flex-wrap gap-1.5 p-1.5 rounded-full bg-[#05121F]/80 border border-white/8"
        >
          {(Object.keys(DASH_MODES) as DashMode[]).map((modeKey) => {
            const active = activeMode === modeKey;
            return (
              <button
                key={modeKey}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onModeChange(modeKey)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer ${
                  active
                    ? 'bg-[#22D3EE]/18 text-[#22D3EE] shadow-[inset_0_0_0_1px_rgba(34,211,238,0.38)]'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {DASH_MODES[modeKey].label}
              </button>
            );
          })}
        </div>

        <div className="text-xs font-medium text-[#2DD4BF] whitespace-nowrap">
          Télémétrie continue · Flux actif
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.75fr_1fr] gap-6">
        {/* Left: Chart + KPIs */}
        <div className="dash-build rounded-[20px] bg-[#05121F]/70 border border-white/8 p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-1">{data.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400">{data.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-[3px] rounded bg-[#22D3EE]" aria-hidden="true" />
                Réel (m³/h)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-[3px] rounded bg-[#A3E635]" aria-hidden="true" />
                Modèle ML
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FB7185]" aria-hidden="true" />
                Anomalie
              </span>
            </div>
          </div>

          <div className="w-full aspect-[16/7] min-h-[210px]">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 640 250"
              role="img"
              aria-label={`Courbe de débit pour ${data.label} comparant la consommation réelle et la prédiction ML`}
            >
              <defs>
                <linearGradient id="aquamindAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(34, 211, 238, 0.3)" />
                  <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
                </linearGradient>
              </defs>

              <g stroke="rgba(255,255,255,0.06)" strokeWidth="1">
                <line x1="20" y1="40" x2="620" y2="40" />
                <line x1="20" y1="95" x2="620" y2="95" />
                <line x1="20" y1="150" x2="620" y2="150" />
                <line x1="20" y1="205" x2="620" y2="205" />
              </g>

              <path ref={areaPathRef} d={data.areaPath} fill="url(#aquamindAreaGrad)" />

              <path
                ref={predPathRef}
                d={data.predPath}
                fill="none"
                stroke="#A3E635"
                strokeWidth="2.5"
                strokeDasharray="7 6"
              />

              <path
                ref={realPathRef}
                d={data.realPath}
                fill="none"
                stroke="#22D3EE"
                strokeWidth="3.2"
                strokeLinecap="round"
              />

              <g ref={pinRef} transform={`translate(${data.pinX}, ${data.pinY})`}>
                <circle r="18" fill="rgba(251, 113, 133, 0.2)" />
                <circle r="7" fill="#FB7185" stroke="#05121F" strokeWidth="2.5" />
                <rect
                  x="-92"
                  y="-48"
                  width="184"
                  height="32"
                  rx="8"
                  fill="#0B1F33"
                  stroke="rgba(251,113,133,0.62)"
                />
                <text
                  x="0"
                  y="-28"
                  textAnchor="middle"
                  fill="#FB7185"
                  fontSize="11"
                  fontFamily="Sora, sans-serif"
                  fontWeight="600"
                >
                  {data.anomalyLabel}
                </text>
              </g>
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4 pt-4 border-t border-white/8">
            <div>
              <div className="text-xs text-slate-400 mb-1">Économie ce mois</div>
              <div className="font-mono-tabular text-xl font-bold text-[#A3E635]">
                {isApplied ? data.savingApplied : data.saving}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">{data.metricLabel}</div>
              <div className="font-mono-tabular text-xl font-bold text-slate-100">
                {data.metricVal}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Fiabilité modèle</div>
              <div className="font-mono-tabular text-xl font-bold text-[#22D3EE]">
                {data.conf}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Anomaly Alert & AI Recommendation */}
        <div className="flex flex-col gap-4">
          <div className="dash-build rounded-[20px] p-5 bg-gradient-to-br from-[#FB7185]/12 to-[#05121F]/80 border border-[#FB7185]/40">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#FB7185] mb-2">
              <AlertTriangle size={15} aria-hidden="true" />
              Alerte fuite détectée
            </div>
            <h4 className="text-base font-semibold text-slate-100 mb-2">{data.alertTitle}</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{data.alertDesc}</p>
          </div>

          <div className="dash-build rounded-[20px] p-5 bg-gradient-to-br from-[#A3E635]/10 to-[#05121F]/80 border border-[#A3E635]/35 flex-1 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#A3E635] mb-2">
                <Sparkles size={15} aria-hidden="true" />
                Recommandation IA
              </div>
              <h4 className="text-base font-semibold text-slate-100 mb-2">{data.recoTitle}</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{data.recoDesc}</p>
            </div>

            <button
              type="button"
              onClick={handleApplyPlan}
              className={`mt-5 w-full py-3 px-4 rounded-xl font-display text-sm font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                isApplied
                  ? 'bg-[#2DD4BF]/18 border border-[#2DD4BF]/60 text-[#2DD4BF]'
                  : 'bg-[#A3E635]/18 border border-[#A3E635]/45 text-[#A3E635] hover:bg-[#A3E635] hover:text-[#05121F]'
              }`}
            >
              {isApplied ? (
                <>
                  <Check size={16} aria-hidden="true" />
                  Plan IA activé sur les vannes
                </>
              ) : (
                'Appliquer le plan optimisé'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
