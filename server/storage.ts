import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export type SiteMode = 'agri' | 'hotel' | 'industry';

export interface DemoLeadRecord {
  id: number;
  name: string;
  company: string;
  sector: string;
  email: string;
  message: string;
  deliveryStatus: string;
  createdAt: string;
}

export interface SiteTelemetryState {
  mode: SiteMode;
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
  lastIngestAt: number;
}

export interface TelemetryPointRecord {
  time: string;
  actual: number;
  predicted: number;
  bandBase: number;
  bandSpan: number;
  isAnomaly: boolean;
  source: string;
  createdAtMs: number;
}

interface SiteSeed {
  mode: SiteMode;
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
}

const SITE_SEEDS: SiteSeed[] = [
  {
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
  },
  {
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
  },
  {
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
  },
];

const dbPath =
  process.env.AQUAMIND_DB_PATH?.trim() ||
  path.resolve(process.cwd(), 'data', 'aquamind.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');
db.exec(`
  CREATE TABLE IF NOT EXISTS demo_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    sector TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    ip TEXT NOT NULL DEFAULT '',
    delivery_status TEXT NOT NULL DEFAULT 'persisted',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_states (
    mode TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    site_title TEXT NOT NULL,
    base_flow REAL NOT NULL,
    daily_volume TEXT NOT NULL,
    daily_delta TEXT NOT NULL,
    saved_volume TEXT NOT NULL,
    saved_pct TEXT NOT NULL,
    moisture REAL NOT NULL,
    pressure REAL NOT NULL,
    weather TEXT NOT NULL,
    when_window TEXT NOT NULL,
    dose TEXT NOT NULL,
    zone TEXT NOT NULL,
    leak_active INTEGER NOT NULL DEFAULT 0,
    irrigation_applied INTEGER NOT NULL DEFAULT 0,
    last_ingest_at INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS telemetry_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL,
    time_label TEXT NOT NULL,
    actual REAL NOT NULL,
    predicted REAL NOT NULL,
    band_base REAL NOT NULL,
    band_span REAL NOT NULL,
    moisture REAL NOT NULL,
    pressure REAL NOT NULL,
    is_anomaly INTEGER NOT NULL DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'baseline',
    created_at_ms INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_telemetry_mode_id
    ON telemetry_readings (mode, id DESC);
`);

function formatClock(date: Date, withSeconds = false): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  if (!withSeconds) return `${hh}:${mm}`;
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function seedTelemetryIfNeeded(): void {
  const countSite = db
    .prepare('SELECT COUNT(*) as total FROM site_states')
    .get() as { total: number };

  if (countSite.total === 0) {
    const insertSite = db.prepare(`
      INSERT INTO site_states (
        mode, label, site_title, base_flow, daily_volume, daily_delta,
        saved_volume, saved_pct, moisture, pressure, weather, when_window,
        dose, zone, leak_active, irrigation_applied, last_ingest_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)
    `);

    const insertPoint = db.prepare(`
      INSERT INTO telemetry_readings (
        mode, time_label, actual, predicted, band_base, band_span,
        moisture, pressure, is_anomaly, source, created_at_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'baseline', ?)
    `);

    const nowMs = Date.now();
    for (const seed of SITE_SEEDS) {
      insertSite.run(
        seed.mode,
        seed.label,
        seed.siteTitle,
        seed.baseFlow,
        seed.dailyVolume,
        seed.dailyDelta,
        seed.savedVolume,
        seed.savedPct,
        seed.moisture,
        seed.pressure,
        seed.weather,
        seed.whenWindow,
        seed.dose,
        seed.zone
      );

      for (let i = 11; i >= 0; i--) {
        const ts = nowMs - i * 5 * 60_000;
        const wave = Math.sin((11 - i) * 0.55) * 1.35;
        const predicted = Number((seed.baseFlow + wave).toFixed(2));
        const actual = Number((predicted + Math.cos(i * 0.9) * 0.35).toFixed(2));
        const bandBase = Number(Math.max(0, predicted - 1.1).toFixed(2));
        insertPoint.run(
          seed.mode,
          formatClock(new Date(ts), false),
          actual,
          predicted,
          bandBase,
          2.2,
          seed.moisture,
          seed.pressure,
          ts
        );
      }
    }
  }
}

seedTelemetryIfNeeded();

