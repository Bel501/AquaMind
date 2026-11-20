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
  Check,
  CloudRain,
  Droplets,
  Gauge,
  ShieldAlert,
  Sparkles,
  Waves,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type DashMode = 'agri' | 'hotel' | 'industry';

interface TelemetryPoint {
  time: string;
  actual: number;
  predicted: number;
  bandBase: number;
  bandSpan: number;
  isAnomaly?: boolean;
}

interface ModePreset {
  label: string;
  siteTitle: string;
  baseFlow: number;
  moisture: number;
  pressure: number;
  weather: string;
  when: string;
  liters: string;
  zone: string;
}

const MODE_PRESETS: Record<DashMode, ModePreset> = {
  agri: {
    label: 'Exploitation Agricole',
    siteTitle: 'Domaine Olivier Nord · 48 sondes LoRaWAN',
    baseFlow: 14.2,
    moisture: 34.2,
    pressure: 3.1,
    weather: '24 °C · ET0 4.6 mm',
    when: '22h30 – 23h45',
    liters: '4 200 L (-31 %)',
    zone: 'Parcelle B2 · Vignes Sud',
  },
  hotel: {
    label: 'Resort Hôtelier',
    siteTitle: 'Azur Resort & Spa · 32 compteurs réseau',
    baseFlow: 9.8,
    moisture: 68.0,
    pressure: 2.8,
    weather: '27 °C · Humidité 54 %',
    when: '01h15 – 02h00',
    liters: '1 850 L (-25 %)',
    zone: 'Boucle Piscine & Arrosage Est',
  },
  industry: {
    label: 'Site Industriel',
    siteTitle: 'Groupe AgroNova Ligne 3 · 64 débitmètres',
    baseFlow: 26.5,
    moisture: 42.0,
    pressure: 4.4,
    weather: '18,4 °C boucle · Appoint',
    when: 'Cycle continu 04h00',
    liters: '18 000 L (-22 %)',
    zone: 'Échangeur C4 · Refroidissement',
  },
};

