import 'dotenv/config';
import crypto from 'node:crypto';
import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { z } from 'zod';
import {
  applySiteIrrigation,
  getTelemetrySnapshot,
  ingestSensorReading,
  insertDemoRequest,
  listDemoRequests,
  setSiteLeakState,
  updateDemoDeliveryStatus,
  type SiteMode,
} from './server/storage.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// ============================================================================
// Rate limiting en mémoire par IP pour protéger /api/chat
// ============================================================================
interface RateBucket {
  count: number;
  resetAt: number;
}
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 15;
const rateLimits = new Map<string, RateBucket>();

function isRateLimited(ip: string): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();
  const existing = rateLimits.get(ip);

  if (!existing || now > existing.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { limited: false, retryAfterSec: 0 };
  }

  if (existing.count >= RATE_MAX_REQUESTS) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { limited: true, retryAfterSec };
  }

  existing.count += 1;
  return { limited: false, retryAfterSec: 0 };
}

// Nettoyage périodique des entrées expirées
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of rateLimits.entries()) {
    if (now > bucket.resetAt) {
      rateLimits.delete(ip);
    }
  }
}, RATE_WINDOW_MS).unref();

// ============================================================================
// Schémas de validation Zod
// ============================================================================
const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(2, 'Le message doit contenir au moins 2 caractères.')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères.'),
  locale: z.enum(['fr', 'en', 'ar']).default('fr'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string().trim().max(1500),
      })
    )
    .max(10)
    .optional(),
});

const demoRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(160),
  sector: z.enum(['agriculture', 'hotellerie', 'industrie', 'autre']),
  email: z.string().trim().email(),
  message: z.string().trim().min(10).max(1500),
});

const siteModeSchema = z.enum(['agri', 'hotel', 'industry']);

const leakToggleSchema = z.object({
  mode: siteModeSchema,
  active: z.boolean().optional(),
});

const irrigationApplySchema = z.object({
  mode: siteModeSchema,
  applied: z.boolean().optional(),
});

const sensorIngestSchema = z.object({
  mode: siteModeSchema,
  flow: z.number().finite().min(0).max(5000),
  moisture: z.number().finite().min(0).max(100).optional(),
  pressure: z.number().finite().min(0).max(30).optional(),
  sensorId: z.string().trim().max(80).optional(),
});