export function insertDemoRequest(input: {
  name: string;
  company: string;
  sector: string;
  email: string;
  message: string;
  ip: string;
}): { id: number; createdAt: string } {
  const createdAt = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO demo_requests (name, company, sector, email, message, ip, delivery_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'persisted', ?)
  `);
  const res = stmt.run(
    input.name,
    input.company,
    input.sector,
    input.email,
    input.message,
    input.ip,
    createdAt
  );
  return {
    id: Number(res.lastInsertRowid),
    createdAt,
  };
}

export function updateDemoDeliveryStatus(id: number, status: string): void {
  db.prepare('UPDATE demo_requests SET delivery_status = ? WHERE id = ?').run(status, id);
}

export function listDemoRequests(limit = 50): DemoLeadRecord[] {
  const safeLimit = Math.min(Math.max(1, limit), 200);
  const rows = db
    .prepare(
      `SELECT id, name, company, sector, email, message, delivery_status, created_at
       FROM demo_requests
       ORDER BY id DESC
       LIMIT ?`
    )
    .all(safeLimit) as Array<{
    id: number;
    name: string;
    company: string;
    sector: string;
    email: string;
    message: string;
    delivery_status: string;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    company: row.company,
    sector: row.sector,
    email: row.email,
    message: row.message,
    deliveryStatus: row.delivery_status,
    createdAt: row.created_at,
  }));
}

function getSiteRow(mode: SiteMode): SiteTelemetryState {
  const row = db
    .prepare('SELECT * FROM site_states WHERE mode = ?')
    .get(mode) as {
    mode: SiteMode;
    label: string;
    site_title: string;
    base_flow: number;
    daily_volume: string;
    daily_delta: string;
    saved_volume: string;
    saved_pct: string;
    moisture: number;
    pressure: number;
    weather: string;
    when_window: string;
    dose: string;
    zone: string;
    leak_active: number;
    irrigation_applied: number;
    last_ingest_at: number;
  };

  return {
    mode: row.mode,
    label: row.label,
    siteTitle: row.site_title,
    baseFlow: row.base_flow,
    dailyVolume: row.daily_volume,
    dailyDelta: row.daily_delta,
    savedVolume: row.saved_volume,
    savedPct: row.saved_pct,
    moisture: row.moisture,
    pressure: row.pressure,
    weather: row.weather,
    whenWindow: row.when_window,
    dose: row.dose,
    zone: row.zone,
    leakActive: row.leak_active === 1,
    irrigationApplied: row.irrigation_applied === 1,
    lastIngestAt: row.last_ingest_at,
  };
}

function pruneReadings(mode: SiteMode): void {
  db.prepare(`
    DELETE FROM telemetry_readings
    WHERE mode = ? AND id NOT IN (
      SELECT id FROM telemetry_readings WHERE mode = ? ORDER BY id DESC LIMIT 60
    )
  `).run(mode, mode);
}

interface TelemetryPointRow extends TelemetryPointRecord {
  moisture: number;
  pressure: number;
}

function appendReading(
  mode: SiteMode,
  point: TelemetryPointRow
): void {
  db.prepare(`
    INSERT INTO telemetry_readings (
      mode, time_label, actual, predicted, band_base, band_span,
      moisture, pressure, is_anomaly, source, created_at_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    mode,
    point.time,
    point.actual,
    point.predicted,
    point.bandBase,
    point.bandSpan,
    point.moisture,
    point.pressure,
    point.isAnomaly ? 1 : 0,
    point.source,
    point.createdAtMs
  );
  pruneReadings(mode);
}

export function getTelemetrySnapshot(
  mode: SiteMode,
  advanceIfStale = false
): {
  site: SiteTelemetryState;
  series: TelemetryPointRecord[];
} {
  let site = getSiteRow(mode);
  const nowMs = Date.now();

  const latest = db
    .prepare(
      'SELECT created_at_ms FROM telemetry_readings WHERE mode = ? ORDER BY id DESC LIMIT 1'
    )
    .get(mode) as { created_at_ms: number } | undefined;

  const hasRecentExternalIngest = nowMs - site.lastIngestAt < 12_000;
  const isStale = !latest || nowMs - latest.created_at_ms >= 2_000;

  if (advanceIfStale && isStale && !hasRecentExternalIngest) {
    const phase = nowMs / 4000;
    const predicted = Number((site.baseFlow + Math.sin(phase * 0.6) * 1.35).toFixed(2));
    const leakSpike = site.leakActive ? predicted * 0.46 + 1.8 : 0;
    const actual = Number(
      (predicted + leakSpike + Math.sin(phase * 1.7) * 0.32).toFixed(2)
    );
    const bandBase = Number(Math.max(0, predicted - 1.1).toFixed(2));
    const moisture = Number((site.moisture + Math.sin(phase * 0.4) * 0.25).toFixed(1));
    const pressure = Number(
      (
        site.pressure -
        (site.leakActive ? 0.65 : 0) +
        Math.cos(phase * 0.5) * 0.04
      ).toFixed(2)
    );

    appendReading(mode, {
      time: formatClock(new Date(nowMs), true),
      actual,
      predicted,
      bandBase,
      bandSpan: 2.2,
      moisture,
      pressure,
      isAnomaly: site.leakActive,
      source: 'stream',
      createdAtMs: nowMs,
    } as TelemetryPointRow);
  }

  const rows = db
    .prepare(
      `SELECT time_label, actual, predicted, band_base, band_span, is_anomaly, source, created_at_ms, moisture, pressure
       FROM telemetry_readings
       WHERE mode = ?
       ORDER BY id DESC
       LIMIT 12`
    )
    .all(mode) as Array<{
    time_label: string;
    actual: number;
    predicted: number;
    band_base: number;
    band_span: number;
    is_anomaly: number;
    source: string;
    created_at_ms: number;
    moisture: number;
    pressure: number;
  }>;

  const ordered = rows.reverse();
  const latestRow = ordered[ordered.length - 1];
  if (latestRow) {
    site = {
      ...site,
      moisture: latestRow.moisture,
      pressure: latestRow.pressure,
    };
  }

  return {
    site,
    series: ordered.map((r) => ({
      time: r.time_label,
      actual: r.actual,
      predicted: r.predicted,
      bandBase: r.band_base,
      bandSpan: r.band_span,
      isAnomaly: r.is_anomaly === 1,
      source: r.source,
      createdAtMs: r.created_at_ms,
    })),
  };
}

