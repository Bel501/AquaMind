import { useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type LegalTab = 'mentions' | 'privacy' | 'terms';

interface LegalModalProps {
  openTab: LegalTab | null;
  onChangeTab: (tab: LegalTab) => void;
  onClose: () => void;
}

interface LegalSectionItem {
  heading: string;
  body: string;
}

const TABS: LegalTab[] = ['mentions', 'privacy', 'terms'];

export function LegalModal({ openTab, onChangeTab, onClose }: LegalModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!openTab) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openTab, onClose]);

  if (!openTab) return null;

  const sections = t(`legal.${openTab}`, { returnObjects: true }) as LegalSectionItem[];

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-3xl max-h-[86vh] flex flex-col rounded-3xl bg-white dark:bg-[#071829] border border-slate-200 dark:border-[#22D3EE]/25 shadow-[0_28px_72px_rgba(2,9,17,0.55)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck
              size={20}
              className="text-cyan-700 dark:text-[#22D3EE] shrink-0"
              aria-hidden="true"
            />
            <h2
              id="legal-modal-title"
              className="font-display text-lg sm:text-xl font-bold text-[#082F4E] dark:text-white"
            >
              {t('legal.title')}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('legal.close')}
            className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-[#0B2239] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-cyan-600 dark:hover:border-[#22D3EE] transition-colors cursor-pointer shrink-0"
          >
            <X size={17} />
          </button>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label={t('legal.title')}
          className="px-6 pt-4 pb-3 border-b border-slate-200 dark:border-white/10 flex flex-wrap gap-2 bg-slate-50/80 dark:bg-[#05121F]/65"
        >
          {TABS.map((tab) => {
            const active = openTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChangeTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-cyan-600 dark:bg-[#22D3EE] text-white dark:text-[#05121F]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/10'
                }`}
              >
                {t(`legal.tabs.${tab}`)}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div data-lenis-prevent className="px-6 py-6 overflow-y-auto space-y-6">
          <div className="rounded-xl px-4 py-3 border border-sky-200 dark:border-[#22D3EE]/22 bg-sky-50/80 dark:bg-[#0A1F33] text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {t('legal.templateBanner')}
          </div>

          {sections.map((section) => (
            <section key={section.heading} className="space-y-1.5">
              <h3 className="font-display text-base font-semibold text-[#082F4E] dark:text-slate-100">
                {section.heading}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex justify-end bg-slate-50/80 dark:bg-[#05121F]/65">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-[#05121F] text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t('legal.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