function verifyBearerToken(req: Request, expectedSecret: string): boolean {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return false;
  const token = header.slice('Bearer '.length).trim();
  const a = Buffer.from(token);
  const b = Buffer.from(expectedSecret);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function dispatchDemoNotifications(lead: {
  id: number;
  name: string;
  company: string;
  sector: string;
  email: string;
  message: string;
  createdAt: string;
}): Promise<string> {
  const deliveries: string[] = [];

  const webhookUrl = process.env.DEMO_WEBHOOK_URL?.trim();
  if (webhookUrl) {
    try {
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'aquamind.demo_request',
          ...lead,
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (resp.ok) deliveries.push('webhook');
    } catch {
      // Keep persisted status intact even if external webhook fails
    }
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const notifyEmail = process.env.DEMO_NOTIFY_EMAIL?.trim();
  if (resendKey && notifyEmail) {
    const fromEmail =
      process.env.DEMO_FROM_EMAIL?.trim() || 'AquaMind <onboarding@resend.dev>';
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [notifyEmail],
          subject: `[AquaMind] Nouvelle demande de démo — ${lead.company}`,
          html: `
            <h2>Nouvelle demande de démo AquaMind (#${lead.id})</h2>
            <p><strong>Nom :</strong> ${escapeHtml(lead.name)}</p>
            <p><strong>Entreprise :</strong> ${escapeHtml(lead.company)}</p>
            <p><strong>Secteur :</strong> ${escapeHtml(lead.sector)}</p>
            <p><strong>Email :</strong> ${escapeHtml(lead.email)}</p>
            <p><strong>Message :</strong><br/>${escapeHtml(lead.message)}</p>
            <p><small>Reçu le ${escapeHtml(lead.createdAt)}</small></p>
          `,
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (resp.ok) deliveries.push('email');
    } catch {
      // Keep persisted status intact even if email dispatch fails
    }
  }

  return deliveries.length > 0 ? `persisted+${deliveries.join('+')}` : 'persisted';
}

// ============================================================================
// Client Gemini côté serveur uniquement (clé GEMINI_API_KEY jamais exposée)
// ============================================================================
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildSystemInstruction(locale: 'fr' | 'en' | 'ar'): string {
  const langLabel =
    locale === 'ar'
      ? 'Arabic (العربية)'
      : locale === 'en'
      ? 'English'
      : 'French (français)';

  return [
    `You are AquaMind AI, the specialized water intelligence assistant for the AquaMind platform.`,
    `Always respond in ${langLabel}.`,
    `AquaMind combines IoT sensors (soil moisture, flow rate, pipe pressure, salinity), hyperlocal weather/ET0 data, and time-series Machine Learning to predict irrigation needs and detect water leaks in real time (< 4 minutes) for agriculture, hospitality (hotels/resorts), and industrial cooling/process loops.`,
    `Keep answers concise (2 to 4 crisp sentences or short bullet points), practical, data-grounded, and directly helpful to farm managers, hotel technical directors, or industrial facility engineers.`,
    `Never invent customer credentials or claim to access live private sensors unless referring to the AquaMind demo simulation.`,
  ].join(' ');
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '64kb' }));

  // Healthcheck
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'aquamind-api' });
  });

  // Route Assistant IA Gemini (/api/chat)
  app.post('/api/chat', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const rate = isRateLimited(clientIp);
    if (rate.limited) {
      res.setHeader('Retry-After', String(rate.retryAfterSec));
      res.status(429).json({
        error: 'Trop de requêtes envoyées. Veuillez patienter quelques instants.',
        code: 'RATE_LIMITED',
        retryAfterSec: rate.retryAfterSec,
      });
      return;
    }

    const parsed = chatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Requête invalide.',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const { message, locale, history } = parsed.data;
    const ai = getGeminiClient();

    if (!ai) {
      res.status(503).json({
        error:
          "Le service Gemini n'est pas configuré côté serveur (GEMINI_API_KEY manquante).",
        code: 'API_UNAVAILABLE',
      });
      return;
    }

    const contents = [
      ...(history ?? []).slice(-6).map((h) => ({
        role: h.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: h.text }],
      })),
      { role: 'user' as const, parts: [{ text: message }] },
    ];

    const attempts: Array<{ model: string; thinkingLevel?: ThinkingLevel; delayMs: number }> = [
      { model: 'gemini-3.1-flash-lite', delayMs: 0 },
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayMs: 250 },
      { model: 'gemini-3.1-flash-lite', delayMs: 600 },
    ];

    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
      new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(Object.assign(new Error('Upstream model timeout'), { status: 504 }));
        }, ms);
        promise.then(
          (val) => {
            clearTimeout(timer);
            resolve(val);
          },
          (err) => {
            clearTimeout(timer);
            reject(err);
          }
        );
      });

    let lastErr: unknown = null;

    for (const attempt of attempts) {
      if (attempt.delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, attempt.delayMs));
      }

      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: attempt.model,
            contents,
            config: {
              systemInstruction: buildSystemInstruction(locale),
              ...(attempt.thinkingLevel
                ? { thinkingConfig: { thinkingLevel: attempt.thinkingLevel } }
                : {}),
            },
          }),
          14000
        );

        const reply = response.text?.trim();
        if (reply) {
          res.json({ reply, model: attempt.model });
          return;
        }
      } catch (err: unknown) {
        lastErr = err;
        const errObj = err as { status?: number };
        const status = typeof errObj?.status === 'number' ? errObj.status : 500;
        // Do not retry on auth/key errors (400/401/403)
        if (status === 400 || status === 401 || status === 403) {
          break;
        }
      }
    }

    const errObj = lastErr as { status?: number };
    const errMsg = lastErr instanceof Error ? lastErr.message : String(lastErr ?? 'Erreur inconnue');
    const status = typeof errObj?.status === 'number' ? errObj.status : 503;
    console.error('[AquaMind /api/chat] All Gemini attempts failed:', status, errMsg);

    const localizedError =
      locale === 'en'
        ? status === 403 || status === 400
          ? 'Gemini API key is missing or invalid in Settings > Secrets.'
          : 'The AI model is temporarily overloaded. Please retry in a few seconds.'
        : locale === 'ar'
        ? status === 403 || status === 400
          ? 'مفتاح Gemini API مفقود أو غير صالح في الإعدادات.'
          : 'نموذج الذكاء الاصطناعي مشغول حاليًا. يرجى المحاولة بعد ثوانٍ.'
        : status === 403 || status === 400
        ? 'Clé API Gemini invalide ou manquante dans Settings > Secrets.'
        : "Le modèle IA connaît un pic de charge temporaire. Réessayez dans quelques secondes.";

    res.status(status >= 400 && status < 600 ? status : 503).json({
      error: localizedError,
      code:
        status === 404
          ? 'MODEL_NOT_FOUND'
          : status === 403 || status === 400
          ? 'API_KEY_ERROR'
          : 'UPSTREAM_ERROR',
    });
  });

  // Route de validation et persistance de demande de démo (/api/demo-request)
  app.post('/api/demo-request', async (req: Request, res: Response) => {
    const parsed = demoRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Champs du formulaire invalides.',
        issues: parsed.error.issues,
      });
      return;
    }

    const clientIp = req.ip || req.socket.remoteAddress || '';
    const saved = insertDemoRequest({
      ...parsed.data,
      ip: clientIp,
    });

    const deliveryStatus = await dispatchDemoNotifications({
      id: saved.id,
      ...parsed.data,
      createdAt: saved.createdAt,
    });

    if (deliveryStatus !== 'persisted') {
      updateDemoDeliveryStatus(saved.id, deliveryStatus);
    }

    res.status(201).json({
      ok: true,
      id: saved.id,
      receivedAt: saved.createdAt,
      deliveryStatus,
      lead: {
        name: parsed.data.name,
        company: parsed.data.company,
        sector: parsed.data.sector,
      },
    });
  });

  // Consultation protégée des leads enregistrés (ADMIN_API_KEY requis)
  app.get('/api/demo-requests', (req: Request, res: Response) => {
    const adminKey = process.env.ADMIN_API_KEY?.trim();
    if (!adminKey) {
      res.status(503).json({
        error: 'ADMIN_API_KEY non configurée sur le serveur.',
      });
      return;
    }

    if (!verifyBearerToken(req, adminKey)) {
      res.status(401).json({ error: 'Accès non autorisé.' });
      return;
    }

    const limitParam = Number(req.query.limit ?? 50);
    const leads = listDemoRequests(Number.isFinite(limitParam) ? limitParam : 50);
    res.json({ ok: true, count: leads.length, leads });
  });

  // ============================================================================
  // Routes Télémétrie IoT persistées côté serveur (/api/telemetry/*)
  // ============================================================================
  app.get('/api/telemetry', (req: Request, res: Response) => {
    const modeParsed = siteModeSchema.safeParse(req.query.mode ?? 'agri');
    if (!modeParsed.success) {
      res.status(400).json({ error: 'Mode de site invalide.' });
      return;
    }
    const advance = req.query.advance === '1';
    const snapshot = getTelemetrySnapshot(modeParsed.data as SiteMode, advance);
    res.json({ ok: true, ...snapshot });
  });

  app.post('/api/telemetry/leak', (req: Request, res: Response) => {
    const parsed = leakToggleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Paramètres de simulation invalides.' });
      return;
    }
    const snapshot = setSiteLeakState(parsed.data.mode as SiteMode, parsed.data.active);
    res.json({ ok: true, ...snapshot });
  });

  app.post('/api/telemetry/irrigation/apply', (req: Request, res: Response) => {
    const parsed = irrigationApplySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Paramètres d'irrigation invalides." });
      return;
    }
    const snapshot = applySiteIrrigation(
      parsed.data.mode as SiteMode,
      parsed.data.applied ?? true
    );
    res.json({ ok: true, ...snapshot });
  });

  app.post('/api/telemetry/ingest', (req: Request, res: Response) => {
    const ingestKey = process.env.IOT_INGEST_KEY?.trim();
    if (ingestKey && !verifyBearerToken(req, ingestKey)) {
      res.status(401).json({ error: 'Clé passerelle IoT invalide.' });
      return;
    }

    const parsed = sensorIngestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Mesure capteur invalide.',
        issues: parsed.error.issues,
      });
      return;
    }

    const result = ingestSensorReading({
      mode: parsed.data.mode as SiteMode,
      flow: parsed.data.flow,
      moisture: parsed.data.moisture,
      pressure: parsed.data.pressure,
      sensorId: parsed.data.sensorId,
    });
    res.status(201).json({ ok: true, ...result });
  });

  // Montage Vite en développement ou fichiers statiques en production
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AquaMind server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AquaMind server:', err);
  process.exit(1);
});
