import { Sprout, Building2, Factory, ArrowUpRight } from 'lucide-react';
import type { DashMode } from './DashboardDemo';

interface SectorCardsProps {
  onInspectSector: (mode: DashMode) => void;
}

const SECTORS: Array<{
  mode: DashMode;
  title: string;
  description: string;
  metric: string;
  metricDetail: string;
  isAgri?: boolean;
  iconColor: string;
  Icon: typeof Sprout;
}> = [
  {
    mode: 'agri',
    title: 'Agriculture',
    description:
      'Pilotage parcellaire du goutte-à-goutte selon le stress hydrique racinaire, les stades de culture et les prévisions météo.',
    metric: '-32 %',
    metricDetail: "d'eau d'irrigation · +14 % d'homogénéité",
    isAgri: true,
    iconColor: '#A3E635',
    Icon: Sprout,
  },
  {
    mode: 'hotel',
    title: 'Hôtellerie',
    description:
      'Surveillance silencieuse des chambres, spas, piscines et arrosages paysagers pour stopper les fuites nocturnes.',
    metric: '-25 %',
    metricDetail: 'sur la facture hydrique · ROI en 4 mois',
    iconColor: '#22D3EE',
    Icon: Building2,
  },
  {
    mode: 'industry',
    title: 'Industrie',
    description:
      'Contrôle continu des boucles de refroidissement, eaux de process et stations de traitement avant toute dérive.',
    metric: '99,4 %',
    metricDetail: 'de disponibilité réseau sans arrêt imprévu',
    iconColor: '#2DD4BF',
    Icon: Factory,
  },
];

export function SectorCards({ onInspectSector }: SectorCardsProps) {
  return (
    <div className="stagger-group grid grid-cols-1 lg:grid-cols-3 gap-6">
      {SECTORS.map(({ mode, title, description, metric, metricDetail, isAgri, iconColor, Icon }) => (
        <article
          key={mode}
          className={`stagger-item sector-card glass-panel ${
            isAgri ? 'glass-panel-agri' : ''
          } rounded-3xl p-8 flex flex-col justify-between gap-7 transition-transform duration-300 ease-out hover:-translate-y-2`}
        >
          <div>
            {/* 3D Layered Isometric Icon */}
            <div className="icon-3d-stage w-20 h-20 grid place-items-center mb-5" aria-hidden="true">
              <div className="icon-3d-cube">
                <div
                  className={`icon-3d-layer-back absolute inset-0 rounded-[18px] border ${
                    isAgri
                      ? 'bg-[#A3E635]/10 border-[#A3E635]/28'
                      : 'bg-[#22D3EE]/10 border-[#22D3EE]/24'
                  }`}
                />
                <div
                  className={`icon-3d-layer-mid absolute inset-0 rounded-[18px] bg-[#081C30]/92 border shadow-[0_12px_26px_rgba(0,0,0,0.45)] ${
                    isAgri ? 'border-[#A3E635]/45' : 'border-[#2DD4BF]/38'
                  }`}
                />
                <div className="icon-3d-layer-front absolute inset-0 grid place-items-center pointer-events-none">
                  <Icon size={28} color={iconColor} strokeWidth={2} />
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-100 mb-3">{title}</h3>
            <p className="text-[0.98rem] text-slate-300 leading-relaxed">{description}</p>
          </div>

          <div className="pt-5 border-t border-white/10 flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-3">
              <strong
                className={`font-mono-tabular text-3xl font-bold ${
                  isAgri ? 'text-[#A3E635]' : 'text-[#22D3EE]'
                }`}
              >
                {metric}
              </strong>
              <span className="text-xs sm:text-sm text-slate-400 text-right">{metricDetail}</span>
            </div>

            <button
              type="button"
              onClick={() => onInspectSector(mode)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-[#22D3EE] transition-colors self-start cursor-pointer whitespace-nowrap"
            >
              Voir la simulation dans le cockpit
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
