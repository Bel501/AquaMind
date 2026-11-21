import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useZodFormValidation, type FieldErrorMap } from '../hooks/useZodFormValidation';
import { createDemoFormSchema } from '../lib/validation';
import { apiUrl } from '../lib/apiBase';
import { MagneticButton } from './MagneticButton';
import type { SelectedPlan } from './PricingSection';

type FormFieldName = 'name' | 'company' | 'sector' | 'email' | 'message';
type FormValues = Record<FormFieldName, string>;

const INITIAL_VALUES: FormValues = {
  name: '',
  company: '',
  sector: '',
  email: '',
  message: '',
};

const FIELD_ORDER: FormFieldName[] = ['name', 'company', 'sector', 'email', 'message'];

interface DemoFormProps {
  selectedPlan?: SelectedPlan | null;
  onClearPlan?: () => void;
  onOpenPrivacy?: () => void;
}

export function DemoForm({ selectedPlan, onClearPlan, onOpenPrivacy }: DemoFormProps) {
  const { t } = useTranslation();

  const demoSchema = useMemo(
    () =>
      createDemoFormSchema({
        nameMin: t('contact.form.errors.nameMin'),
        nameMax: t('contact.form.errors.nameMax'),
        companyMin: t('contact.form.errors.companyMin'),
        companyMax: t('contact.form.errors.companyMax'),
        sectorInvalid: t('contact.form.errors.sectorInvalid'),
        emailInvalid: t('contact.form.errors.emailInvalid'),
        messageMin: t('contact.form.errors.messageMin'),
        messageMax: t('contact.form.errors.messageMax'),
      }),
    [t]
  );

  const {
    values,
    touched,
    errors: fieldErrors,
    handleChange,
    handleBlur,
    validateForm,
    setExternalErrors,
    resetForm,
  } = useZodFormValidation({
    schema: demoSchema,
    initialValues: INITIAL_VALUES,
    fieldOrder: FIELD_ORDER,
  });

  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{
    id?: number;
    name: string;
    company: string;
  } | null>(null);

  const lastPrefilledMsgRef = useRef<string>('');
  const fieldRefs = useRef<
    Partial<Record<FormFieldName, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>>
  >({});

  useEffect(() => {
    if (!selectedPlan) return;
    handleChange('sector', selectedPlan.sector);
    const currentTrimmed = values.message.trim();
    if (!currentTrimmed || currentTrimmed === lastPrefilledMsgRef.current) {
      const billingSuffix =
        selectedPlan.billing === 'annual' ? t('pricing.annual') : t('pricing.monthly');
      const nextMsg = `${selectedPlan.prefillMessage} (${selectedPlan.name} — ${billingSuffix})`;
      lastPrefilledMsgRef.current = nextMsg;
      handleChange('message', nextMsg);
    }
    setSubmitted(null);
    setServerError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlan]);

  const onFieldChange = (field: FormFieldName, nextValue: string) => {
    handleChange(field, nextValue);
    if (serverError) setServerError('');
    if (submitted) setSubmitted(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError('');
    setSubmitted(null);

    const validation = validateForm();
    if (!validation.success) {
      if (validation.firstInvalidField) {
        fieldRefs.current[validation.firstInvalidField]?.focus();
      }
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(apiUrl('/api/demo-request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
      });

      const payload = (await res.json()) as {
        id?: number;
        error?: string;
        issues?: Array<{ path?: Array<string | number>; message?: string }>;
      };

      if (!res.ok) {
        if (Array.isArray(payload.issues) && payload.issues.length > 0) {
          const nextServerFieldErrors: FieldErrorMap<FormValues> = {};
          for (const issue of payload.issues) {
            const key = issue.path?.[0] as FormFieldName | undefined;
            if (key && issue.message && !nextServerFieldErrors[key]) {
              nextServerFieldErrors[key] = issue.message;
            }
          }
          setExternalErrors(nextServerFieldErrors);
        }
        setServerError(payload.error || t('contact.form.errors.serverFallback'));
        return;
      }

      setSubmitted({
        id: payload.id,
        name: String(validation.data.name),
        company: String(validation.data.company),
      });
      resetForm();
      lastPrefilledMsgRef.current = '';
      onClearPlan?.();
    } catch {
      setServerError(t('contact.form.errors.networkFallback'));
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldClass = (field: FormFieldName) => {
    const hasError = Boolean(fieldErrors[field]);
    const isValid = Boolean(touched[field]) && !hasError && values[field].trim().length > 0;
    const base =
      'w-full px-4 py-3 rounded-xl bg-white/95 dark:bg-[#05121F]/85 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 transition-colors border';

    if (hasError) {
      return `${base} border-rose-500 dark:border-[#FB7185] focus:border-rose-600 focus:ring-rose-500/20`;
    }
    if (isValid) {
      return `${base} border-emerald-500/70 dark:border-[#2DD4BF]/55 focus:border-cyan-600 dark:focus:border-[#22D3EE] focus:ring-cyan-500/20`;
    }
    return `${base} border-slate-300 dark:border-[#22D3EE]/24 focus:border-cyan-600 dark:focus:border-[#22D3EE] focus:ring-cyan-500/20`;
  };

  const renderFieldError = (field: FormFieldName, errorId: string) => {
    const msg = fieldErrors[field];
    if (!msg) return null;
    return (
      <span
        id={errorId}
        role="alert"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-[#FB7185] mt-0.5"
      >
        <AlertCircle size={13} className="shrink-0" aria-hidden="true" />
        <span>{msg}</span>
      </span>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      {selectedPlan && (
        <div className="px-4 py-2.5 rounded-xl bg-sky-50/90 dark:bg-[#081C30] border border-cyan-600/35 dark:border-[#22D3EE]/35 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <span className="text-[#082F4E] dark:text-slate-100 font-medium">
            {t('contact.form.selectedPlanLabel')} :{' '}
            <strong className="text-cyan-700 dark:text-[#22D3EE]">{selectedPlan.name}</strong>{' '}
            <span className="text-slate-500 dark:text-slate-400">
              ({selectedPlan.billing === 'annual' ? t('pricing.annual') : t('pricing.monthly')})
            </span>
          </span>
          {onClearPlan && (
            <button
              type="button"
              onClick={onClearPlan}
              aria-label={t('contact.form.clearPlan')}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X size={14} aria-hidden="true" />
              <span>{t('contact.form.clearPlan')}</span>
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-name" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('contact.form.nameLabel')}
          </label>
          <input
            ref={(el) => {
              fieldRefs.current.name = el;
            }}
            id="lead-name"
            name="name"
            type="text"
            value={values.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder={t('contact.form.namePlaceholder')}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'lead-name-error' : undefined}
            className={getFieldClass('name')}
          />
          {renderFieldError('name', 'lead-name-error')}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-company" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('contact.form.companyLabel')}
          </label>
          <input
            ref={(el) => {
              fieldRefs.current.company = el;
            }}
            id="lead-company"
            name="company"
            type="text"
            value={values.company}
            onChange={(e) => onFieldChange('company', e.target.value)}
            onBlur={() => handleBlur('company')}
            placeholder={t('contact.form.companyPlaceholder')}
            aria-invalid={Boolean(fieldErrors.company)}
            aria-describedby={fieldErrors.company ? 'lead-company-error' : undefined}
            className={getFieldClass('company')}
          />
          {renderFieldError('company', 'lead-company-error')}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-sector" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('contact.form.sectorLabel')}
          </label>
          <select
            ref={(el) => {
              fieldRefs.current.sector = el;
            }}
            id="lead-sector"
            name="sector"
            value={values.sector}
            onChange={(e) => onFieldChange('sector', e.target.value)}
            onBlur={() => handleBlur('sector')}
            aria-invalid={Boolean(fieldErrors.sector)}
            aria-describedby={fieldErrors.sector ? 'lead-sector-error' : undefined}
            className={getFieldClass('sector')}
          >
            <option value="" disabled>
              {t('contact.form.sectorPlaceholder')}
            </option>
            <option value="agriculture">{t('contact.form.sectorOptions.agriculture')}</option>
            <option value="hotellerie">{t('contact.form.sectorOptions.hotellerie')}</option>
            <option value="industrie">{t('contact.form.sectorOptions.industrie')}</option>
            <option value="autre">{t('contact.form.sectorOptions.autre')}</option>
          </select>
          {renderFieldError('sector', 'lead-sector-error')}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-email" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('contact.form.emailLabel')}
          </label>
          <input
            ref={(el) => {
              fieldRefs.current.email = el;
            }}
            id="lead-email"
            name="email"
            type="email"
            value={values.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder={t('contact.form.emailPlaceholder')}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'lead-email-error' : undefined}
            className={getFieldClass('email')}
          />
          {renderFieldError('email', 'lead-email-error')}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="lead-message" className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {t('contact.form.messageLabel')}
        </label>
        <textarea
          ref={(el) => {
            fieldRefs.current.message = el;
          }}
          id="lead-message"
          name="message"
          rows={3}
          value={values.message}
          onChange={(e) => onFieldChange('message', e.target.value)}
          onBlur={() => handleBlur('message')}
          placeholder={t('contact.form.messagePlaceholder')}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? 'lead-message-error' : undefined}
          className={getFieldClass('message')}
        />
        {renderFieldError('message', 'lead-message-error')}
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

      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center">
        {t('contact.form.rgpdNotice')}{' '}
        {onOpenPrivacy && (
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="underline underline-offset-2 text-cyan-700 dark:text-[#22D3EE] hover:opacity-80 cursor-pointer font-medium"
          >
            {t('contact.form.rgpdLink')}
          </button>
        )}
      </p>

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
            {submitted.id ? ` (#${submitted.id})` : ''}
          </span>
        </div>
      )}
    </form>
  );
}
