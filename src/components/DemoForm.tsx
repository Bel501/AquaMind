import { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { MagneticButton } from './MagneticButton';

const demoSchema = z.object({
  name: z.string().trim().min(2, 'Nom requis (2 caractères min.).').max(120),
  company: z.string().trim().min(2, 'Entreprise requise (2 caractères min.).').max(160),
  sector: z.enum(['agriculture', 'hotellerie', 'industrie', 'autre'], {
    error: 'Veuillez sélectionner un secteur.',
  }),
  email: z.string().trim().email('Adresse email professionnelle invalide.'),
  message: z
    .string()
    .trim()
    .min(5, 'Précisez votre besoin en quelques mots (5 caractères min.).')
    .max(1500),
});

type FormErrors = Partial<Record<'name' | 'company' | 'sector' | 'email' | 'message', string>>;

export function DemoForm() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [sector, setSector] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ name: string; company: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setServerError('');
    setSubmitted(null);

    const parsed = demoSchema.safeParse({
      name,
      company,
      sector,
      email,
      message,
    });

    if (!parsed.success) {
      const nextErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormErrors | undefined;
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        setServerError(payload.error || "Une erreur est survenue lors de l'envoi.");
        return;
      }

      setSubmitted({ name: parsed.data.name, company: parsed.data.company });
      setName('');
      setCompany('');
      setSector('');
      setEmail('');
      setMessage('');
    } catch {
      setServerError('Impossible de joindre le serveur. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-white/90 dark:bg-[#05121F]/85 border border-slate-300 dark:border-[#22D3EE]/24 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:border-cyan-600 dark:focus:border-[#22D3EE] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-name" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('contact.form.nameLabel')}
          </label>
          <input
            id="lead-name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('contact.form.namePlaceholder')}
            aria-invalid={Boolean(fieldErrors.name)}
            className={inputClass}
          />
          {fieldErrors.name && (
            <span className="text-xs text-rose-600 dark:text-[#FB7185]">{fieldErrors.name}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-company" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('contact.form.companyLabel')}
          </label>
          <input
            id="lead-company"
            name="company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder={t('contact.form.companyPlaceholder')}
            aria-invalid={Boolean(fieldErrors.company)}
            className={inputClass}
          />
          {fieldErrors.company && (
            <span className="text-xs text-rose-600 dark:text-[#FB7185]">{fieldErrors.company}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-sector" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('contact.form.sectorLabel')}
          </label>
          <select
            id="lead-sector"
            name="sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            aria-invalid={Boolean(fieldErrors.sector)}
            className={inputClass}
          >
            <option value="" disabled>
              {t('contact.form.sectorPlaceholder')}
            </option>
            <option value="agriculture">{t('contact.form.sectorOptions.agriculture')}</option>
            <option value="hotellerie">{t('contact.form.sectorOptions.hotellerie')}</option>
            <option value="industrie">{t('contact.form.sectorOptions.industrie')}</option>
            <option value="autre">{t('contact.form.sectorOptions.autre')}</option>
          </select>
          {fieldErrors.sector && (
            <span className="text-xs text-rose-600 dark:text-[#FB7185]">{fieldErrors.sector}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-email" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('contact.form.emailLabel')}
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('contact.form.emailPlaceholder')}
            aria-invalid={Boolean(fieldErrors.email)}
            className={inputClass}
          />
          {fieldErrors.email && (
            <span className="text-xs text-rose-600 dark:text-[#FB7185]">{fieldErrors.email}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="lead-message" className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {t('contact.form.messageLabel')}
        </label>
        <textarea
          id="lead-message"
          name="message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('contact.form.messagePlaceholder')}
          aria-invalid={Boolean(fieldErrors.message)}
          className={inputClass}
        />
        {fieldErrors.message && (
          <span className="text-xs text-rose-600 dark:text-[#FB7185]">{fieldErrors.message}</span>
        )}
      </div>

      {serverError && (
        <div
          role="alert"
          className="px-4 py-3 rounded-xl bg-rose-500/12 border border-rose-500/45 text-rose-700 dark:text-[#FB7185] text-sm flex items-center gap-2"
        >
          <AlertCircle size={17} className="shrink-0" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="pt-1">
        <MagneticButton type="submit" variant="primary" disabled={submitting} className="w-full">
          {submitting ? t('contact.form.submitting') : t('contact.form.submit')}
        </MagneticButton>
      </div>

      {submitted && (
        <div
          role="status"
          aria-live="polite"
          className="px-4 py-3.5 rounded-xl bg-teal-500/12 border border-teal-600/45 dark:border-[#2DD4BF]/45 text-teal-800 dark:text-[#2DD4BF] text-sm flex items-start gap-2.5"
        >
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            {t('contact.form.successPrefix')} {submitted.name} !{' '}
            {t('contact.form.successBody', { company: submitted.company })}
          </span>
        </div>
      )}
    </form>
  );
}
