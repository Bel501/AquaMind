import { useState } from 'react';
import { Send, Bot, User, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SupportedLocale } from '../i18n';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isFallback?: boolean;
}

function buildLocalFallbackAnswer(question: string, locale: SupportedLocale): string {
  const q = question.toLowerCase();
  if (locale === 'en') {
    if (q.includes('leak') || q.includes('underground') || q.includes('night')) {
      return 'AquaMind analyzes continuous 1-to-5 minute flow and pressure time series. Any overnight residual deviation above the ML baseline triggers an alert within 4 minutes with the exact pipeline zone.';
    }
    if (q.includes('roi') || q.includes('vineyard') || q.includes('hectare')) {
      return 'On a 150-hectare vineyard, AquaMind typically cuts irrigation water by 28–32% and pumping energy by 20%, delivering full ROI within one growing season.';
    }
    if (q.includes('sensor') || q.includes('probe') || q.includes('meter')) {
      return 'AquaMind connects via LoRaWAN, NB-IoT, Modbus, or pulse meters to existing soil moisture probes, flowmeters, pressure transducers, and weather stations.';
    }
    return 'AquaMind combines root-zone IoT telemetry, hyperlocal ET0 weather forecasts, and temporal neural models to forecast irrigation needs 7 days ahead and stop leaks early.';
  }

  if (locale === 'ar') {
    return 'يجمع AquaMind بين قياسات مستشعرات التربة والتدفق والطقس المحلي وتعلم الآلة الزمني للتنبؤ باحتياجات الري لـ 7 أيام وكشف التسربات خلال أقل من 4 دقائق.';
  }

  if (q.includes('fuite') || q.includes('nocturne') || q.includes('souterrain')) {
    return 'AquaMind compare en continu le débit et la pression mesurés à la signature temporelle attendue. Toute dérive nocturne ou perte de charge déclenche une alerte en moins de 4 minutes avec localisation du tronçon.';
  }
  if (q.includes('roi') || q.includes('viticole') || q.includes('hectare')) {
    return 'Sur un domaine de 150 ha, nos modèles réduisent en moyenne les volumes irrigués de 28 à 32 % et le coût de pompage de 20 %, avec un retour sur investissement dès la première saison.';
  }
  if (q.includes('capteur') || q.includes('sonde') || q.includes('compatible')) {
    return 'La plateforme est agnostique matériel : sondes capacitives LoRaWAN, débitmètres ultrason/impulsion, capteurs de pression Modbus et stations météo locales.';
  }
  return "AquaMind combine sondes IoT d'humidité/débit, météo hyperlocale (ET0) et séries temporelles ML pour prédire les besoins d'irrigation à 7 jours et stopper chaque fuite.";
}

export function AquaMindAssistant({ locale }: { locale: SupportedLocale }) {
  const { t } = useTranslation();
  const suggestions = t('assistant.suggestions', { returnObjects: true }) as string[];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const sendQuestion = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);
    setFallbackNotice(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          locale,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = (await res.json()) as {
        reply?: string;
        error?: string;
        fallbackAvailable?: boolean;
      };

      if (!res.ok || !data.reply) {
        // Explicit notice + resilient local knowledge fallback
        setFallbackNotice(data.error || t('assistant.fallbackNotice'));
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            text: buildLocalFallbackAnswer(trimmed, locale),
            isFallback: true,
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: data.reply!,
        },
      ]);
    } catch {
      setFallbackNotice(t('assistant.fallbackNotice'));
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: buildLocalFallbackAnswer(trimmed, locale),
          isFallback: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendQuestion(input);
  };

  return (
    <div className="glass-panel rounded-[28px] p-6 sm:p-8 border-cyan-700/20 dark:border-[#22D3EE]/24">
      {/* Suggested questions */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        {suggestions.map((q) => (
          <button
            key={q}
            type="button"
            disabled={loading}
            onClick={() => void sendQuestion(q)}
            className="text-left text-xs sm:text-sm px-4 py-2 rounded-full bg-slate-100 dark:bg-[#05121F]/80 border border-slate-200 dark:border-[#22D3EE]/25 text-slate-700 dark:text-slate-200 hover:border-cyan-600 dark:hover:border-[#22D3EE] hover:text-cyan-800 dark:hover:text-[#22D3EE] transition-colors cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message thread */}
      {messages.length > 0 && (
        <div
          aria-live="polite"
          className="mb-5 max-h-[340px] overflow-y-auto space-y-3.5 pr-1"
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div
                    className="w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-600/35 dark:border-[#22D3EE]/35 grid place-items-center text-cyan-700 dark:text-[#22D3EE] shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-cyan-600 dark:bg-[#22D3EE] text-white dark:text-[#05121F] font-medium'
                      : 'bg-slate-100 dark:bg-[#05121F]/85 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {msg.text}
                </div>

                {isUser && (
                  <div
                    className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 grid place-items-center text-slate-700 dark:text-slate-200 shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <Bot size={15} className="text-cyan-600 dark:text-[#22D3EE]" aria-hidden="true" />
              <span>{t('assistant.thinking')}</span>
            </div>
          )}
        </div>
      )}

      {fallbackNotice && (
        <div
          role="status"
          className="mb-4 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/35 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2"
        >
          <Info size={15} className="shrink-0" aria-hidden="true" />
          <span>{fallbackNotice}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="aquamind-chat-input" className="sr-only">
          {t('assistant.placeholder')}
        </label>
        <input
          id="aquamind-chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('assistant.placeholder')}
          maxLength={1000}
          className="flex-1 px-4 py-3.5 rounded-xl bg-white/90 dark:bg-[#05121F]/85 border border-slate-300 dark:border-[#22D3EE]/24 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:border-cyan-600 dark:focus:border-[#22D3EE] focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        />
        <button
          type="submit"
          disabled={loading || input.trim().length < 2}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-br from-[#0891B2] to-[#0D9488] dark:from-[#22D3EE] dark:to-[#2DD4BF] text-white dark:text-[#05121F] font-display font-semibold text-sm inline-flex items-center justify-center gap-2 hover:shadow-[0_10px_28px_rgba(34,211,238,0.35)] transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>{t('assistant.send')}</span>
          <Send size={15} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