export function setSiteLeakState(
  mode: SiteMode,
  active?: boolean
): { site: SiteTelemetryState; series: TelemetryPointRecord[] } {
  const current = getSiteRow(mode);
  const nextActive = typeof active === 'boolean' ? active : !current.leakActive;

  db.prepare('UPDATE site_states SET leak_active = ? WHERE mode = ?').run(
    nextActive ? 1 : 0,
    mode
  );

  const nowMs = Date.now();
  const predicted = Number(
    (current.baseFlow + Math.sin((nowMs / 4000) * 0.6) * 1.2).toFixed(2)
  );
  const actual = Number(
    (predicted + (nextActive ? predicted * 0.46 + 1.8 : 0)).toFixed(2)
  );
  const bandBase = Number(Math.max(0, predicted - 1.1).toFixed(2));
  const pressure = Number(
    (current.pressure - (nextActive ? 0.65 : 0)).toFixed(2)
  );

  appendReading(mode, {
    time: formatClock(new Date(nowMs), true),
    actual,
    predicted,
    bandBase,
    bandSpan: 2.2,
    moisture: current.moisture,
    pressure,
    isAnomaly: nextActive,
    source: nextActive ? 'leak-trigger' : 'leak-resolved',
    createdAtMs: nowMs,
  } as TelemetryPointRow);

  return getTelemetrySnapshot(mode, false);
}

export function applySiteIrrigation(
  mode: SiteMode,
  applied = true
): { site: SiteTelemetryState; series: TelemetryPointRecord[] } {
  db.prepare('UPDATE site_states SET irrigation_applied = ? WHERE mode = ?').run(
    applied ? 1 : 0,
    mode
  );
  return getTelemetrySnapshot(mode, false);
}

export function ingestSensorReading(input: {
  mode: SiteMode;
  flow: number;
  moisture?: number;
  pressure?: number;
  sensorId?: string;
}): { site: SiteTelemetryState; series: TelemetryPointRecord[]; anomalyDetected: boolean } {
  const current = getSiteRow(input.mode);
  const nowMs = Date.now();
  const predicted = Number(
    (current.baseFlow + Math.sin((nowMs / 4000) * 0.6) * 1.2).toFixed(2)
  );
  const anomalyDetected = input.flow > predicted * 1.28;
  const nextMoisture =
    typeof input.moisture === 'number' ? Number(input.moisture.toFixed(1)) : current.moisture;
  const nextPressure =
    typeof input.pressure === 'number' ? Number(input.pressure.toFixed(2)) : current.pressure;

  db.prepare(
    `UPDATE site_states
     SET moisture = ?, pressure = ?, leak_active = ?, last_ingest_at = ?
     WHERE mode = ?`
  ).run(nextMoisture, nextPressure, anomalyDetected ? 1 : 0, nowMs, input.mode);

  appendReading(input.mode, {
    time: formatClock(new Date(nowMs), true),
    actual: Number(input.flow.toFixed(2)),
    predicted,
    bandBase: Number(Math.max(0, predicted - 1.1).toFixed(2)),
    bandSpan: 2.2,
    moisture: nextMoisture,
    pressure: nextPressure,
    isAnomaly: anomalyDetected,
    source: input.sensorId?.trim() || 'iot-gateway',
    createdAtMs: nowMs,
  } as TelemetryPointRow);

  const snapshot = getTelemetrySnapshot(input.mode, false);
  return { ...snapshot, anomalyDetected };
}
