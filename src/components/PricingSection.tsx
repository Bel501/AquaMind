import { useState } from 'react';
import { ArrowRight, Building2, Check, Factory, Sprout } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DemoSector } from '../lib/validation';
import { MagneticButton } from './MagneticButton';

export interface SelectedPlan {
  id: string;
  name: string;
  billing: 'monthly' | 'annual';
  sector: DemoSector;
  prefillMessage: string;
}

interface PricingPlanItem {
  id: 'starter' | 'pro' | 'enterprise';
  index: string;
  badge: string;
  name: string;
  audience: string;
  description: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  sector: DemoSector;
  highlighted?: boolean;
  cta: string;
  prefillMessage: string;
  roiHighlight: string;
  features: string[];
}

interface PricingSectionProps {
  onSelectPlan?: (plan: SelectedPlan) => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const { t } = useTranslation();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  const plans = t('pricing.plans', { returnObjects: true }) as PricingPlanItem[];

  const handlePlanClick = (plan: PricingPlanItem) => {
    if (onSelectPlan) {
      onSelectPlan({
        id: plan.id,
        name: plan.name,
        billing,
        sector: plan.sector,
        prefillMessage: plan.prefillMessage,
      });
      return;
    }
    const contactEl = document.querySelector('#contact');
    contactEl?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderPlanIcon = (id: PricingPlanItem['id']) => {
    if (id === 'starter') {
      return <Sprout size={18} className="text-emerald-600 dark:text-[#A3E635]" aria-hidden="true" />;
    }
    if (id === 'pro') {
      return <Building2 size={18} className="text-cyan-700 dark:text-[#22D3EE]" aria-hidden="true" />;
    }
    return <Factory size={18} className="text-teal-700 dark:text-[#2DD4BF]" aria-hidden="true" />;
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div className="max-w-[720px]">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] text-cyan-700 dark:text-[#22D3EE] mb-4">
            {t('pricing.kicker')}
          </p>
          <h2 className="font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-bold leading-[1.08] mb-4">
            {t('pricing.titlePrefix')}{' '}
            <span className="text-gradient-aqua">{t('pricing.titleHighlight')}</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg max-w-[54ch]">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Billing Cycle Segmented Control */}
        <div
          role="group"
          aria-label={t('pricing.kicker')}
          className="inline-flex items-center self-start lg:self-end p-1 rounded-xl bg-white/95 dark:bg-[#071829] border border-slate-200 dark:border-[#22D3EE]/22 shadow-sm shrink-0"
        >
          <button
            type="button"
            onClick={() => setBilling('monthly')}
            aria-pressed={billing === 'monthly'}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              billing === 'monthly'
                ? 'bg-cyan-600 dark:bg-[#22D3EE] text-white dark:text-[#05121F]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('pricing.monthly')}
          </button>
          <button
            type="button"
            onClick={() => setBilling('annual')}
            aria-pressed={billing === 'annual'}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              billing === 'annual'
                ? 'bg-cyan-600 dark:bg-[#22D3EE] text-white dark:text-[#05121F]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('pricing.annual')}
          </button>
        </div>
      </div>

      <div className="stagger-group grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => {
          const activePrice = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice;
          const isHighlighted = Boolean(plan.highlighted);

          return (
            <article
              key={plan.id}
              className={`stagger-item glass-panel relative overflow-hidden rounded-3xl p-7 sm:p-9 flex flex-col justify-between transition-transform duration-200 ${
                isHighlighted
                  ? 'dark:bg-[#081D33]/95 border-cyan-600/55 dark:border-[#22D3EE]/55 shadow-[0_22px_54px_rgba(2,132,199,0.14)] dark:shadow-[0_26px_64px_rgba(34,211,238,0.14)]'
                  : 'dark:bg-[#061627]/90'
              }`}
            >
              {isHighlighted && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500 dark:via-[#22D3EE] to-transparent"
                />
              )}

              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.05em]">
                    <span className="font-mono-tabular text-cyan-700 dark:text-[#22D3EE]">
                      {plan.index}.
                    </span>
                    <span aria-hidden="true" className="text-slate-400">
                      ·
                    </span>
                    <span
                      className={
                        isHighlighted
                          ? 'text-cyan-700 dark:text-[#22D3EE]'
                          : 'text-slate-600 dark:text-slate-300'
                      }
                    >
                      {plan.badge}
                    </span>
                  </div>

                  <span className="w-9 h-9 rounded-xl bg-sky-100/80 dark:bg-[#0C2640] border border-sky-200/80 dark:border-[#22D3EE]/20 flex items-center justify-center shrink-0">
                    {renderPlanIcon(plan.id)}
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-[1.75rem] font-bold text-[#082F4E] dark:text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-xs font-medium text-cyan-800 dark:text-[#2DD4BF] mb-3">
                  {plan.audience}
                </p>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed min-h-[44px] mb-6">
                  {plan.description}
                </p>

                <div className="pb-5 mb-5 border-b border-slate-200 dark:border-[#22D3EE]/15">
                  {activePrice !== null ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono-tabular text-4xl sm:text-[2.75rem] font-bold text-[#082F4E] dark:text-white leading-none">
                          {activePrice} €
                        </span>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          {t('pricing.perMonth')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {billing === 'annual'
                          ? t('pricing.billedAnnually')
                          : t('pricing.billedMonthly')}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="font-display text-3xl sm:text-[2.2rem] font-bold text-[#082F4E] dark:text-white leading-tight">
                        {t('pricing.customPrice')}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 tabular-nums">
                        {t('pricing.customSub')}
                      </p>
                    </>
                  )}
                </div>

                {/* Associated Impact / Benefits Highlight */}
                <p className="text-xs font-semibold text-teal-800 dark:text-[#22D3EE] mb-4">
                  {plan.roiHighlight}
                </p>

                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
                  {t('pricing.benefitsLabel')}
                </p>

                <ul className="space-y-3 mb-8 text-sm text-slate-700 dark:text-slate-200">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check
                        size={16}
                        className="text-cyan-600 dark:text-[#22D3EE] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <MagneticButton
                type="button"
                variant={isHighlighted ? 'primary' : 'glass'}
                className="w-full"
                onClick={() => handlePlanClick(plan)}
              >
                <span>{plan.cta}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </MagneticButton>
            </article>
          );
        })}
      </div>

      <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-8">
        {t('pricing.guarantee')}
      </p>
    </div>
  );
}
