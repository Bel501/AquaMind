import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BrainCircuit,
  Building2,
  Check,
  CheckCircle2,
  CloudSun,
  Droplets,
  Factory,
  FileText,
  Gauge,
  Home,
  LayoutDashboard,
  Leaf,
  MapPin,
  Radio,
  Settings,
  ShieldAlert,
  Sparkles,
  Sprout,
  Tractor,
  Users,
  Waves,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AquaMindLogo } from './AquaMindLogo';

export type DashMode = 'agri' | 'hotel' | 'industry';
type SidebarTab = 'overview' | 'irrigation' | 'consumption' | 'leaks' | 'reports' | 'settings';
type MobileTab = 'home' | 'alerts' | 'irrigation' | 'reports';

interface TelemetryPoint {
  time: string;
  actual: number;
  predicted: number;
  bandBase: number;
  bandSpan: number;
  isAnomaly?: boolean;
  source?: string;
}

interface SiteTelemetryPayload {
  mode: DashMode;
  label: string;
  siteTitle: string;
  baseFlow: number;
  dailyVolume: string;
  dailyDelta: string;
  savedVolume: string;
  savedPct: string;
  moisture: number;
  pressure: number;
  weather: string;
  whenWindow: string;
  dose: string;
  zone: string;
  leakActive: boolean;
  irrigationApplied: boolean;
}

const INITIAL_SITES: Record<DashMode, SiteTelemetryPayload> = {
  agri: {
    mode: 'agri',
    label: 'Exploitation Agricole',
    siteTitle: 'Domaine Olivier Nord · 48 sondes LoRaWAN',
    baseFlow: 14.2,
    dailyVolume: '1 240 m³',
    dailyDelta: '-18 % vs mois dernier',
    savedVolume: '+ 320 m³',
    savedPct: '+20 %',
    moisture: 34.2,
    pressure: 3.1,
    weather: '24 °C · ET₀ 4.6 mm',
    whenWindow: 'Demain – 06:00',
    dose: '42 m³ / ha',
    zone: 'Zone B · Parcelle Vignes',
    leakActive: false,
    irrigationApplied: false,
  },
  hotel: {
    mode: 'hotel',
    label: 'Resort Hôtelier',
    siteTitle: 'Azur Resort & Spa · 32 compteurs réseau',
    baseFlow: 9.8,
    dailyVolume: '680 m³',
    dailyDelta: '-24 % vs mois dernier',
    savedVolume: '+ 215 m³',
    savedPct: '+25 %',
    moisture: 68.0,
    pressure: 2.8,
    weather: '27 °C · Humidité 54 %',
    whenWindow: 'Ce soir – 23:30',
    dose: '18 m³ / zone',
    zone: 'Piscine & Jardins Est',
    leakActive: false,
    irrigationApplied: false,
  },
  industry: {
    mode: 'industry',
    label: 'Site Industriel',
    siteTitle: 'Groupe AgroNova Ligne 3 · 64 débitmètres',
    baseFlow: 26.5,
    dailyVolume: '3 410 m³',
    dailyDelta: '-22 % vs mois dernier',
    savedVolume: '+ 890 m³',
    savedPct: '+22 %',
    moisture: 42.0,
    pressure: 4.4,
    weather: '18,4 °C · Appoint boucle',
    whenWindow: 'Cycle – 04:00',
    dose: '95 m³ / cycle',
    zone: 'Échangeur C4 · Process',
    leakActive: false,
    irrigationApplied: false,
  },
};

interface DashboardDemoProps {
  activeMode: DashMode;
  leakSimulated: boolean;
  onModeChange: (mode: DashMode) => void;
  onToggleLeak: () => void;
  onSyncLeakState?: (leakActive: boolean) => void;
}

