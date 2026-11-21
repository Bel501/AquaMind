import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Bot, RotateCcw, Send, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SupportedLocale } from '../i18n';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export function AquaMindAssistant({ locale }: { locale: SupportedLocale }) {
  const { t } = useTranslation();
  const suggestions = t('assistant.suggestions', { returnObjects: true }) as string[];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedQuestion, setFailedQuestion] = useState<string | null>(null);

  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendQuestion = async (rawText: string, isRetry = false) => {
    const trimmed = rawText.trim();
    if (!trimmed || loading) return;

    const historySnapshot = messages.slice(-6).map((m) => ({
      role: m.role,
      text: m.text,
    }));

    if (!isRetry) {
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        text: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
    }

    setLoading(true);
    setErrorMessage(null);
    setFailedQuestion(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          locale,
          history: historySnapshot,
        }),
      });

      const data = (await res.json()) as {
        reply?: string;
        error?: string;
      };

      if (!res.ok || !data.reply) {
        setErrorMessage(data.error || t('assistant.fallbackNotice'));
        setFailedQuestion(trimmed);
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
      setErrorMessage(
        locale === 'en'
          ? 'Unable to reach AquaMind AI server. Please try again.'
          : locale === 'ar'
          ? 'تعذر الاتصال بخادم AquaMind AI. يرجى المحاولة مجددًا.'
          : "Impossible de joindre le serveur AquaMind AI. Veuillez réessayer."
      );
      setFailedQuestion(trimmed);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendQuestion(input);
  };

  const retryLabel =
    locale === 'en' ? 'Retry' : locale === 'ar' ? 'إعادة المحاولة' : 'Réessayer';

  return (
    <div className="glass-panel rounded-[28px] p-6 sm:p-8 border-sky-200 dark:border-[#22D3EE]/24 bg-white/95 dark:bg-[#081C30]/90">
      {/* Suggested questions */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        {suggestions.map((q) => (
          <button
            key={q}
            type="button"
            disabled={loading}
            onClick={() => void sendQuestion(q)}
            className="text-start text-xs sm:text-sm px-4 py-2 rounded-full bg-sky-50/90 dark:bg-[#05121F]/80 border border-sky-200 dark:border-[#22D3EE]/25 text-[#082F4E] dark:text-slate-200 hover:border-[#0284C7] dark:hover:border-[#22D3EE] hover:text-[#0284C7] dark:hover:text-[#22D3EE] transition-colors cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message thread */}
      {(messages.length > 0 || loading) && (
        <div
          ref={threadRef}
          aria-live="polite"
          className="mb-5 max-h-[340px] overflow-y-auto space-y-3.5 pe-1"
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
                    className="w-8 h-8 rounded-full bg-sky-500/15 border border-sky-600/35 dark:border-[#22D3EE]/35 grid place-items-center text-[#0284C7] dark:text-[#22D3EE] shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-[#082F4E] dark:bg-[#22D3EE] text-white dark:text-[#05121F] font-medium'
                      : 'bg-slate-50 dark:bg-[#05121F]/85 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200'
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
              <Bot size={15} className="text-[#0284C7] dark:text-[#22D3EE]" aria-hidden="true" />
              <span>{t('assistant.thinking')}</span>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mb-4 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-3"
        >
          <span className="inline-flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </span>

          {failedQuestion && (
            <button
              type="button"
              disabled={loading}
              onClick={() => void sendQuestion(failedQuestion, true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={13} aria-hidden="true" />
              <span>{retryLabel}</span>
            </button>
          )}
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
          className="flex-1 px-4 py-3.5 rounded-xl bg-white dark:bg-[#05121F]/85 border border-slate-300 dark:border-[#22D3EE]/24 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:border-cyan-600 dark:focus:border-[#22D3EE] focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        />
        <button
          type="submit"
          disabled={loading || input.trim().length < 2}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-br from-[#082F4E] to-[#0284C7] dark:from-[#22D3EE] dark:to-[#2DD4BF] text-white dark:text-[#05121F] font-display font-semibold text-sm inline-flex items-center justify-center gap-2 hover:shadow-[0_10px_28px_rgba(2,132,199,0.3)] transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>{t('assistant.send')}</span>
          <Send size={15} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
