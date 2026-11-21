import { useState } from 'react';
import {
  Building2,
  Cloud,
  CloudRain,
  Droplets,
  Factory,
  Gauge,
  MonitorSmartphone,
  Radio,
  Settings,
  Sprout,
  Sun,
  Thermometer,
  Tractor,
  TrendingUp,
  Wind,
  Wrench,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SourceItem {
  id: 'sites' | 'iot' | 'external';
  title: string;
  subtitle: string;
}

interface ModuleItem {
  id: 'irrigation' | 'leak' | 'forecast' | 'optimization';
  title: string;
  subtitle: string;
  detail: string;
}

interface ArchitectureFlowProps {
  onJumpToDashboard: () => void;
}

const MODULE_STYLES: Record<
  ModuleItem['id'],
  {
    card: string;
    activeRing: string;
    iconBox: string;
    titleColor: string;
  }
> = {
  irrigation: {
    card: 'bg-emerald-50/95 dark:bg-emerald-950/35 border-emerald-300/80 dark:border-emerald-500/35',
    activeRing: 'ring-2 ring-emerald-500/60 shadow-[0_14px_30px_rgba(22,163,74,0.16)]',
    iconBox: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    titleColor: 'text-emerald-800 dark:text-emerald-300',
  },
  leak: {
    card: 'bg-rose-50/95 dark:bg-rose-950/35 border-rose-300/80 dark:border-rose-500/35',
    activeRing: 'ring-2 ring-rose-500/60 shadow-[0_14px_30px_rgba(220,38,38,0.16)]',
    iconBox: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',
    titleColor: 'text-rose-800 dark:text-rose-300',
  },
  forecast: {
    card: 'bg-sky-50/95 dark:bg-sky-950/35 border-sky-300/80 dark:border-sky-500/35',
    activeRing: 'ring-2 ring-sky-500/60 shadow-[0_14px_30px_rgba(2,132,199,0.16)]',
    iconBox: 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300',
    titleColor: 'text-sky-800 dark:text-sky-300',
  },
  optimization: {
    card: 'bg-violet-50/95 dark:bg-violet-950/35 border-violet-300/80 dark:border-violet-500/35',
    activeRing: 'ring-2 ring-violet-500/60 shadow-[0_14px_30px_rgba(124,58,237,0.16)]',
    iconBox: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300',
    titleColor: 'text-violet-800 dark:text-violet-300',
  },
};

export function ArchitectureFlow({ onJumpToDashboard }: ArchitectureFlowProps) {
  const { t } = useTranslation();
  const sources = t('architecture.sources', { returnObjects: true }) as SourceItem[];
  const modules = t('architecture.modules', { returnObjects: true }) as ModuleItem[];
  const [selectedModule, setSelectedModule] = useState<ModuleItem['id']>('irrigation');

  const activeModuleObj = modules.find((m) => m.id === selectedModule) ?? modules[0];

  const renderModuleIcon = (id: ModuleItem['id']) => {
    switch (id) {
      case 'irrigation':
        return <Sprout size={24} aria-hidden="true" />;
      case 'leak':
        return <Wrench size={24} aria-hidden="true" />;
      case 'forecast':
        return <TrendingUp size={24} aria-hidden="true" />;
      case 'optimization':
        return <Settings size={24} aria-hidden="true" />;
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Platform Header Capsule */}
      <div className="flex flex-col items-center mb-8">
        <div className="ocean-card-header text-white px-7 py-3 rounded-full shadow-[0_14px_32px_rgba(8,47,78,0.28)] border border-sky-300/40 inline-flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-white/12 border border-sky-300/40 flex items-center justify-center shrink-0">
            <Cloud size={18} className="text-sky-200" aria-hidden="true" />
          </span>
          <span className="font-display font-bold text-xl sm:text-2xl tracking-tight">
            {t('architecture.platformTitle')}
          </span>
        </div>

        <div className="-mt-2.5 z-10 px-5 py-1.5 rounded-full bg-white dark:bg-[#0B2239] border border-sky-200 dark:border-cyan-400/25 shadow-sm text-xs sm:text-sm font-semibold text-[#082F4E] dark:text-slate-100">
          {t('architecture.platformSub')}
        </div>
      </div>

      {/* Row 1: 3 Data Sources */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
        {sources.map((src) => (
          <div
            key={src.id}
            className="glass-panel rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 bg-white/95 dark:bg-[#081C30]/90 border-sky-200/90 dark:border-[#22D3EE]/22"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-900/40 border border-sky-200 dark:border-cyan-400/25 flex items-center justify-center shrink-0 text-[#0284C7] dark:text-[#22D3EE]">
                {src.id === 'sites' && <Building2 size={22} className="text-emerald-600 dark:text-[#A3E635]" aria-hidden="true" />}
                {src.id === 'iot' && <Radio size={22} aria-hidden="true" />}
                {src.id === 'external' && <CloudRain size={22} aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-sm sm:text-[0.95rem] text-[#082F4E] dark:text-slate-100 leading-snug">
                  {src.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                  {src.subtitle}
                </p>
              </div>
            </div>

            {/* Source micro-icon strip matching reference graphic */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              {src.id === 'sites' && (
                <>
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                    <Tractor size={14} aria-hidden="true" />
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center text-sky-700 dark:text-sky-300">
                    <Building2 size={14} aria-hidden="true" />
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <Factory size={14} aria-hidden="true" />
                  </span>
                </>
              )}
              {src.id === 'iot' && (
                <>
                  <span className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-cyan-300">
                    <Droplets size={14} aria-hidden="true" />
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-cyan-300">
                    <Gauge size={14} aria-hidden="true" />
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-cyan-300">
                    <Thermometer size={14} aria-hidden="true" />
                  </span>
                </>
              )}
              {src.id === 'external' && (
                <>
                  <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-300">
                    <Sun size={14} aria-hidden="true" />
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-cyan-300">
                    <Wind size={14} aria-hidden="true" />
                  </span>
                  <span className="px-1.5 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center font-mono-tabular text-[10px] font-bold text-sky-700 dark:text-cyan-300">
                    ET₀
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Animated Converging SVG Connectors (Top -> AI Engine) */}
      <div className="w-full max-w-[920px] h-11 hidden lg:block pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 920 44" className="w-full h-full overflow-visible">
          <path
            d="M 120 0 L 120 18 Q 120 26 128 26 L 452 26 Q 460 26 460 34 L 460 44"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="2.5"
            strokeOpacity="0.4"
          />
          <path
            d="M 120 0 L 120 18 Q 120 26 128 26 L 452 26 Q 460 26 460 34 L 460 44"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="2.5"
            className="arch-flow-line"
          />
          <path
            d="M 460 0 L 460 44"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="2.5"
            className="arch-flow-line"
          />
          <path
            d="M 800 0 L 800 18 Q 800 26 792 26 L 468 26 Q 460 26 460 34 L 460 44"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="2.5"
            strokeOpacity="0.4"
          />
          <path
            d="M 800 0 L 800 18 Q 800 26 792 26 L 468 26 Q 460 26 460 34 L 460 44"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="2.5"
            className="arch-flow-line"
          />
          <circle cx="460" cy="26" r="4" fill="#22D3EE" />
        </svg>
      </div>
      <div className="w-0.5 h-6 bg-sky-400/50 lg:hidden" aria-hidden="true" />

      {/* Row 2: AquaMind AI Engine Centerpiece */}
      <div className="ai-engine-bar w-full max-w-[780px] rounded-2xl px-6 py-5 sm:px-9 sm:py-6 border border-sky-300/45 text-white flex flex-col sm:flex-row items-center justify-center gap-5 relative z-10">
        {/* Neural Brain SVG Node */}
        <div className="w-16 h-14 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 64 52" width="60" height="48" aria-hidden="true">
            <path
              d="M20 12 C12 12 8 19 9 26 C6 30 8 38 15 39 C18 44 27 45 31 41 L31 11 C28 9 23 10 20 12 Z"
              fill="rgba(56,189,248,0.18)"
              stroke="#38BDF8"
              strokeWidth="1.8"
            />
            <path
              d="M44 12 C52 12 56 19 55 26 C58 30 56 38 49 39 C46 44 37 45 33 41 L33 11 C36 9 41 10 44 12 Z"
              fill="rgba(56,189,248,0.18)"
              stroke="#38BDF8"
              strokeWidth="1.8"
            />
            <line x1="17" y1="22" x2="26" y2="18" stroke="#7DD3FC" strokeWidth="1.4" />
            <line x1="26" y1="18" x2="26" y2="31" stroke="#7DD3FC" strokeWidth="1.4" />
            <line x1="16" y1="31" x2="26" y2="31" stroke="#7DD3FC" strokeWidth="1.4" />
            <line x1="38" y1="18" x2="47" y2="23" stroke="#A3E635" strokeWidth="1.4" />
            <line x1="38" y1="18" x2="38" y2="31" stroke="#7DD3FC" strokeWidth="1.4" />
            <line x1="38" y1="31" x2="48" y2="32" stroke="#A3E635" strokeWidth="1.4" />
            <circle cx="17" cy="22" r="2.2" fill="#E0F2FE" />
            <circle cx="26" cy="18" r="2.2" fill="#38BDF8" />
            <circle cx="26" cy="31" r="2.2" fill="#38BDF8" />
            <circle cx="16" cy="31" r="2.2" fill="#E0F2FE" />
            <circle cx="38" cy="18" r="2.2" fill="#38BDF8" />
            <circle cx="47" cy="23" r="2.2" fill="#A3E635" />
            <circle cx="38" cy="31" r="2.2" fill="#38BDF8" />
            <circle cx="48" cy="32" r="2.2" fill="#A3E635" />
          </svg>
        </div>

        <div className="text-center sm:text-start">
          <h3 className="font-display font-bold text-2xl sm:text-[1.85rem] tracking-tight text-white leading-tight">
            {t('architecture.engineTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-sky-100/90 mt-1 font-medium tracking-wide">
            {t('architecture.engineSub')}
          </p>
        </div>
      </div>

      {/* Animated Branching SVG Connectors (AI Engine -> 4 AI Modules) */}
      <div className="w-full max-w-[960px] h-11 hidden lg:block pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 960 44" className="w-full h-full overflow-visible">
          <path
            d="M 480 0 L 480 18 Q 480 24 472 24 L 118 24 Q 110 24 110 32 L 110 44"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="2.5"
            className="arch-flow-line"
          />
          <path
            d="M 480 0 L 480 18 Q 480 24 472 24 L 364 24 Q 356 24 356 32 L 356 44"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="2.5"
            className="arch-flow-line"
          />
          <path
            d="M 480 0 L 480 18 Q 480 24 488 24 L 596 24 Q 604 24 604 32 L 604 44"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="2.5"
            className="arch-flow-line"
          />
          <path
            d="M 480 0 L 480 18 Q 480 24 488 24 L 842 24 Q 850 24 850 32 L 850 44"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="2.5"
            className="arch-flow-line"
          />
          <circle cx="480" cy="24" r="4" fill="#22D3EE" />
        </svg>
      </div>
      <div className="w-0.5 h-6 bg-sky-400/50 lg:hidden" aria-hidden="true" />

      {/* Row 3: 4 Interactive AI Modules */}
      <div className="w-full max-w-[1040px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {modules.map((mod) => {
          const style = MODULE_STYLES[mod.id];
          const isSelected = selectedModule === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => setSelectedModule(mod.id)}
              aria-pressed={isSelected}
              className={`rounded-2xl p-4 sm:p-5 border text-start transition-all duration-200 cursor-pointer flex items-center gap-3.5 ${
                style.card
              } ${isSelected ? style.activeRing : 'hover:-translate-y-0.5'}`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.iconBox}`}
              >
                {renderModuleIcon(mod.id)}
              </div>
              <div className="min-w-0">
                <div className={`font-display font-bold text-base leading-snug ${style.titleColor}`}>
                  {mod.title}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                  {mod.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Module Explanation Strip */}
      {activeModuleObj && (
        <div
          aria-live="polite"
          className="mt-4 w-full max-w-[780px] rounded-xl bg-white/85 dark:bg-[#081C30]/85 border border-sky-200 dark:border-cyan-400/20 px-5 py-3 text-center text-xs sm:text-sm text-slate-700 dark:text-slate-200 shadow-sm"
        >
          <span className="font-semibold text-[#082F4E] dark:text-[#22D3EE]">
            {activeModuleObj.title} :{' '}
          </span>
          {activeModuleObj.detail}
        </div>
      )}

      {/* Bridge Connector -> Dashboard Web + Application Mobile */}
      <div className="w-full max-w-[760px] h-9 hidden lg:block pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 760 36" className="w-full h-full overflow-visible">
          <path
            d="M 100 0 L 100 14 Q 100 22 108 22 L 372 22 Q 380 22 380 30 L 380 36"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="2"
            strokeOpacity="0.65"
          />
          <path
            d="M 660 0 L 660 14 Q 660 22 652 22 L 388 22 Q 380 22 380 30 L 380 36"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="2"
            strokeOpacity="0.65"
          />
          <circle cx="380" cy="22" r="3.5" fill="#0EA5E9" />
        </svg>
      </div>
      <div className="w-0.5 h-5 bg-sky-400/50 lg:hidden" aria-hidden="true" />

      {/* Bridge Pill CTA to Dashboard Demo */}
      <button
        type="button"
        onClick={onJumpToDashboard}
        className="ocean-card-header text-white px-6 py-3 rounded-2xl border border-sky-300/40 shadow-[0_14px_30px_rgba(8,47,78,0.22)] inline-flex items-center gap-3.5 hover:scale-[1.02] transition-transform cursor-pointer"
      >
        <MonitorSmartphone size={24} className="text-sky-200 shrink-0" aria-hidden="true" />
        <div className="text-start">
          <div className="font-display font-bold text-sm sm:text-base leading-tight">
            {t('architecture.bridgeTitle')}
          </div>
          <div className="text-[11px] sm:text-xs text-sky-100/85 leading-tight mt-0.5">
            {t('architecture.bridgeSubtitle')}
          </div>
        </div>
      </button>
    </div>
  );
}