export function DashboardDemo({
  activeMode,
  leakSimulated,
  onModeChange,
  onToggleLeak,
  onSyncLeakState,
}: DashboardDemoProps) {
  const { t } = useTranslation();

  const [siteState, setSiteState] = useState<SiteTelemetryPayload>(INITIAL_SITES[activeMode]);
  const [series, setSeries] = useState<TelemetryPoint[]>([]);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('overview');
  const [mobileTab, setMobileTab] = useState<MobileTab>('home');

  const featuresList = t('dashboard.featuresList', { returnObjects: true }) as Array<{
    title: string;
    sub: string;
  }>;
  const targetsList = t('dashboard.targetsList', { returnObjects: true }) as Array<{
    mode: DashMode;
    title: string;
    sub: string;
  }>;
  const benefitsList = t('dashboard.benefitsList', { returnObjects: true }) as string[];

  useEffect(() => {
    if (leakSimulated) {
      setSidebarTab('leaks');
      setMobileTab('alerts');
    }
  }, [leakSimulated]);

  // Fetch initial persisted site state & live telemetry from /api/telemetry
  useEffect(() => {
    let cancelled = false;

    const loadTelemetry = async (advance: boolean) => {
      try {
        const res = await fetch(
          `/api/telemetry?mode=${encodeURIComponent(activeMode)}${advance ? '&advance=1' : ''}`
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          ok?: boolean;
          site?: SiteTelemetryPayload;
          series?: TelemetryPoint[];
        };
        if (!cancelled && data.site && Array.isArray(data.series)) {
          setSiteState(data.site);
          setSeries(data.series);
          if (onSyncLeakState && data.site.leakActive !== leakSimulated) {
            onSyncLeakState(data.site.leakActive);
          }
        }
      } catch {
        // Keep last rendered snapshot if offline
      }
    };

    void loadTelemetry(false);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const intervalMs = prefersReduced ? 5000 : 2500;
    const timer = window.setInterval(() => {
      void loadTelemetry(true);
    }, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeMode, leakSimulated, onSyncLeakState]);

  const preset = siteState;
  const latestPoint = series[series.length - 1] ?? {
    time: '--:--',
    actual: preset.baseFlow,
    predicted: preset.baseFlow,
    bandBase: Math.max(0, preset.baseFlow - 1.1),
    bandSpan: 2.2,
  };
  const liveMoisture = preset.moisture;
  const livePressure = preset.pressure;
  const anomalyPoint = useMemo(
    () => series.find((pt) => pt.isAnomaly) || (leakSimulated ? latestPoint : undefined),
    [series, leakSimulated, latestPoint]
  );

  const isApplied = preset.irrigationApplied;

  const handleToggleLeakServer = async () => {
    const nextActive = !leakSimulated;
    onToggleLeak();
    try {
      const res = await fetch('/api/telemetry/leak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: activeMode, active: nextActive }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        site?: SiteTelemetryPayload;
        series?: TelemetryPoint[];
      };
      if (data.site && Array.isArray(data.series)) {
        setSiteState(data.site);
        setSeries(data.series);
        onSyncLeakState?.(data.site.leakActive);
      }
    } catch {
      // Keep optimistic toggle if offline
    }
  };

  const handleApplyIrrigation = async () => {
    setSiteState((prev) => ({ ...prev, irrigationApplied: true }));
    try {
      const res = await fetch('/api/telemetry/irrigation/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: activeMode, applied: true }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        site?: SiteTelemetryPayload;
        series?: TelemetryPoint[];
      };
      if (data.site && Array.isArray(data.series)) {
        setSiteState(data.site);
        setSeries(data.series);
      }
    } catch {
      // Keep optimistic applied state if offline
    }
  };

  const sidebarItems: Array<{ id: SidebarTab; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'overview', label: t('dashboard.sidebar.overview'), icon: LayoutDashboard },
    { id: 'irrigation', label: t('dashboard.sidebar.irrigation'), icon: Sprout },
    { id: 'consumption', label: t('dashboard.sidebar.consumption'), icon: BarChart3 },
    { id: 'leaks', label: t('dashboard.sidebar.leaks'), icon: AlertTriangle },
    { id: 'reports', label: t('dashboard.sidebar.reports'), icon: FileText },
    { id: 'settings', label: t('dashboard.sidebar.settings'), icon: Settings },
  ];

  const featureIcons = [BrainCircuit, Radio, CloudSun, AlertTriangle, Leaf];
  const featureColors = [
    'text-sky-600 dark:text-[#22D3EE] bg-sky-50 dark:bg-sky-950/60',
    'text-teal-600 dark:text-[#2DD4BF] bg-teal-50 dark:bg-teal-950/60',
    'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
    'text-orange-600 dark:text-[#F97316] bg-orange-50 dark:bg-orange-950/50',
    'text-emerald-600 dark:text-[#A3E635] bg-emerald-50 dark:bg-emerald-950/50',
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[270px_minmax(0,1fr)_275px] gap-5 items-stretch">
      {/* LEFT PANEL: Fonctionnalités clés */}
      <aside className="glass-panel rounded-2xl overflow-hidden flex flex-col bg-white/95 dark:bg-[#081C30]/90 border-sky-200 dark:border-[#22D3EE]/20">
        <div className="ocean-card-header px-5 py-3.5 text-white flex items-center gap-2.5">
          <Settings size={18} className="text-sky-200 shrink-0" aria-hidden="true" />
          <h3 className="font-display font-bold text-base tracking-tight">
            {t('dashboard.featuresPanelTitle')}
          </h3>
        </div>

        <ul className="p-4 space-y-3.5 flex-1 flex flex-col justify-between m-0 list-none">
          {featuresList.map((feat, idx) => {
            const Icon = featureIcons[idx] ?? BrainCircuit;
            return (
              <li
                key={feat.title}
                className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-white/6 last:border-b-0 last:pb-0"
              >
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${featureColors[idx]}`}
                >
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="font-display font-semibold text-sm text-[#082F4E] dark:text-slate-100 leading-snug">
                    {feat.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                    {feat.sub}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* CENTER: Dual-Device Interactive Showcase (Laptop Web + Mobile App) */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 bg-white/95 dark:bg-[#081C30]/90 border-sky-200 dark:border-[#22D3EE]/25 flex flex-col gap-4 min-w-0">
        {/* Interactive Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/10">
          <div
            role="tablist"
            aria-label="Choisir un environnement de démonstration"
            className="flex flex-wrap gap-1 p-1 rounded-full bg-slate-100 dark:bg-[#05121F]/80 border border-slate-200 dark:border-white/10"
          >
            {(Object.keys(INITIAL_SITES) as DashMode[]).map((modeKey) => {
              const active = activeMode === modeKey;
              return (
                <button
                  key={modeKey}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onModeChange(modeKey)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer ${
                    active
                      ? 'bg-[#082F4E] dark:bg-[#22D3EE] text-white dark:text-[#05121F]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {INITIAL_SITES[modeKey].label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-medium text-teal-700 dark:text-[#2DD4BF] whitespace-nowrap">
              {t('dashboard.liveStatus')}
            </span>
            <button
              type="button"
              onClick={() => void handleToggleLeakServer()}
              className={`px-3.5 py-1.5 rounded-full text-xs font-display font-semibold inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                leakSimulated
                  ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:bg-red-700'
                  : 'bg-orange-500/12 border border-orange-500/45 text-orange-700 dark:text-[#F97316] hover:bg-orange-600 hover:text-white'
              }`}
            >
              <ShieldAlert size={14} aria-hidden="true" />
              {leakSimulated ? t('dashboard.stopLeak') : t('dashboard.simulateLeak')}
            </button>
          </div>
        </div>

        {/* Devices Row: Laptop Web Dashboard + Smartphone App */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-4 items-center">
          {/* LAPTOP WEB DASHBOARD */}
          <div className="flex flex-col min-w-0">
            <div className="rounded-t-2xl border-[3px] border-slate-800 dark:border-slate-700 bg-[#F4F9FE] dark:bg-[#061626] overflow-hidden shadow-[0_18px_40px_rgba(8,47,78,0.16)] grid grid-cols-1 sm:grid-cols-[155px_minmax(0,1fr)]">
              {/* Laptop Dark Ocean Sidebar */}
              <div className="bg-[#062742] text-white p-3 flex sm:flex-col justify-between gap-2 overflow-x-auto">
                <div className="flex sm:flex-col gap-3 w-full">
                  <div className="flex items-center gap-2 px-1.5 py-1 shrink-0">
                    <AquaMindLogo size={20} />
                    <span className="font-display font-bold text-sm tracking-tight text-white">
                      AquaMind
                    </span>
                  </div>

                  <div className="flex sm:flex-col gap-1">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      const active = sidebarTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSidebarTab(item.id)}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer text-start ${
                            active
                              ? 'bg-sky-500/25 text-sky-200 border border-sky-400/35'
                              : 'text-slate-300/80 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon size={13} aria-hidden="true" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="hidden sm:block pt-3 border-t border-white/10 px-1.5 text-[10px] text-sky-200/75">
                  <div>{preset.zone}</div>
                  <div className="font-mono-tabular text-sky-300 mt-0.5">{preset.weather}</div>
                </div>
              </div>

              {/* Laptop Main Content */}
              <div className="p-3.5 sm:p-4 flex flex-col gap-3 min-w-0">
                {/* Top 4 KPIs matching reference image */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="rounded-xl bg-white dark:bg-[#0B2239] border border-slate-200/80 dark:border-white/10 p-2.5">
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                      {t('dashboard.kpiToday')}
                    </div>
                    <div className="font-mono-tabular font-bold text-base sm:text-lg text-[#082F4E] dark:text-white mt-0.5">
                      {preset.dailyVolume}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {preset.dailyDelta}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white dark:bg-[#0B2239] border border-slate-200/80 dark:border-white/10 p-2.5">
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                      {t('dashboard.kpiSavings')}
                    </div>
                    <div className="font-mono-tabular font-bold text-base sm:text-lg text-emerald-600 dark:text-[#A3E635] mt-0.5">
                      {preset.savedVolume}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      ({preset.savedPct})
                    </div>
                  </div>

                  <div
                    className={`rounded-xl border p-2.5 transition-colors ${
                      leakSimulated
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-500/45'
                        : 'bg-white dark:bg-[#0B2239] border-slate-200/80 dark:border-white/10'
                    }`}
                  >
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                      {t('dashboard.kpiLeaks')}
                    </div>
                    <div
                      className={`font-mono-tabular font-bold text-base sm:text-lg mt-0.5 ${
                        leakSimulated
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-teal-700 dark:text-[#2DD4BF]'
                      }`}
                    >
                      {leakSimulated ? '1' : '0'}
                    </div>
                    <div
                      className={`text-[10px] font-semibold mt-0.5 ${
                        leakSimulated
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-teal-600 dark:text-[#2DD4BF]'
                      }`}
                    >
                      {leakSimulated ? '▲ À traiter' : '✓ Réseau sain'}
                    </div>
                  </div>

                  <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-500/30 p-2.5">
                    <div className="text-[10px] font-medium text-slate-600 dark:text-slate-300 truncate">
                      {t('dashboard.kpiReco')}
                    </div>
                    <div className="font-display font-bold text-xs sm:text-sm text-[#082F4E] dark:text-white mt-0.5">
                      {preset.whenWindow}
                    </div>
                    <div className="font-mono-tabular text-[11px] font-bold text-emerald-700 dark:text-[#A3E635] mt-0.5">
                      {preset.dose}
                    </div>
                  </div>
                </div>

                {/* Live IoT Sensor Bar */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-white/90 dark:bg-[#0B2239]/80 border border-slate-200/70 dark:border-white/8 px-2.5 py-1.5 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Droplets size={12} className="text-emerald-600 dark:text-[#A3E635]" aria-hidden="true" />
                      {t('dashboard.sensors.moisture')}
                    </span>
                    <span className="font-mono-tabular font-bold text-[#082F4E] dark:text-white">
                      {liveMoisture} %
                    </span>
                  </div>
                  <div className="rounded-lg bg-white/90 dark:bg-[#0B2239]/80 border border-slate-200/70 dark:border-white/8 px-2.5 py-1.5 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Waves size={12} className={leakSimulated ? 'text-red-500' : 'text-sky-600 dark:text-[#22D3EE]'} aria-hidden="true" />
                      {t('dashboard.sensors.flow')}
                    </span>
                    <span
                      className={`font-mono-tabular font-bold ${
                        leakSimulated ? 'text-red-600 dark:text-red-400' : 'text-sky-700 dark:text-[#22D3EE]'
                      }`}
                    >
                      {latestPoint.actual.toFixed(1)} m³/h
                    </span>
                  </div>
                  <div className="rounded-lg bg-white/90 dark:bg-[#0B2239]/80 border border-slate-200/70 dark:border-white/8 px-2.5 py-1.5 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Gauge size={12} className="text-teal-600 dark:text-[#2DD4BF]" aria-hidden="true" />
                      {t('dashboard.sensors.pressure')}
                    </span>
                    <span className="font-mono-tabular font-bold text-[#082F4E] dark:text-white">
                      {livePressure} bar
                    </span>
                  </div>
                </div>

                {/* Bottom Split: Parcel Telemetry Map + Live Recharts Forecast */}
                <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-3">
                  {/* Parcel / Site Map Preview */}
                  <div className="rounded-xl bg-white dark:bg-[#0B2239] border border-slate-200/80 dark:border-white/10 p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-[#082F4E] dark:text-slate-200 flex items-center gap-1">
                        <MapPin size={12} className="text-sky-600 dark:text-[#22D3EE]" aria-hidden="true" />
                        {t('dashboard.parcelTitle')}
                      </span>
                      <span className="text-[10px] font-mono-tabular text-slate-500 dark:text-slate-400">
                        {activeMode.toUpperCase()}
                      </span>
                    </div>

                    <svg
                      viewBox="0 0 220 132"
                      className="w-full h-[142px] rounded-lg border border-emerald-700/15 overflow-hidden"
                      aria-label={t('dashboard.parcelTitle')}
                    >
                      <defs>
                        <linearGradient id="fieldBg" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#166534" />
                          <stop offset="55%" stopColor="#15803D" />
                          <stop offset="100%" stopColor="#1E3A2F" />
                        </linearGradient>
                      </defs>
                      <rect width="220" height="132" fill="url(#fieldBg)" />
                      {/* Crop / facility grid plots */}
                      <path
                        d="M0 42 L220 28 M0 86 L220 72 M70 0 L52 132 M148 0 L132 132"
                        stroke="#BBF7D0"
                        strokeOpacity="0.28"
                        strokeWidth="1.5"
                      />
                      <polygon
                        points="12,48 64,44 54,81 8,84"
                        fill="#22C55E"
                        fillOpacity="0.32"
                        stroke="#86EFAC"
                        strokeOpacity="0.5"
                      />
                      <polygon
                        points="74,42 142,36 134,75 66,80"
                        fill={leakSimulated ? '#EF4444' : '#0EA5E9'}
                        fillOpacity={leakSimulated ? '0.45' : '0.28'}
                        stroke={leakSimulated ? '#FCA5A5' : '#7DD3FC'}
                        strokeWidth="1.5"
                      />
                      <polygon
                        points="146,35 212,30 205,70 139,74"
                        fill="#22C55E"
                        fillOpacity="0.25"
                      />

                      {/* Sensor Nodes */}
                      <circle cx="38" cy="64" r="4" fill="#A3E635" stroke="#052E16" strokeWidth="1.2" />
                      <circle cx="176" cy="52" r="4" fill="#38BDF8" stroke="#082F4E" strokeWidth="1.2" />
                      <circle cx="104" cy="105" r="4" fill="#A3E635" stroke="#052E16" strokeWidth="1.2" />

                      {/* Center Target / Leak Node */}
                      <circle
                        cx="104"
                        cy="56"
                        r={leakSimulated ? '14' : '10'}
                        fill={leakSimulated ? '#EF4444' : '#0EA5E9'}
                        fillOpacity="0.3"
                      />
                      <circle
                        cx="104"
                        cy="56"
                        r="5.5"
                        fill={leakSimulated ? '#DC2626' : '#38BDF8'}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      <text
                        x="104"
                        y="22"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontWeight="700"
                      >
                        {leakSimulated ? 'ZONE B · ANOMALIE' : 'ZONE B · OPTIMAL'}
                      </text>
                    </svg>
                  </div>

                  {/* Live Consumption + Prediction Chart */}
                  <div className="rounded-xl bg-white dark:bg-[#0B2239] border border-slate-200/80 dark:border-white/10 p-2.5 flex flex-col justify-between">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-[#082F4E] dark:text-slate-100">
                        {t('dashboard.chartTitle')}
                      </span>
                      <div className="flex items-center gap-2 text-[9px] text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className={`w-2 h-[2px] ${
                              leakSimulated ? 'bg-red-500' : 'bg-[#0284C7] dark:bg-[#22D3EE]'
                            }`}
                          />
                          {t('dashboard.legendReal')}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-[2px] bg-[#16A34A] dark:bg-[#A3E635]" />
                          {t('dashboard.legendPred')}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-[142px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={series} margin={{ top: 6, right: 6, left: -24, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.16)" />
                          <XAxis
                            dataKey="time"
                            tick={{ fill: '#64748B', fontSize: 9 }}
                            axisLine={{ stroke: 'rgba(148, 163, 184, 0.25)' }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: '#64748B', fontSize: 9 }}
                            axisLine={false}
                            tickLine={false}
                            domain={['auto', 'auto']}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#082F4E',
                              borderColor: 'rgba(56, 189, 248, 0.4)',
                              borderRadius: '10px',
                              color: '#F1F5F9',
                              fontSize: '11px',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="bandBase"
                            stackId="conf"
                            stroke="none"
                            fill="transparent"
                            isAnimationActive={false}
                          />
                          <Area
                            type="monotone"
                            dataKey="bandSpan"
                            stackId="conf"
                            stroke="none"
                            fill="rgba(14, 165, 233, 0.18)"
                            isAnimationActive={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="predicted"
                            name={t('dashboard.legendPred')}
                            stroke="#16A34A"
                            strokeWidth={2}
                            strokeDasharray="5 3"
                            dot={false}
                            isAnimationActive={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="actual"
                            name={t('dashboard.legendReal')}
                            stroke={leakSimulated ? '#DC2626' : '#0284C7'}
                            strokeWidth={2.4}
                            dot={false}
                            isAnimationActive={false}
                          />
                          {anomalyPoint && (
                            <ReferenceDot
                              x={anomalyPoint.time}
                              y={anomalyPoint.actual}
                              r={5}
                              fill="#DC2626"
                              stroke="#FFFFFF"
                              strokeWidth={1.5}
                            />
                          )}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Laptop metallic base */}
            <div
              className="h-3 mx-auto w-[96%] rounded-b-xl bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-800 shadow-md"
              aria-hidden="true"
            />
          </div>

          {/* MOBILE APPLICATION MOCKUP (Synced live) */}
          <div className="w-full max-w-[232px] mx-auto rounded-[28px] border-[5px] border-slate-800 dark:border-slate-700 bg-white dark:bg-[#071A2D] shadow-[0_20px_42px_rgba(8,47,78,0.22)] overflow-hidden flex flex-col justify-between">
            {/* Phone Notch & Brand Header */}
            <div className="pt-2 pb-2.5 px-3.5 border-b border-slate-100 dark:border-white/10 bg-[#F8FBFF] dark:bg-[#082036]">
              <div className="w-12 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto mb-2" />
              <div className="flex items-center justify-center gap-1.5">
                <AquaMindLogo size={18} />
                <span className="font-display font-bold text-sm text-[#082F4E] dark:text-white">
                  AquaMind
                </span>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="p-3 space-y-2.5 flex-1">
              {/* Alert Card */}
              <div
                role="status"
                aria-live="polite"
                className={`rounded-xl p-2.5 border transition-colors ${
                  leakSimulated
                    ? 'bg-rose-50 dark:bg-rose-950/45 border-rose-300 dark:border-rose-500/45'
                    : 'bg-sky-50/80 dark:bg-sky-950/35 border-sky-200 dark:border-cyan-500/25'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={15}
                    className={`shrink-0 mt-0.5 ${
                      leakSimulated ? 'text-red-600 dark:text-red-400' : 'text-sky-600 dark:text-[#22D3EE]'
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <div
                      className={`font-display font-bold text-[11px] leading-tight ${
                        leakSimulated ? 'text-red-700 dark:text-red-300' : 'text-[#082F4E] dark:text-slate-100'
                      }`}
                    >
                      {leakSimulated ? 'Alerte fuite' : t('dashboard.alertTitle')}
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
                      {leakSimulated
                        ? 'Consommation anormale détectée (Zone B)'
                        : t('dashboard.alertNominal')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendation Card */}
              <div className="rounded-xl p-2.5 bg-emerald-50/90 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-500/35">
                <div className="flex items-start gap-2">
                  <Sparkles
                    size={15}
                    className="text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-[11px] text-emerald-900 dark:text-emerald-200 leading-tight">
                      {t('dashboard.recoTitle')}
                    </div>
                    <p className="text-[10px] text-slate-700 dark:text-slate-300 leading-snug mt-0.5">
                      {preset.whenWindow} ({preset.dose})
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleApplyIrrigation()}
                      className={`mt-2 w-full py-1 px-2 rounded-lg text-[10px] font-semibold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        isApplied
                          ? 'bg-teal-600 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isApplied && <Check size={11} aria-hidden="true" />}
                      {isApplied ? t('dashboard.recoApplied') : t('dashboard.recoApply')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Consumption Card */}
              <div className="rounded-xl p-2.5 bg-slate-50 dark:bg-[#0B2239] border border-slate-200/80 dark:border-white/10">
                <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {t('dashboard.kpiToday')}
                </div>
                <div className="flex items-baseline justify-between gap-2 mt-0.5">
                  <span className="font-mono-tabular font-bold text-base text-[#082F4E] dark:text-white">
                    {preset.dailyVolume}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-mono-tabular text-[10px] font-bold">
                    {preset.savedPct.replace('+', '-')}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="grid grid-cols-4 border-t border-slate-200 dark:border-white/10 bg-[#F8FBFF] dark:bg-[#082036] px-1 py-1.5">
              {(
                [
                  { id: 'home', label: t('dashboard.mobileTabs.home'), icon: Home },
                  { id: 'alerts', label: t('dashboard.mobileTabs.alerts'), icon: Bell },
                  { id: 'irrigation', label: t('dashboard.mobileTabs.irrigation'), icon: Sprout },
                  { id: 'reports', label: t('dashboard.mobileTabs.reports'), icon: BarChart3 },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = mobileTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMobileTab(tab.id)}
                    className={`flex flex-col items-center gap-0.5 py-1 rounded-lg text-[9px] font-medium cursor-pointer transition-colors ${
                      active
                        ? 'text-[#0284C7] dark:text-[#22D3EE] font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon size={13} aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Clients cibles + Bénéfices clés */}
      <div className="flex flex-col gap-4">
        {/* Clients cibles */}
        <div className="glass-panel rounded-2xl overflow-hidden bg-white/95 dark:bg-[#081C30]/90 border-sky-200 dark:border-[#22D3EE]/20">
          <div className="ocean-card-header px-5 py-3 text-white flex items-center gap-2.5">
            <Users size={17} className="text-sky-200 shrink-0" aria-hidden="true" />
            <h3 className="font-display font-bold text-base tracking-tight">
              {t('dashboard.targetsPanelTitle')}
            </h3>
          </div>

          <div className="p-3.5 space-y-2.5">
            {targetsList.map((target) => {
              const isSelected = activeMode === target.mode;
              return (
                <button
                  key={target.mode}
                  type="button"
                  onClick={() => onModeChange(target.mode)}
                  aria-pressed={isSelected}
                  className={`w-full text-start rounded-xl p-2.5 border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/45 border-sky-400 dark:border-[#22D3EE]/50 shadow-sm'
                      : 'bg-slate-50/70 dark:bg-[#05121F]/50 border-slate-200/70 dark:border-white/8 hover:border-sky-300'
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-white dark:bg-[#0B2239] border border-sky-200 dark:border-cyan-400/20 flex items-center justify-center shrink-0 text-[#082F4E] dark:text-[#22D3EE]">
                    {target.mode === 'agri' && <Tractor size={16} aria-hidden="true" />}
                    {target.mode === 'hotel' && <Building2 size={16} aria-hidden="true" />}
                    {target.mode === 'industry' && <Factory size={16} aria-hidden="true" />}
                  </span>
                  <div className="min-w-0">
                    <div className="font-display font-bold text-xs sm:text-sm text-[#082F4E] dark:text-slate-100 leading-snug">
                      {target.title}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                      {target.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bénéfices clés */}
        <div className="glass-panel rounded-2xl overflow-hidden bg-white/95 dark:bg-[#081C30]/90 border-emerald-200 dark:border-emerald-500/25 flex-1 flex flex-col">
          <div className="green-card-header px-5 py-3 text-white flex items-center gap-2.5">
            <Leaf size={17} className="text-emerald-100 shrink-0" aria-hidden="true" />
            <h3 className="font-display font-bold text-base tracking-tight">
              {t('dashboard.benefitsPanelTitle')}
            </h3>
          </div>

          <ul className="p-4 space-y-2.5 flex-1 flex flex-col justify-center m-0 list-none">
            {benefitsList.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-[#082F4E] dark:text-slate-200 font-medium leading-snug"
              >
                <CheckCircle2
                  size={17}
                  className="text-emerald-600 dark:text-[#A3E635] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
