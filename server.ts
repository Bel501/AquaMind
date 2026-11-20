import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { z } from 'zod';

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
  message: z.string().trim().min(5).max(1500),
});

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
        fallbackAvailable: true,
      });
      return;
    }

    try {
      const historyContext =
        history && history.length > 0
          ? history
              .slice(-6)
              .map((h) => `${h.role === 'user' ? 'User' : 'AquaMind'}: ${h.text}`)
              .join('\n') + `\nUser: ${message}`
          : message;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: historyContext,
        config: {
          systemInstruction: buildSystemInstruction(locale),
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({
          error: "Réponse vide reçue du modèle d'IA.",
          code: 'EMPTY_RESPONSE',
          fallbackAvailable: true,
        });
        return;
      }

      res.json({ reply, model: 'gemini-4-hydrogen' });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('[AquaMind /api/chat] Gemini API error:', errMsg);
      res.status(502).json({
        error: "Impossible de joindre l'assistant Gemini pour le moment.",
        code: 'UPSTREAM_ERROR',
        fallbackAvailable: true,
      });
    }
  });

  // Route de validation de demande de démo (/api/demo-request)
  app.post('/api/demo-request', (req: Request, res: Response) => {
    const parsed = demoRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Champs du formulaire invalides.',
        issues: parsed.error.issues,
      });
      return;
    }

    res.status(201).json({
      ok: true,
      receivedAt: new Date().toISOString(),
      lead: {
        name: parsed.data.name,
        company: parsed.data.company,
        sector: parsed.data.sector,
      },
    });
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
