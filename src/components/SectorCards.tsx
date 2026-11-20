import { Sprout, Building2, Factory, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DashMode } from './DashboardDemo';

interface SectorCardsProps {
  onInspectSector: (mode: DashMode) => void;
}

const ICONS = {
  agri: Sprout,
  hotel: Building2,
  industry: Factory,
} as const;

export function SectorCards({ onInspectSector }: SectorCardsProps) {
  const { t } = useTranslation();
  const items = t('sectors.items', { returnObjects: true }) as Array<{
    mode: DashMode;
    title: string;
    description: string;
    metric: string;
    metricDetail: string;
  }>;

  return (
    <div className="stagger-group grid grid-cols-1 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const isAgri = item.mode === 'agri';
        const Icon = ICONS[item.mode] || Sprout;
        const iconColor = isAgri
          ? '#A3E635'
          : item.mode === 'hotel'
          ? '#22D3EE'
          : '#2DD4BF';

        return (
          <article
            key={item.mode}
            className={`stagger-item sector-card glass-panel ${
              isAgri ? 'glass-panel-agri' : ''
            } rounded-3xl p-8 flex flex-col justify-between gap-7 transition-transform duration-300 ease-out hover:-translate-y-2`}
          >
            <div>
              <div className="icon-3d-stage w-20 h-20 grid place-items-center mb-5" aria-hidden="true">
                <div className="icon-3d-cube">
                  <div
                    className={`icon-3d-layer-back absolute inset-0 rounded-[18px] border ${
                      isAgri
                        ? 'bg-lime-500/12 border-lime-500/30'
                        : 'bg-cyan-500/12 border-cyan-500/25'
                    }`}
                  />
                  <div
                    className={`icon-3d-layer-mid absolute inset-0 rounded-[18px] bg-slate-900 dark:bg-[#081C30]/92 border shadow-[0_12px_26px_rgba(0,0,0,0.35)] ${
                      isAgri ? 'border-[#A3E635]/45' : 'border-[#2DD4BF]/38'
                    }`}
                  />
                  <div className="icon-3d-layer-front absolute inset-0 grid place-items-center pointer-events-none">
                    <Icon size={28} color={iconColor} strokeWidth={2} />
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                {item.title}
              </h3>
              <p className="text-[0.98rem] text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-5 border-t border-slate-200 dark:border-white/10 flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-3">
                <strong
                  className={`font-mono-tabular text-3xl font-bold ${
                    isAgri
                      ? 'text-lime-700 dark:text-[#A3E635]'
                      : 'text-cyan-700 dark:text-[#22D3EE]'
                  }`}
                >
                  {item.metric}
                </strong>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-right">
                  {item.metricDetail}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onInspectSector(item.mode)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-cyan-700 dark:hover:text-[#22D3EE] transition-colors self-start cursor-pointer whitespace-nowrap"
              >
                {t('sectors.cta')}
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