function generateInitialSeries(baseFlow: number): TelemetryPoint[] {
  const now = new Date();
  const points: TelemetryPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 5 * 60_000);
    const label = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(
      2,
      '0'
    )}`;
    const wave = Math.sin((11 - i) * 0.55) * 1.4;
    const predicted = Number((baseFlow + wave).toFixed(2));
    const actual = Number((predicted + (Math.random() - 0.48) * 0.7).toFixed(2));
    const bandBase = Number(Math.max(0, predicted - 1.1).toFixed(2));
    const bandSpan = 2.2;
    points.push({ time: label, actual, predicted, bandBase, bandSpan });
  }
  return points;
}

interface DashboardDemoProps {
  activeMode: DashMode;
  leakSimulated: boolean;
  onModeChange: (mode: DashMode) => void;
  onToggleLeak: () => void;
}

export function DashboardDemo({
  activeMode,
  leakSimulated,
  onModeChange,
  onToggleLeak,
}: DashboardDemoProps) {
  const { t } = useTranslation();
  const preset = MODE_PRESETS[activeMode];

  const [series, setSeries] = useState<TelemetryPoint[]>(() =>
    generateInitialSeries(preset.baseFlow)
  );
  const [appliedModes, setAppliedModes] = useState<Record<DashMode, boolean>>({
    agri: false,
    hotel: false,
    industry: false,
  });
  const [tickCount, setTickCount] = useState(0);

  // Reset series cleanly when sector mode changes
  useEffect(() => {
    setSeries(generateInitialSeries(MODE_PRESETS[activeMode].baseFlow));
  }, [activeMode]);

  // Live IoT telemetry stream every 2.2 seconds
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const intervalMs = prefersReduced ? 5000 : 2200;

    const timer = window.setInterval(() => {
      setTickCount((c) => c + 1);
      setSeries((prev) => {
        const last = prev[prev.length - 1];
        const now = new Date();
        const label = `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        const nextPred = Number(
          (
            MODE_PRESETS[activeMode].baseFlow +
            Math.sin((prev.length + Date.now() / 4000) * 0.6) * 1.35
          ).toFixed(2)
        );
        const leakSpike = leakSimulated ? nextPred * 0.46 + 1.8 : 0;
        const actual = Number(
          (nextPred + leakSpike + (Math.random() - 0.45) * 0.65).toFixed(2)
        );
        const bandBase = Number(Math.max(0, nextPred - 1.1).toFixed(2));

        const nextPoint: TelemetryPoint = {
          time: label,
          actual: Number.isFinite(actual) ? actual : last.actual,
          predicted: nextPred,
          bandBase,
          bandSpan: 2.2,
          isAnomaly: leakSimulated,
        };

        return [...prev.slice(1), nextPoint];
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [activeMode, leakSimulated]);

  const latestPoint = series[series.length - 1];
  const liveMoisture = Number(
    (preset.moisture + Math.sin(tickCount * 0.5) * 0.3).toFixed(1)
  );
  const livePressure = Number(
    (
      preset.pressure -
      (leakSimulated ? 0.65 : 0) +
      Math.cos(tickCount * 0.4) * 0.04
    ).toFixed(2)
  );
  const anomalyPoint = useMemo(
    () => series.find((pt) => pt.isAnomaly) || (leakSimulated ? latestPoint : undefined),
    [series, leakSimulated, latestPoint]
  );

  const isApplied = appliedModes[activeMode];

  return (
    <div className="glass-panel rounded-[28px] p-5 sm:p-7 border-cyan-700/20 dark:border-[#22D3EE]/24">
      {/* Topbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200 dark:border-white/10">
        <div
          role="tablist"
          aria-label="Choisir un environnement de démonstration"
          className="flex flex-wrap gap-1.5 p-1.5 rounded-full bg-slate-100 dark:bg-[#05121F]/80 border border-slate-200 dark:border-white/10"
        >
          {(Object.keys(MODE_PRESETS) as DashMode[]).map((modeKey) => {
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
                    ? 'bg-cyan-600 dark:bg-[#22D3EE]/18 text-white dark:text-[#22D3EE] shadow-[inset_0_0_0_1px_rgba(34,211,238,0.38)]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {MODE_PRESETS[modeKey].label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-teal-700 dark:text-[#2DD4BF] whitespace-nowrap">
            {t('dashboard.liveStatus')}
          </span>

          <button
            type="button"
            onClick={onToggleLeak}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-display font-semibold inline-flex items-center gap-2 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
              leakSimulated
                ? 'bg-orange-500 text-white shadow-[0_0_24px_rgba(249,115,22,0.45)] hover:bg-orange-600'
                : 'bg-orange-500/12 border border-orange-500/45 text-orange-700 dark:text-[#F97316] hover:bg-orange-500 hover:text-white'
            }`}
          >
            <ShieldAlert size={15} aria-hidden="true" />
            {leakSimulated ? t('dashboard.stopLeak') : t('dashboard.simulateLeak')}
          </button>
        </div>
      </div>

      {/* Live IoT Sensor Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="rounded-2xl bg-slate-50 dark:bg-[#05121F]/70 border border-slate-200 dark:border-white/8 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>{t('dashboard.sensors.moisture')}</span>
            <Droplets size={15} className="text-lime-600 dark:text-[#A3E635]" aria-hidden="true" />
          </div>
          <div className="font-mono-tabular text-2xl font-bold text-slate-900 dark:text-slate-100">
            {liveMoisture} %
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 dark:bg-[#05121F]/70 border border-slate-200 dark:border-white/8 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>{t('dashboard.sensors.flow')}</span>
            <Waves
              size={15}
              className={
                leakSimulated
                  ? 'text-orange-600 dark:text-[#F97316]'
                  : 'text-cyan-600 dark:text-[#22D3EE]'
              }
              aria-hidden="true"
            />
          </div>
          <div
            className={`font-mono-tabular text-2xl font-bold ${
              leakSimulated
                ? 'text-orange-600 dark:text-[#F97316]'
                : 'text-cyan-700 dark:text-[#22D3EE]'
            }`}
          >
            {latestPoint.actual.toFixed(1)} m³/h
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 dark:bg-[#05121F]/70 border border-slate-200 dark:border-white/8 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>{t('dashboard.sensors.pressure')}</span>
            <Gauge size={15} className="text-teal-600 dark:text-[#2DD4BF]" aria-hidden="true" />
          </div>
          <div className="font-mono-tabular text-2xl font-bold text-slate-900 dark:text-slate-100">
            {livePressure} bar
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 dark:bg-[#05121F]/70 border border-slate-200 dark:border-white/8 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>{t('dashboard.sensors.weather')}</span>
            <CloudRain size={15} className="text-cyan-600 dark:text-[#22D3EE]" aria-hidden="true" />
          </div>
          <div className="font-mono-tabular text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
            {preset.weather}
          </div>
        </div>
      </div>

      {/* Chart + Alerts/Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6">
        <div className="rounded-[20px] bg-slate-50 dark:bg-[#05121F]/70 border border-slate-200 dark:border-white/8 p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                {preset.siteTitle}
              </h3>
              {leakSimulated && (
                <p className="text-xs font-semibold text-orange-600 dark:text-[#F97316] mt-1">
                  {t('dashboard.leakActiveBadge')}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`w-3 h-[3px] rounded ${
                    leakSimulated ? 'bg-[#F97316]' : 'bg-[#22D3EE]'
                  }`}
                  aria-hidden="true"
                />
                {t('dashboard.legendReal')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-[3px] rounded bg-[#A3E635]" aria-hidden="true" />
                {t('dashboard.legendPred')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-2.5 rounded-sm bg-[#22D3EE]/25" aria-hidden="true" />
                {t('dashboard.legendBand')}
              </span>
            </div>
          </div>

          <div className="w-full h-[260px] sm:h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.14)" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071728',
                    borderColor: 'rgba(34, 211, 238, 0.35)',
                    borderRadius: '12px',
                    color: '#F1F5F9',
                    fontSize: '12px',
                  }}
                />
                {/* Confidence band */}
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
                  fill="rgba(34, 211, 238, 0.16)"
                  isAnimationActive={false}
                />

                {/* Predicted ML curve */}
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name={t('dashboard.legendPred')}
                  stroke="#A3E635"
                  strokeWidth={2.2}
                  strokeDasharray="6 4"
                  dot={false}
                  isAnimationActive={false}
                />

                {/* Actual IoT flow curve */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  name={t('dashboard.legendReal')}
                  stroke={leakSimulated ? '#F97316' : '#22D3EE'}
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={false}
                />

                {anomalyPoint && (
                  <ReferenceDot
                    x={anomalyPoint.time}
                    y={anomalyPoint.actual}
                    r={7}
                    fill="#F97316"
                    stroke="#05121F"
                    strokeWidth={2}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Anomaly Alert + Irrigation Recommendation */}
        <div className="flex flex-col gap-4">
          <div
            role="status"
            aria-live="polite"
            className={`rounded-[20px] p-5 border transition-colors duration-300 ${
              leakSimulated
                ? 'bg-orange-500/12 border-orange-500/55'
                : 'bg-slate-50 dark:bg-[#05121F]/70 border-slate-200 dark:border-white/10'
            }`}
          >
            <div
              className={`inline-flex items-center gap-2 text-xs font-semibold mb-2 ${
                leakSimulated
                  ? 'text-orange-600 dark:text-[#F97316]'
                  : 'text-teal-700 dark:text-[#2DD4BF]'
              }`}
            >
              <AlertTriangle size={15} aria-hidden="true" />
              {t('dashboard.alertTitle')}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {leakSimulated ? t('dashboard.alertLeak') : t('dashboard.alertNominal')}
            </p>
          </div>

          <div className="rounded-[20px] p-5 bg-lime-500/8 dark:bg-[#A3E635]/8 border border-lime-600/30 dark:border-[#A3E635]/35 flex-1 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-lime-700 dark:text-[#A3E635] mb-3">
                <Sparkles size={15} aria-hidden="true" />
                {t('dashboard.recoTitle')}
              </div>

              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">{t('dashboard.whenLabel')}</dt>
                  <dd className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
                    {preset.when}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">{t('dashboard.volumeLabel')}</dt>
                  <dd className="font-mono-tabular font-semibold text-lime-700 dark:text-[#A3E635]">
                    {preset.liters}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">{t('dashboard.zoneLabel')}</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200 text-right">
                    {preset.zone}
                  </dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              onClick={() => setAppliedModes((prev) => ({ ...prev, [activeMode]: true }))}
              className={`mt-5 w-full py-3 px-4 rounded-xl font-display text-sm font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                isApplied
                  ? 'bg-teal-500/18 border border-teal-600/50 dark:border-[#2DD4BF]/60 text-teal-800 dark:text-[#2DD4BF]'
                  : 'bg-lime-500/18 border border-lime-600/45 dark:border-[#A3E635]/45 text-lime-800 dark:text-[#A3E635] hover:bg-lime-600 dark:hover:bg-[#A3E635] hover:text-white dark:hover:text-[#05121F]'
              }`}
            >
              {isApplied ? (
                <>
                  <Check size={16} aria-hidden="true" />
                  {t('dashboard.recoApplied')}
                </>
              ) : (
                t('dashboard.recoApply')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
